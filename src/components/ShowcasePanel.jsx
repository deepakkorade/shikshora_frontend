import { Sparkles, BookOpen, Users, Award } from 'lucide-react'

export default function ShowcasePanel() {
  return (
    <div className="hidden lg:flex lg:w-[58%] relative items-center justify-center p-8 xl:p-12 overflow-hidden bg-background border-l border-border/10 transition-colors duration-300">
      
      {/* Floating Neon Blobs in Background */}
      <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] rounded-full bg-primary/20 blur-[90px] animate-blob transition-all duration-500" />
      <div className="absolute bottom-[20%] right-[10%] w-[380px] h-[380px] rounded-full bg-primary-hover/15 blur-[100px] animate-blob [animation-delay:3s] transition-all duration-500" />
      
      {/* Dynamic grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-25 transition-all duration-500" 
        style={{
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60%_50% at 50% 50%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60%_50% at 50% 50%, #000 70%, transparent 100%)'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        
        {/* Main Visual Logo Frame */}
        <div className="showcase-logo relative mb-6 flex items-center justify-center transition-all duration-300">
          
          {/* Glowing outer circles */}
          <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-pulse-slow transition-all duration-300" />
          <div className="absolute w-36 h-36 rounded-full border border-primary-hover/15 animate-ping [animation-duration:4s] transition-all duration-300" />
          <div className="absolute w-28 h-28 rounded-full border border-primary/20 transition-all duration-300" />
          
          {/* Core floating glass orb */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary-hover/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20 relative z-20 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          
        </div>

        {/* Value Proposition */}
        <h2 className="showcase-heading text-3xl xl:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight transition-all duration-300">
          Accelerate your learning journey with{' '}
          <span className="text-primary font-extrabold">
            interactive courses
          </span>
        </h2>
        <p className="showcase-desc text-base text-text-muted mb-8 max-w-md leading-relaxed transition-all duration-300">
          Gain real-world coding, business, and technology skills with expert-led masterclasses and hands-on developer sandboxes.
        </p>

        {/* Interactive Glassmorphic Metrics Grid */}
        <div className="showcase-grid grid grid-cols-3 gap-4 w-full transition-all duration-300">
          
          <div className="p-4 rounded-2xl bg-card/30 backdrop-blur-md border border-card-border hover:border-primary/30 transition-all duration-300 group text-left cursor-default">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-foreground mb-0.5 transition-colors duration-300">150+</div>
            <div className="text-[11px] text-text-muted font-medium transition-colors duration-300">Expert Courses</div>
          </div>

          <div className="p-4 rounded-2xl bg-card/30 backdrop-blur-md border border-card-border hover:border-primary/30 transition-all duration-300 group text-left cursor-default">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform duration-200">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-foreground mb-0.5 transition-colors duration-300">85k+</div>
            <div className="text-[11px] text-text-muted font-medium transition-colors duration-300">Active Students</div>
          </div>

          <div className="p-4 rounded-2xl bg-card/30 backdrop-blur-md border border-card-border hover:border-primary/30 transition-all duration-300 group text-left cursor-default">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform duration-200">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-foreground mb-0.5 transition-colors duration-300">99.2%</div>
            <div className="text-[11px] text-text-muted font-medium transition-colors duration-300">Satisfaction Rate</div>
          </div>

        </div>

      </div>

    </div>
  )
}
