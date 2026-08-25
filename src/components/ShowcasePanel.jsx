import { GraduationCap, ShieldCheck, Zap, Users, BarChart3, Clock, CheckCircle2 } from 'lucide-react'

export default function ShowcasePanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-8 xl:p-12 overflow-hidden bg-gradient-to-br from-primary/5 via-card/40 to-background border-l border-border/40 transition-colors duration-300">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-[15%] left-[15%] w-[360px] h-[360px] rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[380px] h-[380px] rounded-full bg-primary-hover/10 blur-[110px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: '3.5rem 3.5rem',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)'
        }}
      />

      {/* Center Container */}
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center space-y-8">
        
        {/* Main Badge / Icon */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> Next-Gen AI School ERP
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3">
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Empower Your School with{' '}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Smart Automation
            </span>
          </h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto">
            All-in-one SaaS platform unifying admissions, attendance, fees, exams, and teacher-parent communications.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3.5 w-full text-left">
          <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 transition-all shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Role-Based Access</p>
              <p className="text-[11px] text-text-muted mt-0.5">Custom permissions for Admin, Teachers, Parents & Students.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 transition-all shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Instant Attendance</p>
              <p className="text-[11px] text-text-muted mt-0.5">Live tracking with SMS & parent portal notifications.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 transition-all shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 mt-0.5">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Tuition & Invoicing</p>
              <p className="text-[11px] text-text-muted mt-0.5">Online fee collections with automatic receipt generation.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 transition-all shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Teacher Gradebook</p>
              <p className="text-[11px] text-text-muted mt-0.5">Term assessments, report cards & PDF generation.</p>
            </div>
          </div>
        </div>

        {/* Social Proof / Metrics Row */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-border/40 text-left">
          <div>
            <span className="text-lg font-black text-foreground block">500+</span>
            <span className="text-[11px] text-text-muted">Campuses Active</span>
          </div>
          <div className="h-7 w-[1px] bg-border/50" />
          <div>
            <span className="text-lg font-black text-foreground block">250k+</span>
            <span className="text-[11px] text-text-muted">Students Managed</span>
          </div>
          <div className="h-7 w-[1px] bg-border/50" />
          <div>
            <span className="text-lg font-black text-emerald-500 block flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 99.9%
            </span>
            <span className="text-[11px] text-text-muted">Uptime Cloud SLA</span>
          </div>
        </div>

      </div>

    </div>
  )
}
