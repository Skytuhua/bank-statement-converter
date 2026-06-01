// Transaction[] → CSV, using a preset's column layout.

import type { Transaction } from '../model'
import { formatIsoDate } from '../normalize'
import type { CsvField, CsvLayout } from '../presets'

/** Quote a CSV field per RFC 4180 when it contains a delimiter, quote or newline. */
export function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Neutralise CSV/formula injection: a text cell that begins with =, +, -, @,
 * tab or CR can be executed as a formula if the CSV is opened in a spreadsheet.
 * Prefix such cells with an apostrophe. Applied ONLY to free-text fields
 * (payee/memo/category) — never to date/amount columns, where a leading '-'
 * is legitimate data.
 */
export function guardFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

function fieldValue(t: Transaction, field: CsvField, layout: CsvLayout): string {
  switch (field) {
    case 'date':
      return formatIsoDate(t.date, layout.dateFormat)
    case 'payee':
      return guardFormula(t.payee)
    case 'memo':
      return guardFormula(t.memo)
    case 'amount':
      return t.amount.toFixed(2)
    case 'outflow':
      return t.amount < 0 ? Math.abs(t.amount).toFixed(2) : ''
    case 'inflow':
      return t.amount > 0 ? t.amount.toFixed(2) : ''
    case 'category':
      return guardFormula(t.category ?? '')
    case 'checkNumber':
      return t.checkNumber ?? ''
    default:
      return ''
  }
}

export function exportCsv(transactions: Transaction[], layout: CsvLayout): string {
  const header = layout.columns.map((c) => csvEscape(c.header)).join(',')
  const rows = transactions.map((t) =>
    layout.columns.map((c) => csvEscape(fieldValue(t, c.field, layout))).join(','),
  )
  // CRLF line endings — the safest for spreadsheet and finance-app importers.
  return [header, ...rows].join('\r\n') + '\r\n'
}
