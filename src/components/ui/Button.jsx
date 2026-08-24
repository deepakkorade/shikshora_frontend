import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function Button({
  type = 'button',
  children,
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "w-full py-4 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed",
        variant === 'primary' && "bg-primary hover:bg-primary-hover active:opacity-90 disabled:bg-primary/50 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30",
        variant === 'secondary' && "bg-card border border-border hover:border-primary/50 hover:bg-card/80 text-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105 shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}
