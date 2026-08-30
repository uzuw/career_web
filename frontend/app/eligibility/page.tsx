import { EligibilityWizard } from "@/components/EligibilityWizard";

export default function EligibilityPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Am I eligible?</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>A quick check across careers and colleges. Honest, no sign-up.</p>
      <div className="mt-6">
        <EligibilityWizard />
      </div>
    </div>
  );
}
