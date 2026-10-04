import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import { Home } from "./pages/Home";
import { Contribute } from "./pages/Contribute";
import { MentorPage } from "./pages/MentorPage";
import { AdminPanel } from "./pages/AdminPanel";

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans">
          {/* Header Navbar */}
          <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <Link to="/" className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                BEE VOICE-DEV
              </Link>
              <div className="flex gap-6 text-sm font-semibold text-slate-300">
                <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
                <Link to="/contribute" className="hover:text-cyan-400 transition">Contribute</Link>
                <Link to="/mentor" className="hover:text-cyan-400 transition">AI Mentor</Link>
                <Link to="/admin" className="hover:text-cyan-400 transition text-slate-500">Admin</Link>
              </div>
            </div>
          </nav>

          {/* App Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
};

export default App;