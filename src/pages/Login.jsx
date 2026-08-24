import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function Login({ onNavigate, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setNotice({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setNotice({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setNotice(null);

    try {
      const user = await login(email, password);
      setNotice({ type: 'success', message: `Welcome back, ${user.name}! Logging you in...` });
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(user), 1000);
      }
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Notifications */}
      {notice && <Alert type={notice.type} message={notice.message} />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome Back</h1>
        <p className="text-sm text-text-muted">Please enter your credentials to access the ERP Portal.</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@demoschool.com / superadmin@shikshora.com"
          disabled={isLoading}
          icon={Mail}
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 block" htmlFor="password">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot')}
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors duration-150 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            disabled={isLoading}
            icon={Lock}
          />
        </div>

        <div className="flex items-center text-left">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4.5 h-4.5 accent-primary rounded-md bg-input border-border focus:ring-primary/20 focus:ring-offset-background cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-text-muted select-none cursor-pointer">
            Keep me signed in
          </label>
        </div>

        <Button type="submit" isLoading={isLoading}>
          <span>Sign In</span>
          <ArrowRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
        </Button>
      </form>

      {/* Demo Credentials Alert Note */}
      <div className="mt-6 p-4 rounded-xl border border-border bg-card/50 text-left text-xs space-y-2">
        <p className="font-semibold text-foreground">💡 Try Demo Accounts (Password: <code className="text-primary font-mono font-bold">admin123</code>):</p>
        <ul className="list-disc pl-4 space-y-1 text-text-muted">
          <li><strong>Super Admin:</strong> <code className="font-mono">superadmin@shikshora.com</code></li>
          <li><strong>Demo School Admin:</strong> <code className="font-mono">admin@demoschool.com</code></li>
        </ul>
      </div>

      {/* Switcher */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-muted">
          New School?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-primary hover:text-primary-hover transition-colors duration-150 cursor-pointer"
          >
            Register School SaaS Plan
          </button>
        </p>
      </div>
    </div>
  );
}
