import { useState } from "react";
import { Check, ExternalLink, Loader2, Pencil, X } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { api, errMsg } from "../services/api";
import type { Issue, Severity } from "../types";
import SeverityBadge from "./SeverityBadge";

interface FormState {
  title: string;
  summary: string;
  rootCause: string;
  suggestedFix: string;
  severity: Severity;
  techStack: string[];
  steps: string;
}

const toForm = (i: Issue): FormState => ({
  title: i.title,
  summary: i.summary,
  rootCause: i.rootCause,
  suggestedFix: i.suggestedFix,
  severity: i.severity,
  techStack: [...i.techStack],
  steps: i.reproductionSteps.join("\n"),
});

const input =
  "w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

export default function IssueDraftCard({ issue }: { issue: Issue }) {
  const toast = useToast();
  const [current, setCurrent] = useState(issue);
  const [form, setForm] = useState(() => toForm(issue));
  const [editing, setEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [pushing, setPushing] = useState(false);
  const pushed = current.status === "pushed";

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
    if (tag && form.techStack.length < 8 && !form.techStack.includes(tag)) set("techStack", [...form.techStack, tag]);
    setTagInput("");
  };

  const saveEdits = () => {
    setCurrent((c) => ({
      ...c,
      title: form.title.trim() || c.title,
      summary: form.summary.trim() || c.summary,
      rootCause: form.rootCause.trim(),
      suggestedFix: form.suggestedFix.trim(),
      severity: form.severity,
      techStack: form.techStack,
      reproductionSteps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    }));
    setEditing(false);
    toast.info("Edits saved to the card. Publish when you are ready.");
  };

  const cancelEdits = () => {
    setForm(toForm(current));
    setTagInput("");
    setEditing(false);
  };

  const push = async () => {
    setPushing(true);
    try {
      const updated = await api.pushIssue({
        id: current._id,
        title: current.title,
        summary: current.summary,
        rootCause: current.rootCause,
        techStack: current.techStack,
        severity: current.severity,
        suggestedFix: current.suggestedFix,
        reproductionSteps: current.reproductionSteps,
      });
      setCurrent(updated);
      toast.success(`Issue #${updated.githubIssueNumber} created on GitHub`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setPushing(false);
    }
  };

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-black/30">
      {editing ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Title
            <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Summary
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={4} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Root cause
            <textarea value={form.rootCause} onChange={(e) => set("rootCause", e.target.value)} rows={3} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Reproduction steps (one per line)
            <textarea value={form.steps} onChange={(e) => set("steps", e.target.value)} rows={5} className={`mt-1 font-mono ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Suggested fix
            <textarea value={form.suggestedFix} onChange={(e) => set("suggestedFix", e.target.value)} rows={3} className={`mt-1 ${input}`} />
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-sm font-medium text-slate-300">
              Severity
              <select value={form.severity} onChange={(e) => set("severity", e.target.value as Severity)} className={`mt-1 block ${input}`}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <div className="min-w-[14rem] flex-1 text-sm font-medium text-slate-300">
              <label htmlFor="tag-input">Tech stack tags</label>
              <div className="mt-1 flex flex-wrap items-center gap-2 rounded-md border border-slate-700 bg-slate-950 p-2">
                {form.techStack.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-300">
                    {t}
                    <button type="button" onClick={() => set("techStack", form.techStack.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="Add tag, press Enter"
                  className="min-w-[8rem] flex-1 bg-transparent text-sm text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={saveEdits} className="flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
              <Check className="h-4 w-4" aria-hidden /> Save edits
            </button>
            <button type="button" onClick={cancelEdits} className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={current.severity} />
            {current.techStack.map((t) => (
              <span key={t} className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-300">{t}</span>
            ))}
          </div>
          <h2 className="text-xl font-bold text-slate-50">{current.title}</h2>
          <p className="leading-relaxed text-slate-300">{current.summary}</p>
          {current.rootCause && (
            <div>
              <h3 className="text-sm font-semibold text-amber-300">Root cause</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{current.rootCause}</p>
            </div>
          )}
          {current.reproductionSteps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Reproduction steps</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                {current.reproductionSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {current.suggestedFix && (
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Suggested fix</h3>
              <p className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-cyan-100">{current.suggestedFix}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
            {pushed ? (
              <a
                href={current.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                <Check className="h-4 w-4" aria-hidden /> ✓ View on GitHub <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <>
                <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">
                  <Pencil className="h-4 w-4" aria-hidden /> ✏️ Edit Card
                </button>
                <button
                  type="button"
                  onClick={push}
                  disabled={pushing}
                  className="flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {pushing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {pushing ? "Publishing…" : "🐙 Create Issue on GitHub"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
