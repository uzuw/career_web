import os, json, urllib.request, urllib.error
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GROQ_API_KEY")

URL = "https://api.groq.com/openai/v1/chat/completions"
H = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

# cheap candidates + the one from your snippet
candidates = [
    "llama-3.1-8b-instant",  # canonical cheap Groq model
    "llama-3.3-70b-versatile",
    "gemma2-9b-it",
    "llama3-8b-8192",
    "llama-3.2-3b-preview",
    "deepseek-r1-distill-llama-70b",
    "openai/gpt-oss-120b",  # the model your snippet uses
]

for m in candidates:
    payload = {
        "model": m,
        "messages": [{"role": "user", "content": "reply with the single word: ok"}],
        "max_completion_tokens": 5,
    }
    req = urllib.request.Request(
        URL, data=json.dumps(payload).encode(), headers=H, method="POST"
    )
    try:
        r = urllib.request.urlopen(req, timeout=30)
        print(f"OK    {m}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        import re

        code = re.search(r'"code":\s*(\w+)', body)
        code = code.group(1) if code else "?"
        print(f"FAIL  {m:<34} HTTP {e.code}  code={code}  {body[:80]}")
    except Exception as e:
        print(f"ERR   {m} -> {e}")
