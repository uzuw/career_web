"""Isolate which layer fails: embeddings / vectorstore / retriever / llm."""
import os, sys
from dotenv import load_dotenv
load_dotenv()

print("STEP 0: env")
from app.config import LLM_PROVIDER, EMBEDDINGS_MODEL, VECTORSTORE, COLLECTION_NAME
print(f"  LLM_PROVIDER={LLM_PROVIDER}  EMBEDDINGS={EMBEDDINGS_MODEL}  VECTORSTORE={VECTORSTORE}  COLLECTION={COLLECTION_NAME}")

print("STEP 1: embeddings model loads")
try:
    from app.rag.embeddings import get_embeddings
    emb = get_embeddings()
    v = emb.embed_query("test")
    print(f"  OK  embedding dim={len(v)}")
except Exception as e:
    print("  FAIL", repr(e)); sys.exit(1)

print("STEP 2: vectorstore connects + has docs")
try:
    from app.rag.vectorstore import get_vectorstore
    vs = get_vectorstore()
    coll = vs._collection
    n = coll.count()
    print(f"  OK  documents in index = {n}")
    if n == 0:
        print("  WARN: index is EMPTY — run `python -m app.ingest`")
except Exception as e:
    print("  FAIL", repr(e)); sys.exit(1)

print("STEP 3: retriever returns chunks for a query")
try:
    retriever = vs.as_retriever(search_kwargs={"k": 5})
    docs = retriever.invoke("MBBS entrance exam Nepal")
    print(f"  OK  retrieved {len(docs)} chunks; first title={docs[0].metadata.get('name') if docs else None}")
except Exception as e:
    print("  FAIL", repr(e)); sys.exit(1)

print("STEP 4: LLM call (the Groq key)")
try:
    from app.rag.llm import get_llm
    llm = get_llm()
    out = llm.invoke("Reply with the single word: ok")
    print(f"  OK  LLM responded: {str(out.content)[:60]!r}")
except Exception as e:
    print("  FAIL (this is the LLM/key layer):", repr(e))
    sys.exit(2)

print("\nALL LAYERS OK — pipeline works end to end.")
