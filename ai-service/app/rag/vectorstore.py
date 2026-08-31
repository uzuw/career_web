"""Vector store factory: Chroma (local) or Pinecone (managed)."""
from app.config import (
    CHROMA_PERSIST_DIR,
    COLLECTION_NAME,
    PINECONE_API_KEY,
    PINECONE_INDEX,
    VECTORSTORE,
)
from app.rag.embeddings import get_embeddings


def get_vectorstore():
    embeddings = get_embeddings()
    if VECTORSTORE == "pinecone":
        from langchain_pinecone import PineconeVectorStore
        import pinecone

        pinecone.Pinecone(api_key=PINECONE_API_KEY)
        return PineconeVectorStore(index_name=PINECONE_INDEX, embedding=embeddings)
    # default: Chroma (persisted to disk)
    from langchain_chroma import Chroma

    return Chroma(
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )
