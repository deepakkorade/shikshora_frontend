import { CheckCircle2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function Alert({ type = 'success', message }) {
  if (!message) return null

  return (
    <div 
      className={cn(
        "mb-6 p-4 rounded-xl flex items-start gap-3 border transition-all duration-300 animate-slide-in",
        type === 'success' 
          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
          : "bg-rose-950/40 border-rose-500/30 text-rose-300"
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
      ) : (
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" />
      )}
      <div className="text-sm font-medium">{message}</div>
    </div>
  )
}
