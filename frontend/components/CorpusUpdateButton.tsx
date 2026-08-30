"use client";

import { useState } from "react";
import { Flag, Send, Check } from "lucide-react";

export function CorpusUpdateButton({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit() {
    if (!note.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "College",
          entityId: slug,
          field: "general",
          note: note.trim(),
          reporter: "website",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("done");
      setNote("");
      setTimeout(() => setOpen(false), 1500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:border-brand"
          style={{ borderColor: "var(--line)" }}
        >
          <Flag size={15} style={{ color: "var(--brand)" }} /> Update our corpus
        </button>
      ) : (
        <div className="bento p-4">
          <label className="text-sm font-medium">Suggest a correction for <span className="font-semibold">{name}</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. tuition is NPR 1.2M total; new campus opened in Bhaktapur…"
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button onClick={submit} disabled={status === "sending"} className="gradient-btn flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {status === "done" ? <Check size={15} /> : <Send size={15} />} {status === "done" ? "Sent" : "Submit"}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium" style={{ color: "var(--mut)" }}>Cancel</button>
            {status === "error" && <span className="text-sm text-red-500">Failed — try again</span>}
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--mut)" }}>Public-source data can go stale. Your note goes to our review queue.</p>
        </div>
      )}
    </div>
  );
}
