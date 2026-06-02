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
    <nav aria-label="Conversion steps" className="mx-auto max-w-[1120px] px-3 py-4 sm:px-6">
      <ol className="flex items-center justify-center gap-1 sm:justify-normal sm:gap-2">
        {steps.map((step, i) => {
          const done = i < currentIdx
          const active = step === current
          const reachable = i <= highestIdx
          return (
            <li
              key={step}
              // On mobile each step sizes to its content (only the active step
              // shows a label), and the row is centred. At sm+ the steps share
              // the width equally again (last one fixed) so the connectors span.
              className="flex min-w-0 flex-none items-center gap-1 last:flex-none sm:flex-1 sm:gap-2"
            >
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => reachable && onJump(step)}
                className={cx(
                  'group flex min-w-0 items-center gap-1.5 rounded-[var(--radius-input)] px-1.5 py-1.5 transition-colors duration-150 sm:shrink-0 sm:gap-2 sm:px-2',
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
                <span
                  className={cx(
                    'truncate text-[0.8125rem] font-medium sm:text-sm',
                    // On mobile, show only the active step's label so the longest
                    // one ("Preview") never truncates to "Pre…". Non-active labels
                    // stay in the accessibility tree (sr-only) and reappear at sm+.
                    !active && 'sr-only sm:not-sr-only',
                  )}
                >
                  {LABELS[step]}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cx(
                    'hidden h-px flex-1 transition-colors duration-150 sm:block',
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
