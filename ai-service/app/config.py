"""Centralised configuration loaded from environment / .env."""
import os

from dotenv import load_dotenv

load_dotenv()

# LLM
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "grok").lower()  # "grok" (xAI) or "groq"
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Embeddings
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Vector store
VECTORSTORE = os.getenv("VECTORSTORE", "chroma").lower()  # "chroma" or "pinecone"
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "merobhawishya_corpus")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "merobhawishya")

# Service
CHAT_API_HOST = os.getenv("CHAT_API_HOST", "127.0.0.1")
CHAT_API_PORT = int(os.getenv("CHAT_API_PORT", "8000"))

# LLM model name (provider-specific). Override to a model your key can access.
LLM_MODEL = os.getenv("LLM_MODEL", "")

# Corpus
CORPUS_SOURCE = os.getenv("CORPUS_SOURCE", "json").lower()  # "json" or "mongo"
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/college_choices")
