import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Clock, ShieldCheck, School, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function Login({ onNavigate, onLoginSuccess, sessionExpired }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Pre-fill if "remember me" was previously saved
  useEffect(() => {
    const savedEmail = localStorage.getItem('shikshora_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const user = await login(email, password);

      // Handle "Remember me"
      if (rememberMe) {
        localStorage.setItem('shikshora_remember_email', email);
      } else {
        localStorage.removeItem('shikshora_remember_email');
      }

      setNotice({ type: 'success', message: `Welcome back, ${user.name}! Accessing portal…` });
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(user), 800);
      }
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
    setNotice(null);
  };

  return (
    <div className="w-full text-left">

      {/* Session-expired inline banner */}
      {sessionExpired && !notice && (
        <div className="mb-6 p-3.5 rounded-2xl flex items-start gap-3 border border-amber-500/40 bg-amber-500/10 text-amber-300 animate-slide-in">
          <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <p className="text-xs font-semibold leading-relaxed">
            Your 24-hour session expired. Please sign in to resume your work.
          </p>
        </div>
      )}

      {/* Alert Notice */}
      {notice && <div className="mb-5"><Alert type={notice.type} message={notice.message} /></div>}

      {/* Header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold mb-3">
          <Sparkles className="w-3 h-3" /> Unified Portal Access
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1.5">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Sign in to your Shikshora institutional workspace.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Email Field */}
        <div className="space-y-1">
          <Input
            label="Institutional Email"
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
            placeholder="admin@school.com"
            disabled={isLoading}
            icon={Mail}
          />
          {fieldErrors.email && (
            <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-foreground/90 block select-none" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot')}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
            placeholder="••••••••"
            disabled={isLoading}
            icon={Lock}
          />

          {fieldErrors.password && (
            <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Remember me & Session Hint */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-primary rounded bg-input border-border focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-xs font-medium text-text-muted hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>
          <span className="text-[11px] text-text-muted/60">24-hour secure session</span>
        </div>

        {/* Submit Button */}
        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="mt-2">
          <span>{isLoading ? 'Authenticating…' : 'Sign In to Portal'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />}
        </Button>
      </form>

      {/* Switcher to Register */}
      <div className="mt-7 pt-5 border-t border-border/40 text-center">
        <p className="text-xs sm:text-sm text-text-muted">
          New School or Campus?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer ml-1"
          >
            Register Institution Plan →
          </button>
        </p>
      </div>
    </div>
  );
}
