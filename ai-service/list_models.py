import os, urllib.request, json
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("GROQ_API_KEY")
req = urllib.request.Request("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {key}"})
try:
    d = json.load(urllib.request.urlopen(req, timeout=20))
    ids = [m["id"] for m in d.get("data", [])]
    # surface the ones most likely usable for chat
    for m in ids:
        if "llama" in m or "mixtral" in m or "gemma" in m or "qwen" in m:
            print(m)
    print(f"\n(total {len(ids)} models)")
except Exception as e:
    print("ERR", e)
