import { useCallback, useEffect, useRef, useState } from "react";

// The Web Speech API is missing from the default TypeScript DOM types, so a minimal shape is declared here.
interface SRResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface SRInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SRResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SRConstructor = new () => SRInstance;

const getRecognition = (): SRConstructor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const explain = (code: string): string | null => {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was denied. Allow it in the address bar, or type your issue instead.";
    case "audio-capture":
      return "No microphone was found. Connect one, or type your issue instead.";
    case "network":
      return "Speech recognition needs an internet connection.";
    case "no-speech":
    case "aborted":
      return null;
    default:
      return `Voice input stopped (${code}). You can keep typing.`;
  }
};

export function useSpeechRecognition() {
  const supported = Boolean(getRecognition());
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SRInstance | null>(null);

  const start = useCallback((onFinal: (text: string) => void, lang = "en-IN") => {
    const SR = getRecognition();
    if (!SR) return;
    setError(null);

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) onFinal(result[0].transcript.trim());
        else interimText += result[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = (e) => setError(explain(e.error));
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone. Please try again.");
    }
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  useEffect(
    () => () => {
      recRef.current?.abort();
    },
    []
  );

  return { supported, listening, interim, error, start, stop };
}
