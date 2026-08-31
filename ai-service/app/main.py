"""FastAPI app exposing POST /chat (RAG) and a health check.

The RAG chain is built lazily on first request so importing this module does
not require API keys or an index to be present (lets `uvicorn` boot for checks).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CHAT_API_HOST, CHAT_API_PORT
from app.models import ChatRequest, ChatResponse, Source
from app.rag.chain import build_chain, extract_sources
from app.rag.vectorstore import get_vectorstore

app = FastAPI(title="MeroBhawishya Chat RAG", version="0.1.0")

# Allow the Next.js frontend (default :3000) to call this service.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def chat(req: ChatRequest) -> ChatResponse:
    chain = _get_chain()
    retriever = get_vectorstore().as_retriever(search_kwargs={"k": 5})

    # Retrieve for citations, then answer via the chain.
    retrieved = retriever.invoke(req.message)
    answer = chain.invoke(req.message)

    sources = [
        Source(
            title=s.get("title", ""),
            url=s.get("url"),
            type=s.get("type"),
        )
        for s in extract_sources(retrieved)
    ]
    return ChatResponse(answer=answer, sources=sources)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=CHAT_API_HOST, port=CHAT_API_PORT)
