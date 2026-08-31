"""Local HuggingFace embeddings (no API key required)."""
from langchain_huggingface import HuggingFaceEmbeddings

from app.config import EMBEDDINGS_MODEL


def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
