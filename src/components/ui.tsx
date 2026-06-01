// Small, design-system-faithful UI primitives. All inputs are controlled.
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react'
import { ChevronDownIcon } from './icons'
import { cx } from '../lib/cx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-hover active:translate-y-px disabled:opacity-50',
    secondary:
      'bg-card text-foreground border border-border hover:bg-muted active:translate-y-px disabled:opacity-50',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50',
  }
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] px-4 py-2.5',
        'text-sm font-medium cursor-pointer transition-colors duration-150',
        'disabled:cursor-not-allowed select-none',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        'bg-card border border-border rounded-[var(--radius-card)]',
        'shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cx(
          'w-full appearance-none cursor-pointer rounded-[var(--radius-input)]',
          'border border-border bg-card text-foreground',
          'px-3 py-2 pr-9 text-sm transition-colors duration-150',
          'hover:border-primary/50 focus:border-primary',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        width={16}
        height={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'w-full rounded-[var(--radius-input)] border border-border bg-card text-foreground',
        'px-3 py-2 text-sm transition-colors duration-150',
        'placeholder:text-muted-foreground/60 hover:border-primary/50 focus:border-primary',
        className,
      )}
      {...props}
    />
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id: string
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 select-none">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150',
          checked ? 'bg-primary' : 'bg-muted border border-border',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-[var(--radius-input)] border border-border bg-muted p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              'cursor-pointer rounded-[4px] px-4 py-1.5 text-sm font-medium transition-colors duration-150',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

