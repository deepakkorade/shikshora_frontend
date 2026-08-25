import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Context ───────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Config per type ───────────────────────────────────────────────────────
const ICONS = {
  success: { icon: CheckCircle2, cls: 'text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  error:   { icon: AlertCircle,  cls: 'text-rose-400',    bar: 'bg-rose-500',    bg: 'bg-rose-500/10 border-rose-500/30' },
  info:    { icon: Info,         cls: 'text-blue-400',    bar: 'bg-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30' },
  warning: { icon: AlertTriangle,cls: 'text-amber-400',   bar: 'bg-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30' },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = ICONS[toast.type] || ICONS.info;
  const Icon = cfg.icon;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => dismiss(), toast.duration || 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      style={{ transition: 'opacity 0.35s, transform 0.35s' }}
      className={`
        relative flex items-start gap-3 w-80 max-w-[90vw] p-4 rounded-2xl border shadow-2xl
        backdrop-blur-xl overflow-hidden ${cfg.bg}
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${cfg.bar}`} />

      <span className={`shrink-0 mt-0.5 ${cfg.cls}`}>
        <Icon className="w-4 h-4" />
      </span>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-bold text-foreground leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-xs text-text-muted leading-relaxed">{toast.message}</p>
      </div>

      <button onClick={dismiss} className="shrink-0 text-text-muted hover:text-foreground cursor-pointer mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} opacity-50`}
        style={{ animation: `tp ${toast.duration || 4000}ms linear forwards` }}
      />

      <style>{`@keyframes tp { from{width:100%} to{width:0%} }`}</style>
    </div>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Bottom-right toast stack */}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
