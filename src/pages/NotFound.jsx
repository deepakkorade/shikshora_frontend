import { useState, useEffect } from 'react';
import { GraduationCap, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound({ onNavigate }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      onNavigate?.('dashboard');
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8 select-none">
          <span
            className="text-[10rem] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, transparent 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.15,
            }}
          >
            404
          </span>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10"
              style={{ animation: 'float 3s ease-in-out infinite' }}>
              <GraduationCap className="w-11 h-11 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.<br />
          Redirecting to dashboard in <strong className="text-primary">{count}s</strong>…
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-primary/25"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-text-muted hover:text-foreground hover:bg-card transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
}
