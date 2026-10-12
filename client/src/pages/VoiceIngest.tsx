import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Sparkles, Square, Trash2 } from "lucide-react";
import IssueDraftCard from "../component/IssueDraftCard";
import { useToast } from "../context/ToastContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { api, errMsg } from "../services/api";
import type { Issue } from "../types";

const MAX_CHARS = 12000;

export default function VoiceIngest() {
  const toast = useToast();
  const speech = useSpeechRecognition();
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<Issue | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (speech.error) toast.error(speech.error);
  }, [speech.error, toast]);

  useEffect(() => {
    if (draft) draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [draft]);

  const toggleMic = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.start((text) => setTranscript((prev) => (prev ? `${prev} ${text}` : text).slice(0, MAX_CHARS)), lang);
  };

  const analyze = async () => {
    const text = transcript.trim();
    if (text.length < 10 || analyzing) return;
    if (speech.listening) speech.stop();
    setAnalyzing(true);
    try {
      setDraft(await api.analyze(text));
      toast.success("Issue draft generated. Review it below.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">Voice Issue Generator</h1>
        <p className="mt-2 text-slate-400">
          Dictate the problem or paste an error log. Bedrock turns it into an issue you can edit and publish.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex flex-wrap items-center gap-3">
          {speech.supported ? (
            <>
              <button
                type="button"
                onClick={toggleMic}
                className={`flex items-center gap-2 rounded-lg px-5 py-3 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                  speech.listening ? "animate-pulse bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                }`}
              >
                {speech.listening ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                {speech.listening ? "Stop Dictation" : "🎤 Start Voice Dictation"}
              </button>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                disabled={speech.listening}
                aria-label="Dictation language"
                className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 disabled:opacity-50"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi</option>
              </select>
              {speech.listening && (
                <span className="flex items-center gap-2 text-sm text-red-300" role="status">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  Listening… speak now
                </span>
              )}
            </>
          ) : (
            <p className="text-sm text-amber-300">
              Voice dictation works in Chrome and Edge. You can still type or paste below.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="transcript" className="sr-only">Issue description or error log</label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value.slice(0, MAX_CHARS))}
            rows={10}
            placeholder="Speak, type, or paste your terminal error here…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          />
          {speech.interim && <p className="mt-2 text-sm italic text-slate-500">{speech.interim}</p>}
          <p className="mt-1 text-right text-xs text-slate-500">{transcript.length}/{MAX_CHARS}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing || transcript.trim().length < 10}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {analyzing ? "Analyzing with Bedrock…" : "Generate issue"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTranscript("");
              setDraft(null);
            }}
            disabled={!transcript && !draft}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Clear
          </button>
        </div>
      </section>

      <div ref={draftRef} className="scroll-mt-24">
        {draft && <IssueDraftCard key={draft._id} issue={draft} />}
      </div>
    </div>
  );
}
