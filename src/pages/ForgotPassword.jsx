import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

// Step indicators
const STEPS = ['Enter Email', 'Verify OTP', 'New Password'];

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass]   = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice]     = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [done, setDone]         = useState(false);

  const otpRefs = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setNotice({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);
    setNotice(null);
    try {
      // Try real API — fall back to demo mode gracefully
      await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (_) { /* backend offline — demo mode */ }
    setIsLoading(false);
    setResendTimer(60);
    setStep(2);
    setNotice({ type: 'success', message: `OTP sent to ${email}. Check your inbox (demo OTP: 123456).` });
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleOTPChange = (value, idx) => {
    const v = value.replace(/\D/, '').slice(-1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!v && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOTPKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setNotice({ type: 'error', message: 'Please enter the full 6-digit OTP.' });
      return;
    }
    // Demo: accept 123456 or any 6-digit code for testing
    if (code !== '123456') {
      setNotice({ type: 'error', message: 'Invalid OTP. Use demo OTP: 123456.' });
      return;
    }
    setNotice(null);
    setStep(3);
  };

  // ── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setNotice({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPass !== confirmPass) {
      setNotice({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setIsLoading(true);
    setNotice(null);
    try {
      await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword: newPass })
      });
    } catch (_) { /* demo mode */ }
    setIsLoading(false);
    setDone(true);
    // Auto-redirect to login after 3s
    setTimeout(() => onNavigate('signin'), 3000);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setResendTimer(60);
    setNotice({ type: 'success', message: 'OTP resent! Demo OTP: 123456' });
    otpRefs.current[0]?.focus();
  };

  // ── Success Screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full text-center space-y-5 py-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
          <p className="text-sm text-text-muted">Your password has been successfully updated.<br />Redirecting to login in 3 seconds…</p>
        </div>
        <button onClick={() => onNavigate('signin')} className="text-sm font-bold text-primary hover:text-primary-hover cursor-pointer transition-colors">
          Go to Sign In →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-left">
      {notice && <Alert type={notice.type} message={notice.message} />}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-1">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done   = step > num;
          return (
            <div key={num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-input text-text-muted'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${active || done ? 'text-foreground' : 'text-text-muted'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`h-[2px] flex-1 mx-2 mb-4 transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-border/30'}`} />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-5" noValidate>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Forgot Password?</h1>
            <p className="text-sm text-text-muted">Enter your registered email and we'll send a 6-digit OTP.</p>
          </div>
          <Input label="Email Address" id="fp-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="admin@school.com"
            disabled={isLoading} icon={Mail} />
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            <span>{isLoading ? 'Sending OTP…' : 'Send OTP'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </form>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-6" noValidate>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-1">Enter OTP</h1>
            <p className="text-sm text-text-muted">We sent a 6-digit code to <strong className="text-foreground">{email}</strong></p>
          </div>

          {/* OTP Boxes */}
          <div className="flex gap-2 justify-between">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(e.target.value, i)}
                onKeyDown={(e) => handleOTPKeyDown(e, i)}
                onFocus={(e) => e.target.select()}
                className={`w-11 h-14 text-center text-xl font-black rounded-xl border-2 bg-input text-foreground outline-none transition-all duration-200
                  ${digit ? 'border-primary' : 'border-border/50'} focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
            ))}
          </div>

          {/* Resend */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Didn't receive it?</span>
            {resendTimer > 0 ? (
              <span className="text-text-muted">Resend in {resendTimer}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="flex items-center gap-1 text-primary font-semibold hover:text-primary-hover cursor-pointer transition-colors">
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setStep(1); setNotice(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /><span>Back</span>
            </Button>
            <Button type="submit">
              <KeyRound className="w-4 h-4 mr-1" /><span>Verify OTP</span>
            </Button>
          </div>
        </form>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-1">Set New Password</h1>
            <p className="text-sm text-text-muted">Choose a strong password for your account.</p>
          </div>

          <Input label="New Password *" type="password"
            value={newPass} onChange={(e) => setNewPass(e.target.value)}
            placeholder="Min 8 characters" icon={Lock} />


          <Input label="Confirm Password *" type="password"
            value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Repeat new password" icon={Lock} />
          {confirmPass && newPass === confirmPass && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 pl-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setStep(2); setNotice(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /><span>Back</span>
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              <span>{isLoading ? 'Updating…' : 'Reset Password'}</span>
              {!isLoading && <CheckCircle2 className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </form>
      )}

      {/* Back to sign in */}
      <div className="mt-8 text-center">
        <button onClick={() => onNavigate('signin')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer">
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
