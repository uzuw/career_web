"""FastAPI app exposing POST /chat (streaming RAG) and a health check.

Security posture:
- Binds to 127.0.0.1 by default (the Next.js proxy talks to it locally); set
  CHAT_API_HOST=0.0.0.0 only if you intentionally expose it.
- CORS restricted to the local frontend origins and a minimal method/header set.
- /chat streams Server-Sent Events; any backend failure yields a single
  `data: {"error": "..."}` event (no upstream error leakage).
- A small in-memory rate limiter caps abuse (per-client, burst + refill).
"""
import json
import time
from collections import defaultdict
from typing import Iterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.config import CHAT_API_HOST, CHAT_API_PORT
from app.models import ChatRequest, Source
from app.rag.chain import build_chain, extract_sources
from app.rag.vectorstore import get_vectorstore

app = FastAPI(title="MeroBhawishya Chat RAG", version="0.3.0")

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


_chain_invoke = None
_chain_stream = None


def _get_chains():
    global _chain_invoke, _chain_stream
    if _chain_invoke is None:
        _chain_invoke, _chain_stream = build_chain()
    return _chain_invoke, _chain_stream


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat(req: ChatRequest, request: Request) -> StreamingResponse:
    client_ip = _client_ip(request)
    if not _rate_ok(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")

    def event_stream() -> Iterator[str]:
        try:
            _, stream = _get_chains()
            retriever = get_vectorstore().as_retriever(search_kwargs={"k": 5})
            retrieved = retriever.invoke(req.message)
            for token in stream(req.message, req.history):
                if token:  # skip empty delta frames (OpenRouter metadata deltas)
                    yield _sse({"token": token})
            sources = [
                Source(
                    title=s.get("title", ""),
                    url=s.get("url"),
                    type=s.get("type"),
                ).model_dump()
                for s in extract_sources(retrieved)
            ]
            yield _sse({"sources": sources})
            yield _sse({"done": True})
        except HTTPException as e:
            yield _sse({"error": e.detail})
        except Exception:
            # Never leak upstream provider/API errors to the client.
            yield _sse({"error": "Chat service temporarily unavailable."})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=CHAT_API_HOST, port=CHAT_API_PORT)
