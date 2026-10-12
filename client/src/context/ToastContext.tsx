import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type Kind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: Kind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

const styles: Record<Kind, { box: string; icon: ReactNode }> = {
  success: { box: "border-emerald-500/40 text-emerald-200", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden /> },
  error: { box: "border-red-500/40 text-red-200", icon: <XCircle className="h-5 w-5 text-red-400" aria-hidden /> },
  info: { box: "border-cyan-500/40 text-cyan-100", icon: <Info className="h-5 w-5 text-cyan-400" aria-hidden /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: Kind, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-slate-900 p-3 text-sm shadow-lg shadow-black/40 ${styles[t.kind].box}`}>
            <span className="mt-0.5">{styles[t.kind].icon}</span>
            <p className="flex-1 leading-snug">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-slate-400 hover:text-slate-100">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
