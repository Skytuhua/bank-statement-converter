import { useCallback, useMemo, useState } from 'react'
import {
  detectFormat,
  detectCsvDialect,
  guessColumnRoles,
  type ColumnRole,
  type Delimiter,
} from '../core/detect'
import {
  guessDateFormat,
  DEFAULT_AMOUNT_OPTIONS,
  type AmountOptions,
  type DateFormat,
} from '../core/normalize'
import { parseCsvGrid, type CsvMapping } from '../core/importers/csv'
import { importByFormat } from '../core/convert'
import {
  DEFAULT_ACCOUNT_META,
  type AccountMeta,
  type FileFormat,
  type ParseResult,
} from '../core/model'
import { readFileSmart, describeUnsupportedFile } from '../lib/readFile'
import { SAMPLE_CSV, SAMPLE_CSV_NAME } from '../lib/sample'

export type Step = 'load' | 'map' | 'preview' | 'export'
export const STEPS: Step[] = ['load', 'map', 'preview', 'export']

export interface ConverterState {
  step: Step
  fileName: string
  rawText: string
  inputFormat: FileFormat | null
  delimiter: Delimiter
  hasHeader: boolean
  roles: ColumnRole[]
  dateFormat: DateFormat
  dateAmbiguous: boolean
  amount: AmountOptions
  presetId: string
  accountMeta: AccountMeta
  qifDateFormat: DateFormat
  parsing: boolean
  error: string | null
}

const initialState: ConverterState = {
  step: 'load',
  fileName: '',
  rawText: '',
  inputFormat: null,
  delimiter: ',',
  hasHeader: true,
  roles: [],
  dateFormat: 'auto',
  dateAmbiguous: false,
  amount: DEFAULT_AMOUNT_OPTIONS,
  presetId: 'ofx',
  accountMeta: DEFAULT_ACCOUNT_META,
  qifDateFormat: 'MM/DD/YYYY',
  parsing: false,
  error: null,
}

