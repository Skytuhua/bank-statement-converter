// QIF → Transaction[]. QIF is a flat, line-oriented format: each line starts
// with a single-letter field code; a '^' line ends a transaction record.
//   D date  T/U amount  P payee  M memo  L category  N number/check  C cleared

import type { ParseResult, ParseWarning, Transaction } from '../model'
import { parseAmount, parseDate, DEFAULT_AMOUNT_OPTIONS } from '../normalize'
import { assignFitids } from '../fitid'

export function importQif(text: string): ParseResult {
  const warnings: ParseWarning[] = []
  const transactions: Transaction[] = []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')

  let cur: Partial<Record<string, string>> = {}
  let started = false
  let recordIndex = 0

  // QIF amounts can use either '.' or ',' as decimal; allow both, no grouping.
  const amountOpts = { ...DEFAULT_AMOUNT_OPTIONS, thousandsSeparator: ',' as const }

  const flush = () => {
    if (!started) return
    recordIndex++
    const rawDate = cur.D ?? ''
    // QIF often uses apostrophe for 2000s years (1/2'23) and varied orders.
    const date = parseDate(rawDate.replace(/'/g, '/'), 'auto')
    if (!date) warnings.push({ row: recordIndex, field: 'date', message: `Bad/missing date "${rawDate}"` })

    const rawAmount = cur.T ?? cur.U ?? ''
    const amount = parseAmount(rawAmount, amountOpts)
    if (amount == null) warnings.push({ row: recordIndex, field: 'amount', message: `Bad/missing amount "${rawAmount}"` })

    transactions.push({
      date: date ?? '',
      amount: amount ?? 0,
      payee: cur.P ?? '',
      memo: cur.M ?? '',
      category: cur.L || undefined,
      checkNumber: cur.N || undefined,
      fitid: '',
    })
    cur = {}
    started = false
  }

  for (const raw of lines) {
    const line = raw.replace(/\n$/, '')
    if (line === '') continue
    const code = line[0]
    const value = line.slice(1).trim()
    if (code === '!') continue // header / type declaration
    if (code === '^') {
      flush()
      continue
    }
    // First field of a record marks its start.
    started = true
    // Keep the first occurrence of each code within a record.
    if (cur[code] === undefined) cur[code] = value
    else if (code === 'M' || code === 'P') cur[code] += ` ${value}` // allow split memos
  }
  flush() // in case the file omits a trailing '^'

  if (transactions.length === 0) {
    warnings.push({ row: 0, field: 'general', message: 'No transactions found in QIF file.' })
  }
  return { transactions: assignFitids(transactions), warnings }
}
