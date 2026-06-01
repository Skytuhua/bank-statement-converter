// CSV → Transaction[]. Uses PapaParse for robust tokenising, then applies the
// user's column-role mapping and date/amount options.

import Papa from 'papaparse'
import type { ParseResult, ParseWarning, Transaction } from '../model'
import {
  parseAmount,
  parseDate,
  type AmountOptions,
  type DateFormat,
  DEFAULT_AMOUNT_OPTIONS,
} from '../normalize'
import { assignFitids } from '../fitid'
import type { ColumnRole, Delimiter } from '../detect'

export interface CsvMapping {
  /** Role for each source column, by index. */
  roles: ColumnRole[]
  dateFormat: DateFormat
  amount: AmountOptions
  delimiter: Delimiter
  hasHeader: boolean
}

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

/** Tokenise raw CSV text into headers + rows using the given dialect. */
export function parseCsvGrid(text: string, delimiter: Delimiter, hasHeader: boolean): ParsedCsv {
  const result = Papa.parse<string[]>(text, {
    delimiter,
    skipEmptyLines: 'greedy',
  })
  const data = (result.data as string[][]).filter((r) => r.length > 0)
  if (data.length === 0) return { headers: [], rows: [] }
  if (hasHeader) {
    const [head, ...rows] = data
    return { headers: head.map((h) => String(h).trim()), rows }
  }
  const width = Math.max(...data.map((r) => r.length))
  const headers = Array.from({ length: width }, (_, i) => `Column ${i + 1}`)
  return { headers, rows: data }
}

function firstIndexOf(roles: ColumnRole[], role: ColumnRole): number {
  return roles.indexOf(role)
}

export function importCsv(text: string, mapping: CsvMapping): ParseResult {
  const { headers, rows } = parseCsvGrid(text, mapping.delimiter, mapping.hasHeader)
  const roles = mapping.roles.length ? mapping.roles : headers.map(() => 'ignore' as ColumnRole)
  const amountOpts: AmountOptions = mapping.amount ?? DEFAULT_AMOUNT_OPTIONS

  const dateIdx = firstIndexOf(roles, 'date')
  const payeeIdx = firstIndexOf(roles, 'payee')
  const memoIdx = firstIndexOf(roles, 'memo')
  const amountIdx = firstIndexOf(roles, 'amount')
  const debitIdx = firstIndexOf(roles, 'debit')
  const creditIdx = firstIndexOf(roles, 'credit')
  const categoryIdx = firstIndexOf(roles, 'category')
  const checkIdx = firstIndexOf(roles, 'checkNumber')

  const warnings: ParseWarning[] = []
  const transactions: Transaction[] = []

  rows.forEach((cells, i) => {
    const rowNum = i + 1
    const cell = (idx: number) => (idx >= 0 ? (cells[idx] ?? '').trim() : '')

    // Skip completely blank rows silently.
    if (cells.every((c) => (c ?? '').trim() === '')) return

    const rawDate = cell(dateIdx)
    const date = parseDate(rawDate, mapping.dateFormat)
    if (!date) {
      warnings.push({
        row: rowNum,
        field: 'date',
        message: rawDate ? `Could not parse date "${rawDate}"` : 'Missing date',
      })
    }

    let amount: number | null
    if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(cell(debitIdx), amountOpts) : null
      const credit = creditIdx >= 0 ? parseAmount(cell(creditIdx), amountOpts) : null
      if (debit == null && credit == null) {
        amount = null
      } else {
        // Debit = money out (negative), credit = money in (positive).
        amount = (credit ? Math.abs(credit) : 0) - (debit ? Math.abs(debit) : 0)
        if (amountOpts.flipSign) amount = -amount
      }
    } else {
      amount = parseAmount(cell(amountIdx), amountOpts)
    }

    if (amount == null) {
      warnings.push({
        row: rowNum,
        field: 'amount',
        message: 'Could not parse amount',
      })
    }

    transactions.push({
      date: date ?? '',
      amount: amount ?? 0,
      payee: cell(payeeIdx),
      memo: cell(memoIdx),
      category: categoryIdx >= 0 ? cell(categoryIdx) || undefined : undefined,
      checkNumber: checkIdx >= 0 ? cell(checkIdx) || undefined : undefined,
      fitid: '',
    })
  })

  return { transactions: assignFitids(transactions), warnings }
}
