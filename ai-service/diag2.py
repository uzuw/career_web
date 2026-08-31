import os, json, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("GROQ_API_KEY")
print("key prefix:", key[:8], "len:", len(key))

URL = "https://api.groq.com/openai/v1/chat/completions"
H = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

# Try the cheapest standard Groq model + the gpt-oss model from your snippet
for m in ["llama-3.1-8b-instant", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]:
    payload = {
        "model": m,
        "messages": [{"role": "user", "content": "reply with the word: ok"}],
        "max_completion_tokens": 5,
    }
    req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers=H, method="POST")
    try:
        r = urllib.request.urlopen(req, timeout=30)
        print(f"OK    {m}")
    except urllib.error.HTTPError as e:
        print(f"FAIL  {m}  HTTP {e.code}  {e.read().decode()[:160]}")
