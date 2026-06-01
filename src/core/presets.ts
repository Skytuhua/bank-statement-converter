// Output presets — one per target app. Each preset fixes the output format and,
// for CSV targets, the exact column layout that the app expects on import.

import type { FileFormat } from './model'
import type { DateFormat } from './normalize'

export type CsvField =
  | 'date'
  | 'payee'
  | 'memo'
  | 'amount'
  | 'outflow'
  | 'inflow'
  | 'category'
  | 'checkNumber'

export interface CsvColumn {
  header: string
  field: CsvField
}

export interface CsvLayout {
  columns: CsvColumn[]
  dateFormat: DateFormat
}

export interface OutputPreset {
  id: string
  label: string
  format: FileFormat
  description: string
  csv?: CsvLayout
}

export const PRESETS: OutputPreset[] = [
  {
    id: 'csv-generic',
    label: 'CSV — generic',
    format: 'csv',
    description: 'Date, Payee, Memo, Amount, Category, Check# — ISO dates, signed amount.',
    csv: {
      dateFormat: 'YYYY-MM-DD',
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Payee', field: 'payee' },
        { header: 'Memo', field: 'memo' },
        { header: 'Amount', field: 'amount' },
        { header: 'Category', field: 'category' },
        { header: 'Check#', field: 'checkNumber' },
      ],
    },
  },
  {
    id: 'ynab',
    label: 'YNAB (CSV)',
    format: 'csv',
    description: 'Date, Payee, Memo, Outflow, Inflow — the layout YNAB imports.',
    csv: {
      dateFormat: 'MM/DD/YYYY',
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Payee', field: 'payee' },
        { header: 'Memo', field: 'memo' },
        { header: 'Outflow', field: 'outflow' },
        { header: 'Inflow', field: 'inflow' },
      ],
    },
  },
  {
    id: 'actual',
    label: 'Actual Budget (CSV)',
    format: 'csv',
    description: 'Date, Payee, Notes, Amount — ISO dates, single signed amount.',
    csv: {
      dateFormat: 'YYYY-MM-DD',
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Payee', field: 'payee' },
        { header: 'Notes', field: 'memo' },
        { header: 'Amount', field: 'amount' },
      ],
    },
  },
  {
    id: 'gnucash',
    label: 'GnuCash (CSV)',
    format: 'csv',
    description: 'Date, Description, Memo, Amount, Category — ISO dates.',
    csv: {
      dateFormat: 'YYYY-MM-DD',
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Description', field: 'payee' },
        { header: 'Memo', field: 'memo' },
        { header: 'Amount', field: 'amount' },
        { header: 'Category', field: 'category' },
      ],
    },
  },
  {
    id: 'ofx',
    label: 'OFX 2.x (.ofx)',
    format: 'ofx',
    description: 'Open Financial Exchange — importable by YNAB, GnuCash, Quicken; de-dupes via FITID.',
  },
  {
    id: 'qif',
    label: 'Quicken QIF (.qif)',
    format: 'qif',
    description: 'Quicken Interchange Format — for Quicken, GnuCash, MoneyMoney and more.',
  },
]

export function getPreset(id: string): OutputPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}
