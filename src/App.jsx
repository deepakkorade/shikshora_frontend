import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import { GraduationCap, LogOut, Clock } from 'lucide-react'
import { useAuth } from './context/auth-context'

// Import layout components
import ShowcasePanel from './components/ShowcasePanel'
import ThemeToggle from './components/ui/ThemeToggle'
import DashboardContainer from './pages/dashboard/DashboardContainer'
import NotFound from './pages/NotFound'

// Import pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import TestWorker from './pages/TestWorker'

// ─── Session / Logout Toast ────────────────────────────────────────────────
function LogoutToast({ reason, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!reason) return;
    const show = setTimeout(() => setVisible(true), 50);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 6000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [reason, onDismiss]);

  if (!reason) return null;

  const isExpired = reason === 'session_expired';

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium
          backdrop-blur-xl min-w-[320px] max-w-[480px]
          ${isExpired
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'}
        `}
      >
        <span className={`p-1.5 rounded-lg ${isExpired ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
          {isExpired
            ? <Clock className="w-4 h-4 text-amber-400" />
            : <LogOut className="w-4 h-4 text-emerald-400" />}
        </span>
        <div className="flex-1">
          <p className="font-semibold">
            {isExpired ? 'Session Expired' : 'Logged Out Successfully'}
          </p>
          <p className={`text-xs mt-0.5 ${isExpired ? 'text-amber-300/70' : 'text-emerald-300/70'}`}>
            {isExpired
              ? 'Your 24-hour session has ended. Please sign in again.'
              : 'You have been safely signed out. See you soon!'}
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
          className="ml-2 text-lg leading-none opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Auth Shell (Left Form + Right Showcase) ───────────────────────────────
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-stretch font-sans overflow-x-hidden transition-colors duration-300 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle isFloating={false} />
      </div>

      {/* LEFT PANEL: Interactive Forms */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 relative z-10 bg-background/95 backdrop-blur-xl transition-colors duration-300 border-r border-border/30 min-h-screen">
        {/* Top Header / Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-foreground block leading-tight">
              Shikshora
            </span>
            <span className="text-[11px] font-semibold text-text-muted">Next-Gen School ERP</span>
          </div>
        </div>

        {/* Core Form Container */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          {children}
        </div>

        {/* Bottom Footer Info */}
        <div className="text-xs text-text-muted flex justify-between items-center max-w-md w-full mx-auto pt-4 border-t border-border/20">
          <span>&copy; 2026 Shikshora ERP Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Help</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Visual Showcase */}
      <ShowcasePanel />
    </div>
  );
}

// ─── Protected Route Wrapper ───────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary font-bold">
        Loading Shikshora ERP...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ─── Public/Auth Only Route Wrapper ────────────────────────────────────────
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ─── Dashboard Redirect Component (e.g. /dashboard/admissions -> /admissions) ───
function DashboardRedirect() {
  const { tab } = useParams();
  return <Navigate to={tab ? `/${tab}` : '/dashboard'} replace />;
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const { logoutReason, clearLogoutReason } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (view) => {
    if (view === 'signin') navigate('/login');
    else if (view === 'signup') navigate('/register');
    else if (view === 'forgot') navigate('/forgot-password');
    else navigate('/' + view);
  };

  return (
    <>
      {/* Global Logout / Session Toast */}
      <LogoutToast reason={logoutReason} onDismiss={clearLogoutReason} />

      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Login
                  onNavigate={handleNavigate}
                  sessionExpired={logoutReason === 'session_expired'}
                  onLoginSuccess={() => navigate('/dashboard')}
                />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Login
                  onNavigate={handleNavigate}
                  sessionExpired={logoutReason === 'session_expired'}
                  onLoginSuccess={() => navigate('/dashboard')}
                />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Register
                  onNavigate={handleNavigate}
                  onRegisterSuccess={() => navigate('/login')}
                />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <ForgotPassword onNavigate={handleNavigate} />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />

        {/* Redirect /dashboard/:tab to direct clean /:tab (e.g. /dashboard/admissions -> /admissions) */}
        <Route path="/dashboard/:tab" element={<DashboardRedirect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardContainer />
            </ProtectedRoute>
          }
        />

        {/* Direct clean URLs for all modules (e.g. /admissions, /students, /fees, /staff, /leaves-approval) */}
        <Route
          path="/:tab"
          element={
            <ProtectedRoute>
              <DashboardContainer />
            </ProtectedRoute>
          }
        />

        {/* Backend Worker connectivity tester */}
        <Route path="/test-worker" element={<TestWorker />} />

        {/* Catch-all 404 Route */}
        <Route
          path="*"
          element={<NotFound onNavigate={(dest) => navigate(dest === 'dashboard' ? '/dashboard' : '/login')} />}
        />
      </Routes>
    </>
  );
}
