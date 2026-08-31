"""RAG pipeline: retrieve relevant corpus chunks, build a grounded prompt,
call the LLM, and return the answer with cited sources.

Structured (not executed) per request — no API calls happen at import time.
"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from app.config import COLLECTION_NAME  # noqa: F401 (kept for reference)
from app.rag.llm import get_llm
from app.rag.vectorstore import get_vectorstore

_SYSTEM = (
    "You are MeroBhawishya, a career-guidance assistant for +2 Science "
    "graduates in Nepal. Answer ONLY using the retrieved context. If the "
    "context does not contain the answer, say you don't know rather than "
    "guessing. Always cite the source titles/URLs you used. Be concise, "
    "honest, and student-friendly. Never encourage studying abroad over "
    "Nepali options unless the user explicitly asks."
)

_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", _SYSTEM),
        ("human", "Context:\n{context}\n\nQuestion: {question}"),
    ]
)


def _format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)


def build_chain():
    """Return a RAG chain: question -> {context, question} -> LLM -> answer."""
    retriever = get_vectorstore().as_retriever(search_kwargs={"k": 5})
    llm = get_llm()
    return (
        RunnableParallel(
            {"context": retriever | _format_docs, "question": RunnablePassthrough()}
        )
        | _PROMPT
        | llm
        | StrOutputParser()
    )


def extract_sources(docs):
    sources = []
    for d in docs:
        urls = d.metadata.get("sourceUrls", [])
        sources.append(
            {
                "title": d.metadata.get("name", ""),
                "url": urls[0] if urls else None,
                "type": d.metadata.get("type"),
            }
        )
    return sources
