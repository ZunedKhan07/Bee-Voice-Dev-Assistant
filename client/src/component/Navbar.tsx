import { Hexagon } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/voice-ingest", label: "Voice Issue", end: false },
  { to: "/contribute", label: "Contribute", end: false },
  { to: "/mentor", label: "AI Mentor", end: false },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <NavLink to="/" className="mr-auto flex items-center gap-2 font-mono text-lg font-bold text-slate-100">
          <Hexagon className="h-5 w-5 text-amber-400" aria-hidden />
          <span>
            Bee <span className="text-cyan-400">Voice-Dev</span>
          </span>
        </NavLink>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `border-b-2 pb-0.5 text-sm font-medium transition-colors ${
                isActive ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-100"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
