// Orchestration: import any supported format into Transaction[], and export
// Transaction[] via any preset. The UI talks only to this module + detect.

import type { AccountMeta, FileFormat, ParseResult, Transaction } from './model'
import { importCsv, type CsvMapping } from './importers/csv'
import { importOfx } from './importers/ofx'
import { importQif } from './importers/qif'
import { exportCsv } from './exporters/csv'
import { exportOfx } from './exporters/ofx'
import { exportQif, type QifOptions, DEFAULT_QIF_OPTIONS } from './exporters/qif'
import { getPreset, type OutputPreset } from './presets'

export function importByFormat(
  text: string,
  format: FileFormat,
  csvMapping?: CsvMapping,
): ParseResult {
  switch (format) {
    case 'csv':
      if (!csvMapping) throw new Error('CSV import requires a column mapping.')
      return importCsv(text, csvMapping)
    case 'ofx':
      return importOfx(text)
    case 'qif':
      return importQif(text)
    default:
      throw new Error(`Unsupported input format: ${format as string}`)
  }
}

export interface ExportArtifact {
  content: string
  filename: string
  mimeType: string
}

const EXT: Record<FileFormat, string> = { csv: 'csv', ofx: 'ofx', qif: 'qif' }
const MIME: Record<FileFormat, string> = {
  csv: 'text/csv;charset=utf-8',
  ofx: 'application/x-ofx;charset=utf-8',
  qif: 'application/qif;charset=utf-8',
}

export function exportByPreset(
  transactions: Transaction[],
  preset: OutputPreset,
  meta?: Partial<AccountMeta>,
  qifOptions: QifOptions = DEFAULT_QIF_OPTIONS,
  baseName = 'statement',
): ExportArtifact {
  let content: string
  switch (preset.format) {
    case 'csv':
      if (!preset.csv) throw new Error('CSV preset is missing its layout.')
      content = exportCsv(transactions, preset.csv)
      break
    case 'ofx':
      content = exportOfx(transactions, meta)
      break
    case 'qif':
      content = exportQif(transactions, qifOptions)
      break
    default:
      throw new Error(`Unsupported output format: ${preset.format as string}`)
  }
  const safeBase = baseName.replace(/\.[^./\\]+$/, '').replace(/[^\w.-]+/g, '_') || 'statement'
  return {
    content,
    filename: `${safeBase}.${EXT[preset.format]}`,
    mimeType: MIME[preset.format],
  }
}

export { getPreset }
