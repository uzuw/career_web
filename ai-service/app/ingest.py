"""One-off ingestion script: build the vector index from the seed corpus.

Run with:  python -m app.ingest
(Only after `pip install -r requirements.txt` and setting keys in .env.)
"""
from app.data.corpus_loader import load_corpus_documents
from app.rag.embeddings import get_embeddings
from app.rag.vectorstore import get_vectorstore


def ingest() -> int:
    docs = load_corpus_documents()
    if not docs:
        raise SystemExit("No corpus documents found. Check src/seed/data/*.json paths.")
    vs = get_vectorstore()
    vs.add_documents(docs)
    return len(docs)


if __name__ == "__main__":
    from app.config import COLLECTION_NAME

    n = ingest()
    print(f"Ingested {n} documents into the {COLLECTION_NAME} collection.")
