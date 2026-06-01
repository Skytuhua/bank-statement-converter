import { LockIcon, SunIcon, MoonIcon } from './icons'
import type { Theme } from '../lib/useTheme'

export function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold tracking-tight text-heading sm:text-base">
            bank-statement-converter
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-inflow/30 bg-inflow/10 px-3 py-1 text-xs font-medium text-inflow sm:inline-flex">
            <LockIcon width={13} height={13} />
            Local · nothing uploaded
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-input)] border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
