import React, { useState } from "react";
import { askMentor } from "../services/api";
import type { AIResponse } from "../services/api";

export const MentorPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await askMentor(query, context);
      setResponse(res.data);
    } catch (err) {
      alert("Failed to get mentor response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">AI Developer Mentor</h1>
          <p className="text-slate-400 mt-2">Get concept guidance and learning hints. We teach you how to solve it yourself.</p>
        </div>

        <form onSubmit={handleAsk} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Question / Problem</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Why am I getting 'Cannot read properties of undefined (reading map)'?"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Code / Context (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste code snippet or terminal logs here..."
              rows={3}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? "Mentor Thinking..." : "Ask AI Mentor 🧠"}
          </button>
        </form>

        {/* AI Response Card */}
        {response && (
          <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-indigo-300 border-b border-indigo-500/20 pb-3">Mentor Advice</h2>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Issue Summary</span>
                <p className="text-slate-200 font-medium mt-1">{response.issueSummary}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Root Cause Concept</span>
                <p className="text-slate-300 mt-1">{response.rootCauseConcept}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Learning Hint</span>
                <p className="text-amber-200 text-sm mt-1">{response.learningHint}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Suggested Action</span>
                <p className="text-slate-300 text-sm mt-1">{response.suggestedAction}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};