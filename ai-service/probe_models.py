import os, json, urllib.request
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("GROQ_API_KEY")

candidates = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "llama-3.3-70b-specdec",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
]
body = json.dumps({
    "messages": [{"role": "user", "content": "Reply with just the word: ok"}],
    "max_tokens": 5,
}).encode()
for model in candidates:
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        r = urllib.request.urlopen(req, timeout=25)
        print(f"OK    {model}")
    except urllib.error.HTTPError as e:
        print(f"FAIL  {model}  -> {e.code} {e.reason}")
    except Exception as e:
        print(f"ERR   {model}  -> {e}")
