import { cx } from '../lib/cx'
import { useRef, useState, type DragEvent } from 'react'
import { Card } from './ui'
import { UploadIcon, LockIcon, AlertIcon, FileIcon } from './icons'
import { ACCEPTED_EXTENSIONS } from '../lib/readFile'
import type { ConverterApi } from '../state/useConverter'

export function LoadStep({ api }: { api: ConverterApi }) {
  const { state, actions } = api
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void actions.loadFile(file)
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-12">
      <h1 className="text-balance text-3xl font-semibold sm:text-4xl">
        Convert bank statement files, privately
      </h1>
      <p className="mt-3 max-w-[52ch] text-balance text-muted-foreground">
        Turn a CSV, OFX/QFX or QIF export into the format your budgeting or
        accounting app needs — without uploading your financial data anywhere.
      </p>

      <Card className="mt-8 w-full">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          aria-label="Choose a file or drag and drop it here"
          className={cx(
            'flex w-full cursor-pointer flex-col items-center gap-4 rounded-[var(--radius-card)] border-2 border-dashed p-8 transition-colors duration-150 sm:p-12',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
          )}
        >
          <span
            className={cx(
              'flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-150',
              dragOver ? 'bg-primary text-on-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            {state.parsing ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <UploadIcon width={26} height={26} />
            )}
          </span>
          <span className="text-base font-medium text-foreground">
            {state.parsing ? 'Reading file…' : 'Drop your statement here, or click to choose'}
          </span>
          <span className="text-xs text-muted-foreground">
            Accepts {ACCEPTED_EXTENSIONS.join(', ')}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void actions.loadFile(file)
            e.target.value = ''
          }}
        />
      </Card>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <LockIcon width={14} height={14} className="text-inflow" />
        <span>Your file is processed entirely in your browser. Nothing is uploaded.</span>
      </div>

      <button
        type="button"
        onClick={actions.loadSample}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
      >
        <FileIcon width={16} height={16} />
        Or try a sample bank CSV
      </button>

      {state.error && (
        <div
          role="alert"
          className="mt-6 flex w-full items-start gap-3 rounded-[var(--radius-card)] border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive"
        >
          <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FeatureRow />
    </div>
  )
}

function FeatureRow() {
  const items = [
    ['CSV → OFX / QIF', 'The conversion budgeting apps need most, with de-dup IDs.'],
    ['Smart column mapping', 'Auto-detects dates, amounts, debit/credit and separators.'],
    ['Works offline', 'No server, no sign-up, no tracking. Open it from a file if you like.'],
  ]
  return (
    <ul className="mt-10 grid w-full gap-4 text-left sm:grid-cols-3">
      {items.map(([title, body]) => (
        <li key={title} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
          <p className="text-sm font-semibold text-heading">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{body}</p>
        </li>
      ))}
    </ul>
  )
}
