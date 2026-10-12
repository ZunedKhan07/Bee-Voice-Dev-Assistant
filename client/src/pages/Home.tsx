import { GitPullRequest, Mic, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Mic,
    title: "Voice Ingestion",
    body: "Speak the bug the moment you see it, or paste the terminal log. Bee turns it into a structured issue draft.",
  },
  {
    icon: Pencil,
    title: "Live Editing",
    body: "Bedrock got a detail wrong? Edit the title, tags, severity or steps right on the card before anything is published.",
  },
  {
    icon: GitPullRequest,
    title: "Direct GitHub Sync",
    body: "One click publishes the finished card as a real GitHub issue and lists it on the Contribute board.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#0b0f17]">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-6xl">
            Voice-to-GitHub Issue Pipeline <span className="text-cyan-400">&amp;</span> AI Developer Mentor
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Spot a bug while you code, say it out loud, and ship a clean GitHub issue. Stuck instead? Ask the mentor
            to guide you to the fix.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/contribute"
              className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Go to Contribute 🚀
            </Link>
            <Link
              to="/mentor"
              className="rounded-lg border border-amber-400/60 px-6 py-3 font-semibold text-amber-300 hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Ask AI Mentor 🧠
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Want to report a bug? <Link to="/voice-ingest" className="text-cyan-400 underline">Start a voice issue</Link>
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/90 p-6">
            <Icon className="h-6 w-6 text-cyan-400" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold text-slate-100">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
