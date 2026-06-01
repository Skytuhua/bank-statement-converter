// Transaction[] → QIF. Flat, line-oriented; '^' terminates each record.

import type { AccountMeta, Transaction } from '../model'
import { formatIsoDate, type DateFormat } from '../normalize'

const QIF_TYPE: Record<AccountMeta['accountType'], string> = {
  CHECKING: 'Bank',
  SAVINGS: 'Bank',
  MONEYMRKT: 'Bank',
  CREDITLINE: 'Bank',
  CREDITCARD: 'CCard',
}

export interface QifOptions {
  accountType: AccountMeta['accountType']
  dateFormat: DateFormat
}

export const DEFAULT_QIF_OPTIONS: QifOptions = {
  accountType: 'CHECKING',
  dateFormat: 'MM/DD/YYYY',
}

export function exportQif(transactions: Transaction[], options: QifOptions = DEFAULT_QIF_OPTIONS): string {
  const lines: string[] = [`!Type:${QIF_TYPE[options.accountType]}`]
  for (const t of transactions) {
    lines.push(`D${formatIsoDate(t.date, options.dateFormat)}`)
    lines.push(`T${t.amount.toFixed(2)}`)
    if (t.checkNumber) lines.push(`N${t.checkNumber}`)
    if (t.payee) lines.push(`P${t.payee}`)
    if (t.memo) lines.push(`M${t.memo}`)
    if (t.category) lines.push(`L${t.category}`)
    lines.push('^')
  }
  return lines.join('\n') + '\n'
}
