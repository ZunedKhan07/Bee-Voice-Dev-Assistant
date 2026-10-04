import React from "react";
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-6 py-12">
      {/* Background Decorative Neon Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl text-center space-y-8 z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wide uppercase shadow-lg shadow-cyan-500/5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          AI-Powered Developer Mentorship Platform
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Debug Faster. Learn Concepts. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Automate GitHub Workflows.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Bee Voice-Dev Assistant transforms raw terminal error logs and audio dictations into learning-oriented hints without giving direct copy-paste code.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            to="/contribute"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:opacity-90 transition duration-300 shadow-lg shadow-cyan-500/20 text-center"
          >
            Go to Contribute 🚀
          </Link>
          <Link
            to="/mentor"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-200 border border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-600 transition duration-300 text-center backdrop-blur-md"
          >
            Ask AI Mentor 🧠
          </Link>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-cyan-500/40 transition">
            <div className="text-2xl mb-3">🎙️</div>
            <h3 className="font-semibold text-white mb-1">Voice & Text Ingest</h3>
            <p className="text-slate-400 text-sm">Paste terminal dumps or speak your debugging questions naturally.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-teal-500/40 transition">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="font-semibold text-white mb-1">Concept Hints</h3>
            <p className="text-slate-400 text-sm">Receive fundamental guidance to understand root causes, not spoon-fed code.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-indigo-500/40 transition">
            <div className="text-2xl mb-3">🐙</div>
            <h3 className="font-semibold text-white mb-1">GitHub Sync</h3>
            <p className="text-slate-400 text-sm">Convert verified log issues directly into official GitHub open repository tickets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};