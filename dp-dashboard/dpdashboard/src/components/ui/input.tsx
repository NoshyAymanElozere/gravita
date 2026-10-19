import * as React from 'react'
import { cn } from '@/utils/utils'
import { Search, Eye, EyeOff, X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  clearable?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, clearable, onClear, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            'flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-1 text-sm shadow-xs transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring',
            'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none',
            props.readOnly && 'bg-gray-50/50 border-gray-200/50 text-gray-700 cursor-default focus:ring-0 focus:border-gray-200/50',
            leftIcon && 'ps-9',
            (rightIcon || isPassword || clearable) && 'pe-9',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {/* Right slot: clear, toggle password, or custom icon */}
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : clearable && value ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : rightIcon ? (
          <div className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        ) : null}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Search Input ─────────────────────────────────────────────────────────────

interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onSearch?.(e.target.value)
    }
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { Input, SearchInput }
