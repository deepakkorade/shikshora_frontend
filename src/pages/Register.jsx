import { useState } from 'react';
import {
  Mail, Lock, User, Phone, Globe, Shield,
  ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff, Building2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function Register({ onNavigate, onRegisterSuccess }) {
  const [step, setStep]         = useState(1); // 1: School, 2: Admin, 3: Plan
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice]     = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form State
  const [schoolData, setSchoolData] = useState({
    schoolName: '', email: '', phone: '', address: '',
    city: '', state: '', country: '', regNumber: '', type: 'K-12', website: '', logo: ''
  });

  const [adminData, setAdminData] = useState({
    adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '', adminPhone: ''
  });

  const [selectedPlan, setSelectedPlan] = useState(2);

  const plans = [
    {
      id: 1, name: 'Starter', price: '$49',
      features: ['Max 200 Students', 'Max 15 Teachers', '1 Branch', '5 GB Storage', 'Core Modules (Admissions, Attendance, Notices)']
    },
    {
      id: 2, name: 'Professional', price: '$129',
      features: ['Max 1,000 Students', 'Max 60 Teachers', 'Up to 3 Branches', '20 GB Storage', 'Core ERP + Fees, Homework, Exams']
    },
    {
      id: 3, name: 'Enterprise', price: '$299',
      features: ['Max 10,000 Students', 'Max 500 Teachers', 'Up to 20 Branches', '100 GB Storage', 'All Modules + Library, Transport, AI Bot']
    }
  ];

  // ─── Step 1 Validation ─────────────────────────────────────────────────────
  const handleSchoolNext = (e) => {
    e.preventDefault();
    const errors = {};
    if (!schoolData.schoolName.trim()) errors.schoolName = 'School name is required.';
    if (!schoolData.regNumber.trim())  errors.regNumber  = 'Registration number is required.';
    if (!schoolData.email.trim())      errors.email      = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(schoolData.email)) errors.email = 'Enter a valid email.';
    if (!schoolData.phone.trim())      errors.phone      = 'Phone number is required.';
    if (!schoolData.address.trim())    errors.address    = 'Address is required.';
    if (!schoolData.city.trim())       errors.city       = 'City is required.';
    if (!schoolData.state.trim())      errors.state      = 'State is required.';
    if (!schoolData.country.trim())    errors.country    = 'Country is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setNotice({ type: 'error', message: 'Please fill in all required fields marked with *.' });
      return;
    }
    setFieldErrors({});
    setNotice(null);
    setStep(2);
  };

  // ─── Step 2 Validation ─────────────────────────────────────────────────────
  const handleAdminNext = (e) => {
    e.preventDefault();
    const errors = {};
    if (!adminData.adminName.trim())  errors.adminName  = 'Full name is required.';
    if (!adminData.adminEmail.trim()) errors.adminEmail = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(adminData.adminEmail)) errors.adminEmail = 'Enter a valid email.';
    if (!adminData.adminPassword)     errors.adminPassword = 'Password is required.';
    else if (adminData.adminPassword.length < 8) errors.adminPassword = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(adminData.adminPassword)) errors.adminPassword = 'Include at least one uppercase letter.';
    else if (!/[0-9]/.test(adminData.adminPassword)) errors.adminPassword = 'Include at least one number.';
    if (!adminData.confirmPassword)   errors.confirmPassword = 'Please confirm your password.';
    else if (adminData.adminPassword !== adminData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setNotice({ type: 'error', message: 'Please fix the errors below before continuing.' });
      return;
    }
    setFieldErrors({});
    setNotice(null);
    setStep(3);
  };

  // ─── Step 3 Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsLoading(true);
    setNotice(null);

    const payload = {
      ...schoolData,
      ...adminData,
      subscriptionPlanId: selectedPlan
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setNotice({ type: 'success', message: '🎉 School registered successfully! Redirecting to login…' });
      if (onRegisterSuccess) {
        setTimeout(() => onRegisterSuccess(data), 1800);
      }
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Onboarding failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const fieldErr = (key) =>
    fieldErrors[key] ? (
      <p className="text-xs text-rose-400 pl-1 mt-1">{fieldErrors[key]}</p>
    ) : null;

  const setSchool = (key) => (e) => {
    setSchoolData(p => ({ ...p, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };
  const setAdmin = (key) => (e) => {
    setAdminData(p => ({ ...p, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };

  // Password strength
  const pwStrength = (() => {
    const pw = adminData.adminPassword;
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', w: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400', w: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-emerald-400', w: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', w: 'w-full' };
  })();

  return (
    <div className="w-full text-left">

      {/* Alert */}
      {notice && <Alert type={notice.type} message={notice.message} />}

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8 px-1">
        {[
          { num: 1, label: 'School Details' },
          { num: 2, label: 'Admin Account' },
          { num: 3, label: 'SaaS Plan' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  step > s.num
                    ? 'bg-emerald-500 text-white'
                    : step === s.num
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-input text-text-muted'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold mt-1 transition-colors duration-300 ${step >= s.num ? 'text-foreground' : 'text-text-muted'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-[2px] flex-1 mx-2 mb-4 transition-all duration-500 ${step > s.num ? 'bg-emerald-500' : step === s.num ? 'bg-primary/50' : 'bg-border/30'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: SCHOOL DETAILS ──────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSchoolNext} className="space-y-4" noValidate>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">School Information</h1>
            <p className="text-xs text-text-muted">Tell us about your school institution. All * fields are required.</p>
          </div>

          <div>
            <Input
              label="School Name *" value={schoolData.schoolName} onChange={setSchool('schoolName')}
              placeholder="e.g. Green Valley High School" icon={Building2}
            />
            {fieldErr('schoolName')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Registration Number *" value={schoolData.regNumber} onChange={setSchool('regNumber')}
                placeholder="GVS-2026-90" icon={Shield}
              />
              {fieldErr('regNumber')}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted block">School Type *</label>
              <select
                value={schoolData.type} onChange={setSchool('type')}
                className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="Primary">Primary School (K-5)</option>
                <option value="Secondary">Middle &amp; High School (6-12)</option>
                <option value="K-12">Composite K-12 Academy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="School Email *" type="email" value={schoolData.email} onChange={setSchool('email')}
                placeholder="contact@school.com" icon={Mail}
              />
              {fieldErr('email')}
            </div>
            <div>
              <Input
                label="Phone Number *" value={schoolData.phone} onChange={setSchool('phone')}
                placeholder="+91 98765 43210" icon={Phone}
              />
              {fieldErr('phone')}
            </div>
          </div>

          <div>
            <Input
              label="Street Address *" value={schoolData.address} onChange={setSchool('address')}
              placeholder="123 Education Lane"
            />
            {fieldErr('address')}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Input label="City *" value={schoolData.city} onChange={setSchool('city')} placeholder="City" />
              {fieldErr('city')}
            </div>
            <div>
              <Input label="State *" value={schoolData.state} onChange={setSchool('state')} placeholder="State" />
              {fieldErr('state')}
            </div>
            <div>
              <Input label="Country *" value={schoolData.country} onChange={setSchool('country')} placeholder="Country" />
              {fieldErr('country')}
            </div>
          </div>

          <Input
            label="Website (Optional)" value={schoolData.website} onChange={setSchool('website')}
            placeholder="https://yourschool.com" icon={Globe}
          />

          <Button type="submit">
            <span>Next: Admin Details</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}

      {/* ── STEP 2: ADMIN ACCOUNT ───────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleAdminNext} className="space-y-4" noValidate>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">School Administrator</h1>
            <p className="text-xs text-text-muted">Create the root login credentials for your School Admin account.</p>
          </div>

          <div>
            <Input
              label="Full Name *" value={adminData.adminName} onChange={setAdmin('adminName')}
              placeholder="Principal John Miller" icon={User}
            />
            {fieldErr('adminName')}
          </div>

          <div>
            <Input
              label="Admin Email *" type="email" value={adminData.adminEmail} onChange={setAdmin('adminEmail')}
              placeholder="principal@school.com" icon={Mail}
            />
            {fieldErr('adminEmail')}
          </div>

          {/* Password with strength bar */}
          <div>
            <div className="relative">
              <Input
                label="Password * (min 8 chars, 1 uppercase, 1 number)"
                type={showPass ? 'text' : 'password'}
                value={adminData.adminPassword} onChange={setAdmin('adminPassword')}
                placeholder="••••••••" icon={Lock}
              />
              <button
                type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 bottom-3 text-text-muted hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {adminData.adminPassword && pwStrength && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-border/30 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pwStrength.color} ${pwStrength.w}`} />
                </div>
                <p className="text-xs text-text-muted">Strength: <span className="font-semibold">{pwStrength.label}</span></p>
              </div>
            )}
            {fieldErr('adminPassword')}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Input
                label="Confirm Password *"
                type={showConfirm ? 'text' : 'password'}
                value={adminData.confirmPassword} onChange={setAdmin('confirmPassword')}
                placeholder="••••••••" icon={Lock}
              />
              <button
                type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 bottom-3 text-text-muted hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {adminData.confirmPassword && adminData.adminPassword === adminData.confirmPassword && (
              <p className="text-xs text-emerald-400 pl-1 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
            {fieldErr('confirmPassword')}
          </div>

          <div>
            <Input
              label="Admin Phone (Optional)" value={adminData.adminPhone} onChange={setAdmin('adminPhone')}
              placeholder="+91 98765 43210" icon={Phone}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setNotice(null); setStep(1); }}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button type="submit">
              <span>Next: Select Plan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      )}

      {/* ── STEP 3: PLAN SELECTION ──────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Select Subscription Plan</h1>
            <p className="text-xs text-text-muted">Choose the right plan for your school. You can upgrade anytime.</p>
          </div>

          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  selectedPlan === plan.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border/50 bg-card/40 hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedPlan === plan.id ? 'border-primary' : 'border-border'}`}>
                    {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">{plan.name}</span>
                      {plan.id === 2 && (
                        <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Popular</span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-text-muted">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-auto">
                  <span className="text-2xl font-black text-foreground">{plan.price}</span>
                  <span className="text-xs text-text-muted block">/ month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary card */}
          <div className="p-3.5 rounded-xl bg-card/50 border border-border/50 text-xs text-text-muted space-y-1">
            <p className="font-semibold text-foreground text-sm">📋 Registration Summary</p>
            <p>🏫 <strong>{schoolData.schoolName}</strong> ({schoolData.type})</p>
            <p>👤 Admin: <strong>{adminData.adminName}</strong> — {adminData.adminEmail}</p>
            <p>📦 Plan: <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> ({plans.find(p => p.id === selectedPlan)?.price}/mo)</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setNotice(null); setStep(2); }}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
              <span>{isLoading ? 'Registering…' : 'Complete Registration'}</span>
              {!isLoading && <CheckCircle2 className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-text-muted">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('signin')}
            className="font-bold text-primary hover:text-primary-hover transition-colors duration-150 cursor-pointer"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
}
