import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Droplets, Flame, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/theme-provider'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function ThemeToggle() {
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
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer"
        aria-label="Toggle Theme Menu"
      >
        <ActiveIcon className="w-5 h-5 animate-pulse-slow" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-40 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-1.5 shadow-2xl animate-slide-in">
          <div className="px-2.5 py-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Select Theme
          </div>
          <div className="h-[1px] bg-slate-800/60 my-1 mx-1" />
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
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left",
                    isSelected 
                      ? "bg-slate-800 text-white font-semibold" 
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  )}
                >
                  <span className={cn("p-1.5 rounded-md", t.color)}>
                    <Icon className="w-4 h-4" />
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
