import { cx } from '../lib/cx'
import { CheckIcon } from './icons'

import type { Step } from '../state/useConverter'

const LABELS: Record<Step, string> = {
  load: 'Load',
  map: 'Map',
  preview: 'Preview',
  export: 'Export',
}

export function Stepper({
  steps,
  current,
  highest,
  onJump,
}: {
  steps: Step[]
  current: Step
  /** Highest step the user has reached (controls which are clickable). */
  highest: Step
  onJump: (step: Step) => void
}) {
  const currentIdx = steps.indexOf(current)
  const highestIdx = steps.indexOf(highest)

  return (
    <nav aria-label="Conversion steps" className="mx-auto max-w-[1120px] px-4 py-4 sm:px-6">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, i) => {
          const done = i < currentIdx
          const active = step === current
          const reachable = i <= highestIdx
          return (
            <li key={step} className="flex flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => reachable && onJump(step)}
                className={cx(
                  'group flex items-center gap-2 rounded-[var(--radius-input)] px-2 py-1.5 transition-colors duration-150',
                  reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                  active ? 'text-foreground' : 'text-muted-foreground',
                  reachable && !active && 'hover:text-foreground',
                )}
              >
                <span
                  className={cx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-150',
                    active && 'bg-primary text-on-primary',
                    done && 'bg-inflow/15 text-inflow',
                    !active && !done && 'border border-border bg-card',
                  )}
                >
                  {done ? <CheckIcon width={13} height={13} /> : i + 1}
                </span>
                <span className="text-sm font-medium">{LABELS[step]}</span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cx(
                    'h-px flex-1 transition-colors duration-150',
                    i < currentIdx ? 'bg-inflow/40' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
