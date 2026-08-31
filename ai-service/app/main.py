"""FastAPI app exposing POST /chat (RAG) and a health check.

Security posture:
- Binds to 127.0.0.1 by default (the Next.js proxy talks to it locally); set
  CHAT_API_HOST=0.0.0.0 only if you intentionally expose it.
- CORS restricted to the local frontend origins and a minimal method/header set.
- /chat returns a GENERIC 503 on any backend failure (no upstream error leakage).
- A small in-memory rate limiter caps abuse (per-client, burst + refill).
"""
import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import CHAT_API_HOST, CHAT_API_PORT
from app.models import ChatRequest, ChatResponse, Source
from app.rag.chain import build_chain, extract_sources
from app.rag.vectorstore import get_vectorstore

app = FastAPI(title="MeroBhawishya Chat RAG", version="0.2.0")

# Restrict to the local frontend origins only.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
    max_age=600,
)

# ── Rate limiter: 8 requests / 60s per client IP, with a small burst ──────────
_RATE = defaultdict(lambda: {"count": 0, "reset": 0.0})
_RATE_LIMIT = 8
_RATE_WINDOW = 60.0


def _rate_ok(client_ip: str) -> bool:
    now = time.time()
    st = _RATE[client_ip]
    if now > st["reset"]:
        st["count"] = 0
        st["reset"] = now + _RATE_WINDOW
    if st["count"] >= _RATE_LIMIT:
        return False
    st["count"] += 1
    return True


_chain = None


def _get_chain():
    global _chain
    if _chain is None:
        _chain = build_chain()
    return _chain


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, request: Request) -> ChatResponse:
    # Rate limit by client IP (proxy forwards X-Forwarded-For when present).
    client_ip = request.client.host if request.client else "unknown"
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        client_ip = fwd.split(",")[0].strip()
    if not _rate_ok(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")

    try:
        chain = _get_chain()
        retriever = get_vectorstore().as_retriever(search_kwargs={"k": 5})
        retrieved = retriever.invoke(req.message)
        answer = chain(req.message, req.history)  # type: ignore[call-arg]
    except HTTPException:
        raise
    except Exception:
        # Never leak upstream provider/API errors to the client.
        raise HTTPException(status_code=503, detail="Chat service temporarily unavailable.")

    sources = [
        Source(title=s.get("title", ""), url=s.get("url"), type=s.get("type"))
        for s in extract_sources(retrieved)
    ]
    return ChatResponse(answer=answer, sources=sources)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=CHAT_API_HOST, port=CHAT_API_PORT)
