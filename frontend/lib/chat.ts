export interface ChatSource {
  title: string;
  url?: string | null;
  type?: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

/**
 * Send a message to the MeroBhawishya RAG chat service via the Next.js proxy
 * (frontend/app/api/chat/route.ts → Python FastAPI :8000).
 */
export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[]
): Promise<{ answer: string; sources: ChatSource[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}
