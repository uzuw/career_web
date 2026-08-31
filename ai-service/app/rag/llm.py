"""OpenAI-compatible chat client for xAI Grok or Groq.

Both providers expose an OpenAI-compatible `/chat/completions` endpoint, so a
single ChatOpenAI instance is reused with a different base_url + api_key.

- Grok → base_url = https://api.x.ai/v1   (LLM_PROVIDER=grok)
- Groq → base_url = https://api.groq.com/openai/v1  (LLM_PROVIDER=groq)
"""
from langchain_openai import ChatOpenAI

from app.config import (
    GROK_API_KEY,
    GROQ_API_KEY,
    LLM_MODEL,
    LLM_PROVIDER,
)

_PROVIDER_BASE_URLS = {
    "grok": "https://api.x.ai/v1",
    "groq": "https://api.groq.com/openai/v1",
}

_MODEL = {
    "grok": "grok-beta",
    "groq": "llama-3.3-70b-versatile",
}


def get_llm(temperature: float = 0.2) -> ChatOpenAI:
    provider = LLM_PROVIDER
    base_url = _PROVIDER_BASE_URLS.get(provider)
    if base_url is None:
        raise ValueError(f"Unknown LLM_PROVIDER '{provider}'. Use 'grok' or 'groq'.")

    api_key = GROK_API_KEY if provider == "grok" else GROQ_API_KEY
    if not api_key or api_key == "[REDACTED]":
        # No key yet → raise a clear error instead of sending '[REDACTED]'.
        raise RuntimeError(
            f"No API key set for LLM_PROVIDER='{provider}'. Provide "
            f"{'GROK_API_KEY' if provider == 'grok' else 'GROQ_API_KEY'} in .env."
        )

    model = LLM_MODEL or _MODEL[provider]
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=api_key,
        base_url=base_url,
        max_retries=2,
    )
