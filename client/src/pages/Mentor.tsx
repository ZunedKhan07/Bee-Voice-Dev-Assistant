import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Bot, ChevronDown, ChevronUp, Send, Square, Trash2, User } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { api, errMsg } from "../services/api";
import type { ChatMessage } from "../types";

const starters = [
  "What does \"Cannot read properties of undefined\" mean?",
  "How do I debug a CORS error between React and Express?",
  "Why is my useEffect running twice?",
];

const URL_RE = /(https?:\/\/[^\s)]+)/g;

const linkify = (text: string): ReactNode[] =>
  text.split(URL_RE).map((chunk, i) => {
    if (i % 2 === 0) return chunk;
    const url = chunk.replace(/[.,;:!?]+$/, "");
    return (
      <span key={i}>
        <a href={url} target="_blank" rel="noreferrer" className="break-all text-cyan-400 underline">{url}</a>
        {chunk.slice(url.length)}
      </span>
    );
  });

// Odd segments between ``` fences are code. Works while the reply is still streaming.
function MessageBody({ text }: { text: string }) {
  const parts = text.split("```");
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-cyan-100">
            {part.replace(/^[\w+-]*\n/, "").trimEnd()}
          </pre>
        ) : part.trim() ? (
          <p key={i} className="whitespace-pre-wrap">{linkify(part.trim())}</p>
        ) : null
      )}
    </div>
  );
}

export default function Mentor() {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [errorLog, setErrorLog] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    const userMsg: ChatMessage = { id: `m${idRef.current++}`, role: "user", content };
    const botMsg: ChatMessage = { id: `m${idRef.current++}`, role: "assistant", content: "" };
    const history = [...messages, userMsg];

    setMessages([...history, botMsg]);
    setInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await api.streamMentor(
        { messages: history.map(({ role, content: c }) => ({ role, content: c })), errorLog: errorLog.trim() },
        (token) => setMessages((prev) => prev.map((m) => (m.id === botMsg.id ? { ...m, content: m.content + token } : m))),
        controller.signal
      );
    } catch (e) {
      if (!controller.signal.aborted) {
        toast.error(errMsg(e));
        setMessages((prev) => prev.filter((m) => !(m.id === botMsg.id && m.content === "")));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">AI Mentor</h1>
          <p className="mt-1 text-sm text-slate-400">Bee explains the why and gives hints. You write the fix.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            setMessages([]);
          }}
          disabled={messages.length === 0}
          className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" aria-hidden /> New chat
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-3 py-6 text-center">
            <Bot className="mx-auto h-8 w-8 text-cyan-400" aria-hidden />
            <p className="text-slate-300">Ask about an error, a concept, or paste a stack trace below.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-cyan-500 hover:text-cyan-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-slate-700" : "bg-cyan-500/20"}`}>
              {m.role === "user" ? <User className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4 text-cyan-400" aria-hidden />}
              <span className="sr-only">{m.role === "user" ? "You" : "Bee"}</span>
            </div>
            <div className={`max-w-[85%] rounded-xl p-3 ${m.role === "user" ? "bg-slate-800 text-slate-100" : "border border-slate-800 bg-slate-900 text-slate-200"}`}>
              {m.role === "assistant" && m.content === "" ? (
                <span className="flex gap-1 py-1" aria-label="Bee is thinking">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              ) : (
                <MessageBody text={m.content} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 space-y-3">
        <button type="button" onClick={() => setShowLog((v) => !v)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200" aria-expanded={showLog}>
          {showLog ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
          {errorLog.trim() ? "Error log attached" : "Attach an error log (optional)"}
        </button>
        {showLog && (
          <textarea
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            rows={5}
            placeholder="Paste the terminal error or stack trace. It is sent with your next messages."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          />
        )}
        <div className="flex items-end gap-3">
          <label htmlFor="chat-input" className="sr-only">Your message</label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Ask the mentor… (Enter to send, Shift+Enter for a new line)"
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          />
          {streaming ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="flex h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              <Square className="h-4 w-4" aria-hidden /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void send(input)}
              disabled={!input.trim()}
              className="flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden /> Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
