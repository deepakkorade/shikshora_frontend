import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Droplets, Flame } from 'lucide-react'
import { useTheme } from '../../context/theme-provider'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function ThemeToggle({ isFloating = false }) {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'blue', name: 'Blue', icon: Droplets, color: 'text-sky-400 bg-sky-500/10' },
    { id: 'orange', name: 'Orange', icon: Flame, color: 'text-orange-400 bg-orange-500/10' },
  ]

  const ActiveIcon = themes.find(t => t.id === theme)?.icon || Sun

  return (
    <div
      className={isFloating ? "fixed top-6 right-6 z-50" : "relative"}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer transition-all duration-200 flex items-center justify-center",
          isFloating
            ? "w-11 h-11 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg"
            : "p-2 rounded-lg border border-border hover:bg-card text-text-muted hover:text-foreground"
        )}
        aria-label="Toggle Theme Menu"
        title="Change Theme"
      >
        <ActiveIcon className="w-4.5 h-4.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-2xl bg-card border border-border/70 p-1.5 shadow-2xl z-50 overflow-hidden"
          style={{ animation: 'scaleIn 0.18s cubic-bezier(.34,1.56,.64,1) both', transformOrigin: 'top right' }}
        >
          <div className="px-2.5 py-1.5 text-text-muted text-[10px] font-bold uppercase tracking-wider">
            Select Theme
          </div>
          <div className="h-[1px] bg-border/40 my-1 mx-1" />
          <div className="space-y-1">
            {themes.map((t) => {
              const Icon = t.icon
              const isSelected = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left",
                    isSelected
                      ? "bg-primary text-white font-semibold shadow-sm"
                      : "text-text-muted hover:bg-card-border/30 hover:text-foreground"
                  )}
                >
                  <span className={cn("p-1 rounded-lg", isSelected ? "bg-white/20 text-white" : t.color)}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span>{t.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
