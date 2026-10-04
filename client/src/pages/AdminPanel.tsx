import React, { useState, useEffect } from "react";
import { verifyAdmin, getPendingIssues, pushToGitHub } from "../services/api";
import type { Issue } from "../services/api";

export const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyAdmin(password);
      if (res.data?.isAuthenticated) {
        setAuthenticated(true);
        loadIssues();
      }
    } catch (err) {
      alert("Invalid Admin Password!");
    }
  };

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await getPendingIssues();
      setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async (issueId: string) => {
    setActionLoading(issueId);
    try {
      await pushToGitHub(issueId);
      alert("Successfully published issue to GitHub!");
      loadIssues();
    } catch (err) {
      alert("Failed to push to GitHub.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6">
          <h1 className="text-2xl font-bold text-white text-center">Admin Access</h1>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition">
            Unlock Admin Panel 🔓
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Issue Manager</h1>
            <p className="text-slate-400 mt-1">Review student issues and push verified bug cards directly to GitHub.</p>
          </div>
          <button onClick={loadIssues} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading issues...</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-white">{issue.title}</h3>
                  <p className="text-slate-400 text-sm">{issue.description}</p>
                </div>
                <button
                  onClick={() => handlePush(issue._id)}
                  disabled={actionLoading === issue._id || issue.status === "in-progress"}
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 hover:opacity-90 transition disabled:opacity-40 whitespace-nowrap"
                >
                  {actionLoading === issue._id ? "Pushing..." : issue.status === "in-progress" ? "Published to GitHub ✓" : "Push to GitHub 🐙"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};