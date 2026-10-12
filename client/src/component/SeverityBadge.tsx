import type { Severity } from "../types";

const styles: Record<Severity, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  high: "border-red-500/30 bg-red-500/10 text-red-300",
};

const labels: Record<Severity, string> = { low: "Low", medium: "Medium", high: "High" };

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}
