import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { useAuth } from './context/auth-context'

// Import layout components
import ShowcasePanel from './components/ShowcasePanel'
import ThemeToggle from './components/ui/ThemeToggle'
import DashboardContainer from './pages/dashboard/DashboardContainer'

// Import pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  const [view, setView] = useState('signin') // 'signin', 'signup', 'forgot'
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <DashboardContainer />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-stretch font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      {/* LEFT PANEL: Interactive Forms */}
      <div className="w-full lg:w-[42%] flex flex-col justify-between p-6 sm:p-8 lg:p-12 xl:p-16 relative z-10 bg-background/80 backdrop-blur-md transition-colors duration-300 border-r border-border/10">
        
        {/* Top Header / Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-300">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Shikshora
            </span>
            <span className="text-xs block text-text-muted">Academy Portal</span>
          </div>
        </div>

        {/* Core Form Container - Dynamically swaps views */}
        <div className="my-auto py-10 max-w-md w-full mx-auto">
          {view === 'signin' && (
            <Login 
              onNavigate={setView} 
              onLoginSuccess={(user) => console.log('Successfully Authenticated:', user.name)} 
            />
          )}
          {view === 'signup' && (
            <Register 
              onNavigate={setView} 
              onRegisterSuccess={() => setView('signin')} 
            />
          )}
          {view === 'forgot' && (
            <ForgotPassword 
              onNavigate={setView} 
            />
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="text-xs text-text-muted flex justify-between items-center max-w-md w-full mx-auto">
          <span>&copy; 2026 Shikshora Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors duration-150">Help</a>
            <a href="#" className="hover:text-primary transition-colors duration-150">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors duration-150">Terms</a>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Pure CSS Dynamic Visual Showcase */}
      <ShowcasePanel />

    </div>
  )
}
