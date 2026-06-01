// The canonical intermediate representation. Every importer parses *into*
// Transaction[]; every exporter serialises *from* it. Pure data, no framework.

export interface Transaction {
  /** Normalised ISO date, 'YYYY-MM-DD'. */
  date: string
  /** Signed amount; negative = outflow/debit, positive = inflow/credit. */
  amount: number
  /** Who the money went to / came from. */
  payee: string
  /** Free-form description / memo. */
  memo: string
  /** Optional category (preserved on round-trip when present). */
  category?: string
  /** Optional cheque / reference number. */
  checkNumber?: string
  /** Stable, deterministic id used for OFX de-duplication on import. */
  fitid: string
}

/** A non-fatal problem found while parsing a single source row. */
export interface ParseWarning {
  /** 1-based source row number (data rows, excluding header). */
  row: number
  field: 'date' | 'amount' | 'general'
  message: string
}

/** Account-level metadata, used when emitting OFX. */
export interface AccountMeta {
  accountId: string
  bankId: string
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDITLINE' | 'MONEYMRKT' | 'CREDITCARD'
  currency: string
}

export const DEFAULT_ACCOUNT_META: AccountMeta = {
  accountId: '000000000',
  bankId: '000000000',
  accountType: 'CHECKING',
  currency: 'USD',
}

export interface ParseResult {
  transactions: Transaction[]
  warnings: ParseWarning[]
  /** Account metadata recovered from the source (OFX), if any. */
  meta?: Partial<AccountMeta>
}

export type FileFormat = 'csv' | 'ofx' | 'qif'

/** Sum of all positive amounts (inflow), negative amounts (outflow) and net. */
export function totals(txns: Transaction[]): {
  inflow: number
  outflow: number
  net: number
  count: number
} {
  let inflow = 0
  let outflow = 0
  for (const t of txns) {
    if (t.amount >= 0) inflow += t.amount
    else outflow += t.amount
  }
  // Avoid floating-point dust in the summary.
  const round = (n: number) => Math.round(n * 100) / 100
  return {
    inflow: round(inflow),
    outflow: round(outflow),
    net: round(inflow + outflow),
    count: txns.length,
  }
}
