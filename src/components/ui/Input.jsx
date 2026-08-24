import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Helper function for merging tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  
  const isPasswordField = type === 'password'
  const computedType = isPasswordField && showPassword ? 'text' : type

  return (
    <div className="space-y-2 text-left">
      {label && (
        <label className="text-sm font-medium text-slate-300 block" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted pointer-events-none">
            <Icon className="w-5 h-5 shrink-0" />
          </span>
        )}
        <input
          id={id}
          type={computedType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full py-3.5 bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all duration-200 placeholder:text-text-muted/50 text-foreground disabled:opacity-50",
            Icon ? "pl-12" : "pl-4",
            isPasswordField ? "pr-12" : "pr-4",
            className
          )}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-foreground disabled:hover:text-text-muted transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )
}
