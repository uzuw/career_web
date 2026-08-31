import os, json, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("OPENROUTER_API_KEY")
print("key prefix:", key[:12] if key else None)

req = urllib.request.Request(
    "https://openrouter.ai/api/v1/models",
    headers={"Authorization": f"Bearer {key}"},
)
try:
    d = json.load(urllib.request.urlopen(req, timeout=30))
    free = [m["id"] for m in d.get("data", []) if ":free" in m["id"]]
    print(f"\n{len(free)} FREE models available on this account:")
    for fid in free:
        print("  ", fid)
    # also show any llama-3 8b variants
    print("\nllama-3 8b variants:")
    for m in d.get("data", []):
        if "llama-3" in m["id"] and "8b" in m["id"]:
            print("  ", m["id"], "(free)" if ":free" in m["id"] else "")
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode()[:200])
except Exception as e:
    print("ERR", e)