export function useConverter() {
  const [state, setState] = useState<ConverterState>(initialState)

  const patch = useCallback((p: Partial<ConverterState>) => {
    setState((s) => ({ ...s, ...p }))
  }, [])

  // Re-guess CSV roles + date format for a given raw text and dialect.
  const guessFor = (
    text: string,
    delimiter: Delimiter,
    hasHeader: boolean,
  ): { roles: ColumnRole[]; dateFormat: DateFormat; dateAmbiguous: boolean; amount: AmountOptions } => {
    const { headers, rows } = parseCsvGrid(text, delimiter, hasHeader)
    const roles = guessColumnRoles(headers)
    const dateIdx = roles.indexOf('date')
    const dateSamples = dateIdx >= 0 ? rows.slice(0, 25).map((r) => r[dateIdx] ?? '') : []
    const guess = guessDateFormat(dateSamples)
    const dialect = detectCsvDialect(text)
    return {
      roles,
      dateFormat: guess.format,
      dateAmbiguous: guess.ambiguous,
      amount: {
        ...DEFAULT_AMOUNT_OPTIONS,
        decimalSeparator: dialect.decimalSeparator,
        thousandsSeparator: dialect.decimalSeparator === ',' ? '.' : ',',
      },
    }
  }

  const ingest = useCallback((text: string, name: string) => {
    const cleaned = text.replace(/^\uFEFF/, '')
    const format = detectFormat(cleaned, name)
    if (format === 'unknown') {
      patch({
        error: describeUnsupportedFile(name),
        parsing: false,
      })
      return
    }
    if (format === 'csv') {
      const dialect = detectCsvDialect(cleaned)
      const g = guessFor(cleaned, dialect.delimiter, dialect.hasHeader)
      setState((s) => ({
        ...s,
        fileName: name,
        rawText: cleaned,
        inputFormat: 'csv',
        delimiter: dialect.delimiter,
        hasHeader: dialect.hasHeader,
        ...g,
        step: 'map',
        parsing: false,
        error: null,
      }))
      return
    }
    // OFX / QIF self-describe: parse straight to preview, prefill metadata.
    const result = importByFormat(cleaned, format)
    const meta = { ...DEFAULT_ACCOUNT_META, ...(result.meta ?? {}) }
    setState((s) => ({
      ...s,
      fileName: name,
      rawText: cleaned,
      inputFormat: format,
      accountMeta: meta,
      // If converting away from this format, default the output to CSV-generic.
      presetId: format === 'ofx' ? 'csv-generic' : 'ofx',
      step: 'preview',
      parsing: false,
      error: null,
    }))
  }, [patch])

  const loadFile = useCallback(
    async (file: File) => {
      patch({ parsing: true, error: null })
      try {
        const text = await readFileSmart(file)
        ingest(text, file.name)
      } catch {
        patch({
          error: `Could not read "${file.name}". The file may be empty or corrupted — please try downloading it from your bank again, or pick another file.`,
          parsing: false,
        })
      }
    },
    [ingest, patch],
  )

  const loadSample = useCallback(() => {
    patch({ parsing: true, error: null })
    ingest(SAMPLE_CSV, SAMPLE_CSV_NAME)
  }, [ingest, patch])

  const setDelimiter = useCallback((delimiter: Delimiter) => {
    setState((s) => ({ ...s, delimiter, ...guessFor(s.rawText, delimiter, s.hasHeader) }))
  }, [])

  const setHasHeader = useCallback((hasHeader: boolean) => {
    setState((s) => ({ ...s, hasHeader, ...guessFor(s.rawText, s.delimiter, hasHeader) }))
  }, [])

  const setRole = useCallback((index: number, role: ColumnRole) => {
    setState((s) => {
      const roles = [...s.roles]
      roles[index] = role
      return { ...s, roles }
    })
  }, [])

  const reset = useCallback(() => setState(initialState), [])

  // ----- Derived (memoised) -----
  const csvGrid = useMemo(() => {
    if (state.inputFormat !== 'csv' || !state.rawText) return { headers: [], rows: [] }
    return parseCsvGrid(state.rawText, state.delimiter, state.hasHeader)
  }, [state.inputFormat, state.rawText, state.delimiter, state.hasHeader])

  const csvMapping = useMemo<CsvMapping>(
    () => ({
      roles: state.roles,
      dateFormat: state.dateFormat,
      amount: state.amount,
      delimiter: state.delimiter,
      hasHeader: state.hasHeader,
    }),
    [state.roles, state.dateFormat, state.amount, state.delimiter, state.hasHeader],
  )

  const result: ParseResult = useMemo(() => {
    if (!state.inputFormat || !state.rawText) {
      return { transactions: [], warnings: [] }
    }
    try {
      return importByFormat(state.rawText, state.inputFormat, csvMapping)
    } catch (e) {
      return {
        transactions: [],
        warnings: [{ row: 0, field: 'general', message: e instanceof Error ? e.message : 'Parse error' }],
      }
    }
  }, [state.inputFormat, state.rawText, csvMapping])

  return {
    state,
    csvGrid,
    result,
    actions: {
      loadFile,
      loadSample,
      setStep: (step: Step) => patch({ step }),
      setDelimiter,
      setHasHeader,
      setRole,
      setDateFormat: (dateFormat: DateFormat) => patch({ dateFormat, dateAmbiguous: false }),
      setAmount: (amount: Partial<AmountOptions>) => setState((s) => ({ ...s, amount: { ...s.amount, ...amount } })),
      setPresetId: (presetId: string) => patch({ presetId }),
      setAccountMeta: (meta: Partial<AccountMeta>) =>
        setState((s) => ({ ...s, accountMeta: { ...s.accountMeta, ...meta } })),
      setQifDateFormat: (qifDateFormat: DateFormat) => patch({ qifDateFormat }),
      clearError: () => patch({ error: null }),
      reset,
    },
  }
}

export type ConverterApi = ReturnType<typeof useConverter>
