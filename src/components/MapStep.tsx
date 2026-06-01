import { cx } from '../lib/cx'
import { Button, Card, Field, Select, Toggle } from './ui'
import { AlertIcon, FileIcon, ArrowRightIcon } from './icons'
import { DATE_FORMAT_LABELS, type DateFormat } from '../core/normalize'
import type { ColumnRole, Delimiter } from '../core/detect'
import type { ConverterApi } from '../state/useConverter'

const ROLE_OPTIONS: Array<{ value: ColumnRole; label: string }> = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'date', label: 'Date' },
  { value: 'payee', label: 'Payee / Description' },
  { value: 'memo', label: 'Memo / Notes' },
  { value: 'amount', label: 'Amount (signed)' },
  { value: 'debit', label: 'Debit (out)' },
  { value: 'credit', label: 'Credit (in)' },
  { value: 'category', label: 'Category' },
  { value: 'checkNumber', label: 'Check #' },
]

const DELIMITER_OPTIONS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Comma  ,' },
  { value: ';', label: 'Semicolon  ;' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe  |' },
]

export function MapStep({ api }: { api: ConverterApi }) {
  const { state, csvGrid, result, actions } = api
  const sample = csvGrid.rows[0] ?? []
  const usesSplitAmount = state.roles.includes('debit') || state.roles.includes('credit')
  const hasAmountRole = usesSplitAmount || state.roles.includes('amount')
  const hasDateRole = state.roles.includes('date')

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Map your columns</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell the converter what each column means. The preview updates as you go.
          </p>
        </div>
        <FileChip name={state.fileName} onChange={actions.reset} />
      </div>

      <Card className="p-5">
        {/* CSV reading options */}
        <div className="flex flex-wrap items-end gap-5">
          <Field
            label="Delimiter"
            htmlFor="delimiter"
            hint="The character between columns — auto-detected."
          >
            <Select
              id="delimiter"
              value={state.delimiter}
              onChange={(e) => actions.setDelimiter(e.target.value as Delimiter)}
            >
              {DELIMITER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="pb-2">
            <Toggle
              id="has-header"
              checked={state.hasHeader}
              onChange={actions.setHasHeader}
              label="First row is a header"
            />
          </div>
        </div>

        <hr className="my-5 border-border" />

        {/* Column role grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {csvGrid.headers.map((header, i) => (
            <Field key={i} label={header || `Column ${i + 1}`} htmlFor={`role-${i}`}>
              <Select
                id={`role-${i}`}
                value={state.roles[i] ?? 'ignore'}
                onChange={(e) => actions.setRole(i, e.target.value as ColumnRole)}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <span className="block truncate font-mono text-xs text-muted-foreground" title={sample[i] ?? ''}>
                e.g. {sample[i] ? sample[i] : '—'}
              </span>
            </Field>
          ))}
        </div>

        <hr className="my-5 border-border" />

        {/* Date + amount options */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Date format"
            htmlFor="date-format"
            hint={
              state.dateAmbiguous && (
                <span className="flex items-center gap-1 text-accent">
                  <AlertIcon width={12} height={12} />
                  Ambiguous — please confirm day/month order.
                </span>
              )
            }
          >
            <Select
              id="date-format"
              value={state.dateFormat}
              onChange={(e) => actions.setDateFormat(e.target.value as DateFormat)}
            >
              {(Object.keys(DATE_FORMAT_LABELS) as DateFormat[]).map((f) => (
                <option key={f} value={f}>
                  {DATE_FORMAT_LABELS[f]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Decimal separator" htmlFor="decimal-sep">
            <Select
              id="decimal-sep"
              value={state.amount.decimalSeparator}
              onChange={(e) => actions.setAmount({ decimalSeparator: e.target.value as '.' | ',' })}
            >
              <option value=".">Point  1234.56</option>
              <option value=",">Comma  1234,56</option>
            </Select>
          </Field>

          <Field label="Thousands separator" htmlFor="thousands-sep">
            <Select
              id="thousands-sep"
              value={state.amount.thousandsSeparator}
              onChange={(e) =>
                actions.setAmount({ thousandsSeparator: e.target.value as ',' | '.' | ' ' | "'" | '' })
              }
            >
              <option value=",">Comma  1,234</option>
              <option value=".">Point  1.234</option>
              <option value=" ">Space  1 234</option>
              <option value="'">Apostrophe  1'234</option>
              <option value="">None</option>
            </Select>
          </Field>

          <div className="flex flex-col justify-end gap-3 pb-1">
            <Toggle
              id="strip-currency"
              checked={state.amount.stripCurrency}
              onChange={(v) => actions.setAmount({ stripCurrency: v })}
              label="Strip currency symbols"
            />
            <Toggle
              id="flip-sign"
              checked={state.amount.flipSign}
              onChange={(v) => actions.setAmount({ flipSign: v })}
              label="Flip +/− signs"
            />
          </div>
        </div>

        {usesSplitAmount && (
          <p className="mt-4 rounded-[var(--radius-input)] bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Using separate Debit/Credit columns: debits become negative (outflow),
            credits positive (inflow).
          </p>
        )}
      </Card>

      <ValidationHints
        hasDateRole={hasDateRole}
        hasAmountRole={hasAmountRole}
        warningCount={result.warnings.length}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={() => actions.setStep('preview')} disabled={!hasDateRole || !hasAmountRole}>
          Preview transactions
          <ArrowRightIcon width={18} height={18} />
        </Button>
      </div>
    </div>
  )
}

function ValidationHints({
  hasDateRole,
  hasAmountRole,
  warningCount,
}: {
  hasDateRole: boolean
  hasAmountRole: boolean
  warningCount: number
}) {
  const missing: string[] = []
  if (!hasDateRole) missing.push('a Date column')
  if (!hasAmountRole) missing.push('an Amount column (or Debit/Credit)')
  if (missing.length === 0 && warningCount === 0) return null

  return (
    <div
      className={cx(
        'mt-4 flex items-start gap-3 rounded-[var(--radius-card)] border p-3 text-sm',
        missing.length
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-accent/30 bg-accent/10 text-accent',
      )}
    >
      <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
      <span>
        {missing.length
          ? `Please assign ${missing.join(' and ')} to continue.`
          : `${warningCount} row${warningCount === 1 ? '' : 's'} could not be fully parsed — you can review them in the preview.`}
      </span>
    </div>
  )
}

function FileChip({ name, onChange }: { name: string; onChange: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
      <FileIcon width={15} height={15} className="text-muted-foreground" />
      <span className="max-w-[180px] truncate font-mono text-xs" title={name}>
        {name}
      </span>
      <button
        type="button"
        onClick={onChange}
        className="cursor-pointer text-xs font-medium text-primary hover:underline"
      >
        Change
      </button>
    </div>
  )
}
