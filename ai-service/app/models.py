"""Pydantic request/response models for the chat API."""
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, constr

MAX_MESSAGE_LEN = 2000


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: constr(max_length=MAX_MESSAGE_LEN)  # type: ignore[valid-type]


class Source(BaseModel):
    title: str = ""
    url: Optional[str] = None
    type: Optional[str] = None


class ChatRequest(BaseModel):
    message: constr(strip_whitespace=True, max_length=MAX_MESSAGE_LEN)  # type: ignore[valid-type]
    history: List[ChatTurn] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)
