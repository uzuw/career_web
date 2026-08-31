"""Load the college/career/exam/alumni corpus into LangChain Documents.

Reads the canonical seed JSON files (same source the Node backend seeds Mongo from)
so the RAG index needs no running database. Each document keeps its `sourceUrls`
in metadata so the chat response can cite verified public sources.
"""
import glob
import json
import os

from typing import List

from langchain_core.documents import Document

# ai-service/app/data/corpus_loader.py -> ../../../src/seed/data
_SEED_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "src", "seed", "data")
)

# Fields we don't want dumped into the retrievable text body.
_SKIP = {"sourceUrls", "logoUrl", "lat", "lng", "geoSource", "_id", "verifiedDate"}


def _load_json(path: str):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _doc_text(item: dict) -> str:
    parts = []
    for k, v in item.items():
        if k in _SKIP:
            continue
        if isinstance(v, (list, dict)):
            v = json.dumps(v, ensure_ascii=False)
        parts.append(f"{k}: {v}")
    return "\n".join(parts)


def load_corpus_documents() -> List[Document]:
    docs: List[Document] = []
    for f in sorted(glob.glob(os.path.join(_SEED_DIR, "seed*.json"))):
        data = _load_json(f)
        for kind in ("colleges", "careers", "exams", "scholarships", "alumni", "roadmaps"):
            for item in data.get(kind, []):
                text = _doc_text(item)
                if not text.strip():
                    continue
                urls = item.get("sourceUrls", [])
                docs.append(
                    Document(
                        page_content=text,
                        metadata={
                            "type": kind,
                            "name": item.get("name")
                            or item.get("titleEn")
                            or item.get("title")
                            or "",
                            **({"sourceUrls": urls} if urls else {}),
                        },
                    )
                )
    return docs
