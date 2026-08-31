"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamChatMessage, type ChatMessage, type ChatSource } from "@/lib/chat";

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I'm MeroBhawishya's guidance assistant. Ask me about +2 Science careers, colleges, entrance exams, or scholarships in Nepal.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    // Create a placeholder assistant message that we fill with streamed tokens.
    const assistantId = Date.now();
    setMessages((m) => [...m, { role: "assistant", content: "", sources: [], id: assistantId } as any]);

    try {
      await streamChatMessage(
        text,
        history,
        // append each token to the placeholder message
        (chunk) =>
          setMessages((m) =>
            m.map((msg) =>
              (msg as any).id === assistantId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          ),
        // onDone: attach sources
        (sources) =>
          setMessages((m) =>
            m.map((msg) =>
              (msg as any).id === assistantId ? { ...msg, sources } : msg
            )
          ),
        // onError
        (err) =>
          setMessages((m) =>
            m.map((msg) =>
              (msg as any).id === assistantId
                ? { ...msg, content: err }
                : msg
            )
          )
      );
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          (msg as any).id === assistantId
            ? {
                ...msg,
                content:
                  "Sorry, the guidance service is unavailable right now. Please try again later.",
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
        style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
        aria-label="Open guidance chat"
      >
        <Sparkles size={16} /> {open ? "Close" : "Ask"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[70vh] w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl border bg-[var(--panel)] shadow-2xl" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2 font-grotesk font-bold">
              <Sparkles size={16} style={{ color: "#6366f1" }} /> Career Guidance
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} style={{ color: "var(--mut)" }} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[85%] rounded-2xl px-3 py-2"
                  style={
                    m.role === "user"
                      ? { background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "white" }
                      : { background: "var(--bg)", border: "1px solid var(--line)" }
                  }
                >
                  <div className="markdown whitespace-pre-wrap leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.map((s: ChatSource, j) => (
                        <a
                          key={j}
                          href={s.url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] text-[var(--mut)] hover:bg-black/10"
                        >
                          {s.title || s.type} <ExternalLink size={9} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2" style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: "var(--line)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about careers, colleges, exams…"
              className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6366f1]"
              style={{ borderColor: "var(--line)", background: "var(--bg)" }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-xl p-2 text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)" }}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
