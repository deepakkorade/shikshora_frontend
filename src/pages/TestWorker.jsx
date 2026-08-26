import { useState } from 'react';
import { API_URL } from '../config';
import { CheckCircle2, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function TestWorker() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'

  const callBackend = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      const response = await fetch(`${API_URL}/api/hello`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message || 'No message received');
      setStatus('success');
    } catch (err) {
      console.error('Error calling worker backend:', err);
      setMessage(err.message || 'Failed to connect');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300 relative">
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle isFloating={false} />
      </div>

      <div className="w-full max-w-md bg-background/95 border border-border/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Backend Connectivity Tester</h1>
          <p className="text-xs text-text-muted mt-1">
            Testing connections between React and Cloudflare Worker
          </p>
        </div>

        <div className="bg-input/50 border border-border/30 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Current Environment</p>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-text-muted">Mode:</span>
            <span className="text-foreground font-bold">{import.meta.env.MODE}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-text-muted">API URL:</span>
            <span className="text-primary font-bold break-all">{API_URL}</span>
          </div>
        </div>

        {status !== 'idle' && (
          <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 text-left animate-slide-in ${
            status === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{status === 'success' ? 'Connection Successful' : 'Connection Failed'}</p>
              <p className="text-xs opacity-80 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        <Button onClick={callBackend} isLoading={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span>Testing Connection...</span>
            </>
          ) : (
            <span>Test Worker Connection</span>
          )}
        </Button>
      </div>
    </div>
  );
}
