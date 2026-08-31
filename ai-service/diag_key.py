import os, json, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("GROQ_API_KEY")

# Try a few currently-common Groq models to isolate key-vs-model issue.
models = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "gemma2-9b-it",
]
body = json.dumps({
    "model": None,  # set per iteration
    "messages": [{"role": "user", "content": "reply with the single word: ok"}],
    "max_tokens": 5,
}).encode()

print(f"key present: {bool(key)}  len={len(key) if key else 0}")
for m in models:
    payload = json.loads(body.decode()); payload["model"] = m
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        r = urllib.request.urlopen(req, timeout=25)
        print(f"OK    {m}")
    except urllib.error.HTTPError as e:
        # read body to classify 401/403/404
        err = e.read().decode()[:160]
        print(f"{e.code}  {m}  -> {err}")
    except Exception as e:
        print(f"ERR   {m} -> {e}")
