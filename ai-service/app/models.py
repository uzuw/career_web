"""Pydantic request/response models for the chat API."""
from typing import List, Optional

from pydantic import BaseModel, Field


class Source(BaseModel):
    title: str = ""
    url: Optional[str] = None
    type: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    # Optional prior turns: [{"role": "user" | "assistant", "content": "..."}]
    history: List[dict] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)
