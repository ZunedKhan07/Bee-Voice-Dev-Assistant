import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./component/Navbar";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";
import Contribute from "./pages/Contribute";
import Home from "./pages/Home";
import Mentor from "./pages/Mentor";
import VoiceIngest from "./pages/VoiceIngest";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SocketProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/voice-ingest"
                element={<main className="mx-auto max-w-6xl px-4 py-10"><VoiceIngest /></main>}
              />
              <Route
                path="/contribute"
                element={<main className="mx-auto max-w-6xl px-4 py-10"><Contribute /></main>}
              />
              <Route
                path="/mentor"
                element={<main className="mx-auto max-w-6xl px-4 py-6"><Mentor /></main>}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SocketProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
