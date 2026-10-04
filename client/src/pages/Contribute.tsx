import React, { useEffect, useState } from "react";
import { getPendingIssues, ingestLog } from "../services/api";
import type { Issue } from "../services/api";
import { useSocket } from "../context/SocketContext";

export const Contribute: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [logInput, setLogInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  const fetchIssues = async () => {
    try {
      const res = await getPendingIssues();
      setIssues(res.data || []);
    } catch (err) {
      console.error("Failed to load issues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    if (socket) {
      socket.on("issue:created", (newIssue: Issue) => {
        setIssues((prev) => [newIssue, ...prev]);
      });
    }

    return () => {
      socket?.off("issue:created");
    };
  }, [socket]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;

    setSubmitting(true);
    try {
      await ingestLog(logInput, "text");
      setLogInput("");
      await fetchIssues();
    } catch (err) {
      alert("Error submitting log. Please check server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Community Issues & Contribute</h1>
          <p className="text-slate-400 mt-2">Submit your error logs or explore open issues created by students.</p>
        </div>

        {/* Ingest Form Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
            <span>⚡</span> Submit Log for Analysis
          </h2>
          <form onSubmit={handleIngest} className="space-y-4">
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Paste terminal error logs or stack trace here..."
              rows={4}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {submitting ? "Analyzing with AI..." : "Ingest & Create Card"}
            </button>
          </form>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Open Debugging Cards</h2>

          {loading ? (
            <p className="text-slate-500">Loading issues...</p>
          ) : issues.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-slate-400">
              No open issues found. Submit one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-lg text-white leading-snug">{issue.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                          issue.status === "open"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm whitespace-pre-line">{issue.description}</p>

                    {/* Hints Section */}
                    {issue.learningHints && issue.learningHints.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Learning Hint:</span>
                        <p className="text-xs text-slate-300">{issue.learningHints[0]}</p>
                      </div>
                    )}
                  </div>

                  {issue.githubIssueUrl && (
                    <a
                      href={issue.githubIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline pt-2"
                    >
                      <span>🐙</span> View on GitHub →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};