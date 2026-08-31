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
 * Stream a chat reply from the MeroBhawishya RAG service (Server-Sent Events).
 * Calls `onToken` for each text chunk and `onDone` once with the final sources.
 */
export async function streamChatMessage(
  message: string,
  history: { role: string; content: string }[],
  onToken: (chunk: string) => void,
  onDone: (sources: ChatSource[]) => void,
  onError: (msg: string) => void
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok || !res.body) {
    onError("The guidance service is currently unavailable.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line. Process complete events.
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const payload = line.slice(6).trim();
      if (!payload) continue;
      try {
        const event = JSON.parse(payload);
        if (event.token) onToken(event.token);
        if (event.sources) onDone(event.sources);
        if (event.error) onError(event.error);
        if (event.done) return;
      } catch {
        // ignore malformed frame
      }
    }
  }
}
