import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import SeverityBadge from "../component/SeverityBadge";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api, errMsg } from "../services/api";
import type { Issue, Severity } from "../types";

type Filter = "all" | Severity;
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function Contribute() {
  const socket = useSocket();
  const toast = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    try {
      setIssues(await api.openIssues());
      setError("");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates: a newly published issue appears without a refresh.
  useEffect(() => {
    if (!socket) return;
    const onPushed = (issue: Issue) => {
      setIssues((prev) => (prev.some((i) => i._id === issue._id) ? prev : [issue, ...prev]));
      toast.info(`New issue published: ${issue.title}`);
    };
    socket.on("issue:pushed", onPushed);
    return () => {
      socket.off("issue:pushed", onPushed);
    };
  }, [socket, toast]);

  const visible = useMemo(() => (filter === "all" ? issues : issues.filter((i) => i.severity === filter)), [issues, filter]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Open issues</h1>
          <p className="mt-2 text-slate-400">Real GitHub issues created with Bee. Pick one and start contributing.</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter by severity">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                filter === f.value ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:text-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-56 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          ))}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
          <p className="text-slate-300">{issues.length === 0 ? "No issues published yet." : "No issues match this filter."}</p>
          {issues.length === 0 && (
            <Link to="/voice-ingest" className="mt-3 inline-block text-cyan-400 underline">Create the first one with your voice</Link>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((i) => (
          <article key={i._id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={i.severity} />
              {i.techStack.map((t) => (
                <span key={t} className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-300">{t}</span>
              ))}
            </div>
            <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-50">{i.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{i.summary}</p>
            {i.rootCause && (
              <p className="mt-3 line-clamp-3 border-l-2 border-amber-400/60 pl-3 text-sm leading-relaxed text-slate-300">
                <span className="font-semibold text-amber-300">Root cause: </span>
                {i.rootCause}
              </p>
            )}
            <a
              href={i.githubIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-2 self-start pt-4 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View issue #{i.githubIssueNumber} on GitHub <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
