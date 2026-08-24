import { useState } from 'react';
import { Mail, Lock, User, Phone, Globe, Shield, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function Register({ onNavigate, onRegisterSuccess }) {
  const [step, setStep] = useState(1); // 1: School, 2: Admin, 3: Plan
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Form State
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    regNumber: '',
    type: 'K-12',
    website: '',
    logo: ''
  });

  const [adminData, setAdminData] = useState({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: ''
  });

  const [selectedPlan, setSelectedPlan] = useState(2); // Default Professional Plan (id: 2)

  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: '$49',
      features: ['Max 200 Students', 'Max 15 Teachers', '1 Branch', '5GB Space', 'Core Modules (Admissions, Academics, Attendance, Notices)']
    },
    {
      id: 2,
      name: 'Professional',
      price: '$129',
      features: ['Max 1000 Students', 'Max 60 Teachers', 'Up to 3 Branches', '20GB Space', 'Core ERP + Fees, Homework, Examinations']
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$299',
      features: ['Max 10,000 Students', 'Max 500 Teachers', 'Up to 20 Branches', '100GB Space', 'All Modules + Library, Transport, AI Admission Bot']
    }
  ];

  const handleSchoolNext = (e) => {
    e.preventDefault();
    if (!schoolData.schoolName || !schoolData.email || !schoolData.phone || !schoolData.address || 
        !schoolData.city || !schoolData.state || !schoolData.country || !schoolData.regNumber) {
      setNotice({ type: 'error', message: 'Please fill in all required school details.' });
      return;
    }
    setNotice(null);
    setStep(2);
  };

  const handleAdminNext = (e) => {
    e.preventDefault();
    if (!adminData.adminName || !adminData.adminEmail || !adminData.adminPassword) {
      setNotice({ type: 'error', message: 'Please fill in admin name, email, and password.' });
      return;
    }
    if (adminData.adminPassword.length < 6) {
      setNotice({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    setNotice(null);
    setStep(3);
  };

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

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setNotice({ type: 'success', message: 'School Registered Successfully! Redirecting to login...' });
      
      if (onRegisterSuccess) {
        setTimeout(() => onRegisterSuccess(data), 1500);
      }
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Onboarding failed.' });
      setStep(1); // Return to first step to fix
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-left">
      {notice && <Alert type={notice.type} message={notice.message} />}

      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-input text-text-muted'}`}>1</div>
          <span className="text-[10px] font-semibold mt-1 text-text-muted">School Details</span>
        </div>
        <div className={`h-[2px] flex-grow mx-2 ${step >= 2 ? 'bg-primary' : 'bg-border/30'}`} />
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-input text-text-muted'}`}>2</div>
          <span className="text-[10px] font-semibold mt-1 text-text-muted">Admin Account</span>
        </div>
        <div className={`h-[2px] flex-grow mx-2 ${step >= 3 ? 'bg-primary' : 'bg-border/30'}`} />
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-input text-text-muted'}`}>3</div>
          <span className="text-[10px] font-semibold mt-1 text-text-muted">SaaS Plan</span>
        </div>
      </div>

      {/* STEP 1: SCHOOL DETAILS */}
      {step === 1 && (
        <form onSubmit={handleSchoolNext} className="space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">School Information</h2>
            <p className="text-xs text-text-muted">Tell us about your school institution profile.</p>
          </div>

          <Input
            label="School Name *"
            value={schoolData.schoolName}
            onChange={(e) => setSchoolData({ ...schoolData, schoolName: e.target.value })}
            placeholder="e.g. Green Valley High School"
            icon={Globe}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number *"
              value={schoolData.regNumber}
              onChange={(e) => setSchoolData({ ...schoolData, regNumber: e.target.value })}
              placeholder="e.g. GVS-2026-90"
              icon={Shield}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">School Type *</label>
              <select
                value={schoolData.type}
                onChange={(e) => setSchoolData({ ...schoolData, type: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="Primary">Primary School (K-5)</option>
                <option value="Secondary">Middle & High School (6-12)</option>
                <option value="K-12">Composite K-12 Academy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="School Email Address *"
              type="email"
              value={schoolData.email}
              onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
              placeholder="contact@school.com"
              icon={Mail}
            />
            <Input
              label="School Phone Number *"
              value={schoolData.phone}
              onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              icon={Phone}
            />
          </div>

          <Input
            label="Street Address *"
            value={schoolData.address}
            onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
            placeholder="123 Education Lane"
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City *"
              value={schoolData.city}
              onChange={(e) => setSchoolData({ ...schoolData, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="State *"
              value={schoolData.state}
              onChange={(e) => setSchoolData({ ...schoolData, state: e.target.value })}
              placeholder="State"
            />
            <Input
              label="Country *"
              value={schoolData.country}
              onChange={(e) => setSchoolData({ ...schoolData, country: e.target.value })}
              placeholder="Country"
            />
          </div>

          <Button type="submit">
            <span>Next: Admin Details</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}

      {/* STEP 2: ADMIN DETAILS */}
      {step === 2 && (
        <form onSubmit={handleAdminNext} className="space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">School Administrator</h2>
            <p className="text-xs text-text-muted">Create the root login details for the School Admin.</p>
          </div>

          <Input
            label="Administrator Full Name *"
            value={adminData.adminName}
            onChange={(e) => setAdminData({ ...adminData, adminName: e.target.value })}
            placeholder="e.g. Principal John Miller"
            icon={User}
          />

          <Input
            label="Admin Email Address *"
            type="email"
            value={adminData.adminEmail}
            onChange={(e) => setAdminData({ ...adminData, adminEmail: e.target.value })}
            placeholder="principal@school.com"
            icon={Mail}
          />

          <Input
            label="Admin Password *"
            type="password"
            value={adminData.adminPassword}
            onChange={(e) => setAdminData({ ...adminData, adminPassword: e.target.value })}
            placeholder="•••••••• (Min 6 characters)"
            icon={Lock}
          />

          <Input
            label="Admin Phone Number (Optional)"
            value={adminData.adminPhone}
            onChange={(e) => setAdminData({ ...adminData, adminPhone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            icon={Phone}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
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

      {/* STEP 3: PLAN SELECTION */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Select Subscription Plan</h2>
            <p className="text-xs text-text-muted">Select a plan for your school institution. You can upgrade any time.</p>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  selectedPlan === plan.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card/40 hover:border-border/80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-foreground">{plan.name}</span>
                    {plan.id === 2 && (
                      <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Popular</span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {plan.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-text-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-foreground">{plan.price}</span>
                  <span className="text-xs text-text-muted block">/ month</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={isLoading}>
              <span>Complete Onboarding</span>
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer login link */}
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
