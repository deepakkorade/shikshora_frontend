import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setNotice({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setNotice(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setNotice({ type: 'success', message: data.message || 'Instructions sent to your email.' });
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Error processing request.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-left">
      {/* Notifications */}
      {notice && <Alert type={notice.type} message={notice.message} />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reset Password</h1>
        <p className="text-sm text-text-muted">Enter your registered email below to receive reset instructions.</p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={isLoading}
          icon={Mail}
        />

        <Button type="submit" isLoading={isLoading}>
          <span>Send Reset Link</span>
          <ArrowRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
        </Button>
      </form>

      {/* Switcher */}
      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate('signin')}
          className="text-sm font-bold text-primary hover:text-primary-hover transition-colors duration-150 cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
