import { cx } from '../lib/cx'
import { useMemo, useState } from 'react'
import { Button, Card } from './ui'
import { AlertIcon, ArrowRightIcon, ArrowLeftIcon } from './icons'
import { totals } from '../core/model'
import type { ConverterApi } from '../state/useConverter'

const MAX_ROWS = 500 // cap rendered rows for performance; all rows still export

export function PreviewStep({ api }: { api: ConverterApi }) {
  const { state, result, actions } = api
  const [onlyWarnings, setOnlyWarnings] = useState(false)

  const warnRows = useMemo(() => new Set(result.warnings.map((w) => w.row)), [result.warnings])
  const sums = useMemo(() => totals(result.transactions), [result.transactions])

  const rows = result.transactions
  const visible = onlyWarnings ? rows.filter((_, i) => warnRows.has(i + 1)) : rows
  const shown = visible.slice(0, MAX_ROWS)
  const backStep = state.inputFormat === 'csv' ? 'map' : 'load'

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Preview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the parsed transactions before exporting.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Transactions" value={String(sums.count)} />
        <Stat label="Inflow" value={money(sums.inflow)} tone="inflow" />
        <Stat label="Outflow" value={money(sums.outflow)} tone="outflow" />
        <Stat label="Net" value={money(sums.net)} tone={sums.net >= 0 ? 'inflow' : 'outflow'} />
      </div>

      {result.warnings.length > 0 && (
        <button
          type="button"
          onClick={() => setOnlyWarnings((v) => !v)}
          className={cx(
            'mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border px-3 py-2 text-sm font-medium transition-colors',
            onlyWarnings
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/15',
          )}
          aria-pressed={onlyWarnings}
        >
          <AlertIcon width={16} height={16} />
          {result.warnings.length} parsing warning{result.warnings.length === 1 ? '' : 's'}
          <span className="text-xs opacity-80">· {onlyWarnings ? 'show all' : 'show only these'}</span>
        </button>
      )}

      <Card className="mt-4 overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState onlyWarnings={onlyWarnings} />
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full border-collapse text-left font-mono text-[0.8125rem]">
              <thead className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <Th className="w-10 text-right">#</Th>
                  <Th>Date</Th>
                  <Th>Payee</Th>
                  <Th>Memo</Th>
                  <Th className="text-right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t, i) => {
                  const rowNum = onlyWarnings ? null : i + 1
                  const flagged = rowNum != null && warnRows.has(rowNum)
                  return (
                    <tr
                      key={i}
                      className={cx(
                        'border-t border-border',
                        i % 2 === 1 && 'bg-muted/30',
                        flagged && 'bg-accent/10',
                      )}
                    >
                      <Td className="text-right text-muted-foreground">{i + 1}</Td>
                      <Td className={cx(!t.date && 'text-destructive')}>{t.date || '⚠ no date'}</Td>
                      <Td className="max-w-[260px] truncate" title={t.payee}>
                        {t.payee || <span className="text-muted-foreground/60">—</span>}
                      </Td>
                      <Td className="max-w-[260px] truncate text-muted-foreground" title={t.memo}>
                        {t.memo || '—'}
                      </Td>
                      <Td className={cx('tabular text-right font-medium', t.amount < 0 ? 'text-outflow' : 'text-inflow')}>
                        {money(t.amount)}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {visible.length > MAX_ROWS && (
              <p className="border-t border-border bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
                Showing first {MAX_ROWS} of {visible.length} rows. All rows will be exported.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => actions.setStep(backStep)}>
          <ArrowLeftIcon width={18} height={18} />
          Back
        </Button>
        <Button onClick={() => actions.setStep('export')} disabled={rows.length === 0}>
          Choose output
          <ArrowRightIcon width={18} height={18} />
        </Button>
      </div>
    </div>
  )
}

function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'inflow' | 'outflow' }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cx(
          'tabular mt-1 text-lg font-semibold',
          tone === 'inflow' && 'text-inflow',
          tone === 'outflow' && 'text-outflow',
          !tone && 'text-heading',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cx('px-3 py-2 font-medium', className)}>{children}</th>
}
function Td({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <td className={cx('px-3 py-1.5', className)} title={title}>
      {children}
    </td>
  )
}

function EmptyState({ onlyWarnings }: { onlyWarnings: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        {onlyWarnings ? 'No rows with warnings.' : 'No transactions to show.'}
      </p>
      <p className="max-w-[40ch] text-xs text-muted-foreground">
        {onlyWarnings
          ? 'Every row parsed cleanly. Toggle the filter off to see them all.'
          : 'Go back and check the column mapping — the date and amount columns must be assigned.'}
      </p>
    </div>
  )
}
