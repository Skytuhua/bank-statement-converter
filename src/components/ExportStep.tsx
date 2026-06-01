import { cx } from '../lib/cx'
import { useMemo, useState } from 'react'
import { Button, Card, Field, Select, TextInput } from './ui'
import { ArrowLeftIcon, DownloadIcon, CheckIcon, ChevronDownIcon } from './icons'
import { exportByPreset } from '../core/convert'
import { PRESETS, getPreset } from '../core/presets'
import { DATE_FORMAT_LABELS, type DateFormat } from '../core/normalize'
import type { AccountMeta } from '../core/model'
import { downloadText } from '../lib/download'
import type { ConverterApi } from '../state/useConverter'

const ACCOUNT_TYPES: AccountMeta['accountType'][] = [
  'CHECKING',
  'SAVINGS',
  'CREDITCARD',
  'MONEYMRKT',
  'CREDITLINE',
]

export function ExportStep({ api }: { api: ConverterApi }) {
  const { state, result, actions } = api
  const preset = getPreset(state.presetId)
  const [showAccount, setShowAccount] = useState(false)
  const [downloaded, setDownloaded] = useState<string | null>(null)

  const artifact = useMemo(
    () =>
      exportByPreset(
        result.transactions,
        preset,
        state.accountMeta,
        { accountType: state.accountMeta.accountType, dateFormat: state.qifDateFormat },
        state.fileName || 'statement',
      ),
    [result.transactions, preset, state.accountMeta, state.qifDateFormat, state.fileName],
  )

  const onDownload = () => {
    downloadText(artifact.content, artifact.filename, artifact.mimeType)
    setDownloaded(artifact.filename)
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Choose output format</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the format your target app expects, then download.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <fieldset>
            <legend className="mb-3 text-xs font-medium text-muted-foreground">Target format / app</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PRESETS.map((p) => {
                const active = p.id === state.presetId
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      actions.setPresetId(p.id)
                      setDownloaded(null)
                    }}
                    className={cx(
                      'cursor-pointer rounded-[var(--radius-input)] border p-3 text-left transition-colors duration-150',
                      active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-heading">{p.label}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-muted-foreground">
                        .{p.format}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {preset.format === 'qif' && (
            <div className="mt-5 border-t border-border pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="QIF date format" htmlFor="qif-date">
                  <Select
                    id="qif-date"
                    value={state.qifDateFormat}
                    onChange={(e) => actions.setQifDateFormat(e.target.value as DateFormat)}
                  >
                    {(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'] as DateFormat[]).map((f) => (
                      <option key={f} value={f}>
                        {DATE_FORMAT_LABELS[f]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Account type" htmlFor="qif-acct">
                  <Select
                    id="qif-acct"
                    value={state.accountMeta.accountType}
                    onChange={(e) => actions.setAccountMeta({ accountType: e.target.value as AccountMeta['accountType'] })}
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {preset.format === 'ofx' && (
            <div className="mt-5 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setShowAccount((v) => !v)}
                aria-expanded={showAccount}
                className="flex w-full cursor-pointer items-center justify-between text-sm font-medium text-foreground"
              >
                Account details (optional)
                <ChevronDownIcon
                  width={18}
                  height={18}
                  className={cx('text-muted-foreground transition-transform duration-150', showAccount && 'rotate-180')}
                />
              </button>
              {showAccount && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Account ID" htmlFor="acct-id">
                    <TextInput id="acct-id" value={state.accountMeta.accountId} onChange={(e) => actions.setAccountMeta({ accountId: e.target.value })} />
                  </Field>
                  <Field label="Bank / routing ID" htmlFor="bank-id">
                    <TextInput id="bank-id" value={state.accountMeta.bankId} onChange={(e) => actions.setAccountMeta({ bankId: e.target.value })} />
                  </Field>
                  <Field label="Account type" htmlFor="acct-type">
                    <Select id="acct-type" value={state.accountMeta.accountType} onChange={(e) => actions.setAccountMeta({ accountType: e.target.value as AccountMeta['accountType'] })}>
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Currency" htmlFor="currency">
                    <TextInput id="currency" maxLength={3} value={state.accountMeta.currency} onChange={(e) => actions.setAccountMeta({ currency: e.target.value.toUpperCase() })} />
                  </Field>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Download panel */}
        <Card className="flex h-fit flex-col gap-4 p-5">
          <div>
            <p className="text-xs text-muted-foreground">Ready to export</p>
            <p className="tabular mt-1 text-2xl font-semibold text-heading">{result.transactions.length}</p>
            <p className="text-xs text-muted-foreground">transactions → {preset.label}</p>
          </div>
          <div className="rounded-[var(--radius-input)] bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
            {artifact.filename}
          </div>
          <Button onClick={onDownload} disabled={result.transactions.length === 0} className="w-full">
            <DownloadIcon width={18} height={18} />
            Download .{preset.format}
          </Button>
          {downloaded && (
            <div className="flex items-center gap-2 rounded-[var(--radius-input)] border border-inflow/30 bg-inflow/10 px-3 py-2 text-xs font-medium text-inflow" role="status">
              <CheckIcon width={15} height={15} />
              Saved {downloaded}
            </div>
          )}
          <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            Generated in your browser. Nothing was sent anywhere.
          </p>
        </Card>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => actions.setStep('preview')}>
          <ArrowLeftIcon width={18} height={18} />
          Back
        </Button>
        <Button variant="ghost" onClick={actions.reset}>
          Convert another file
        </Button>
      </div>
    </div>
  )
}
