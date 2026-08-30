"use client";

import { useState } from "react";
import { Compass, CheckCircle2, Building2, GraduationCap, Loader2 } from "lucide-react";

export function EligibilityWizard() {
  const [stream, setStream] = useState("Science");
  const [combo, setCombo] = useState("+2 Science (Math)");
  const [gpa, setGpa] = useState("3.0");
  const [budget, setBudget] = useState("");
  const [district, setDistrict] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResult(null);
    try {
      const qs = new URLSearchParams({ stream, subjectCombo: combo, gpa, ...(budget ? { budget } : {}), ...(district ? { district } : {}) }).toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/eligibility?${qs}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="bento p-6 lg:col-span-5">
        <h2 className="font-grotesk text-lg font-bold">Check your eligibility</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--mut)" }}>Tell us your background — we match careers and colleges you qualify for.</p>
        <div className="space-y-3">
          <label className="block text-sm font-medium">Stream
            <select value={stream} onChange={(e) => setStream(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <option>Science</option><option>Management</option><option>Humanities</option>
            </select>
          </label>
          <label className="block text-sm font-medium">Subject combination
            <input value={combo} onChange={(e) => setCombo(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }} />
          </label>
          <label className="block text-sm font-medium">GPA (0–4)
            <input value={gpa} onChange={(e) => setGpa(e.target.value)} type="number" step="0.1" min="0" max="4" className="mt-1 w-full rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }} />
          </label>
          <label className="block text-sm font-medium">Budget (NPR, optional)
            <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 1500000" className="mt-1 w-full rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }} />
          </label>
          <label className="block text-sm font-medium">District (optional)
            <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Lalitpur" className="mt-1 w-full rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }} />
          </label>
          <button onClick={run} disabled={loading} className="gradient-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />} Check now
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <div className="lg:col-span-7">
        {result ? (
          <div className="space-y-4">
            <div className="bento p-5">
              <h3 className="font-grotesk text-base font-bold">Eligible careers ({result.eligibleCareers?.length ?? 0})</h3>
              <div className="mt-2 space-y-2">
                {result.eligibleCareers?.map((c: any) => (
                  <div key={c.slug} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--line)" }}>
                    <CheckCircle2 size={15} style={{ color: "#16a34a" }} />
                    <span className="font-semibold">{c.title}</span>
                    {c.reasons?.map((r: string, i: number) => <span key={i} className="text-xs" style={{ color: "var(--mut)" }}>· {r}</span>)}
                  </div>
                ))}
                {result.eligibleCareers?.length === 0 && <p className="text-sm" style={{ color: "var(--mut)" }}>No matches — try a higher GPA or broader filters.</p>}
              </div>
            </div>
            <div className="bento p-5">
              <h3 className="flex items-center gap-1.5 font-grotesk text-base font-bold"><Building2 size={16} /> Matching colleges ({result.colleges?.length ?? 0})</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.colleges?.map((c: any) => (
                  <span key={c.slug} className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium" style={{ borderColor: "var(--line)" }}>
                    <GraduationCap size={13} style={{ color: "var(--brand)" }} /> {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bento flex h-full min-h-[300px] items-center justify-center p-6 text-center text-sm" style={{ color: "var(--mut)" }}>
            Fill in your details and hit “Check now” to see careers and colleges you qualify for.
          </div>
        )}
      </div>
    </div>
  );
}
