// Deterministic transaction id for OFX <FITID>. Identical transactions must
// produce identical ids so that personal-finance apps de-duplicate correctly
// when the same file is imported twice. FNV-1a (32-bit) over the stable fields.

import type { Transaction } from './model'

export function fnv1a(str: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    // 32-bit FNV prime multiply, kept in unsigned 32-bit range.
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/**
 * Stable id from a transaction's content. `salt` (e.g. the account id) lets two
 * different accounts with an identical transaction still get distinct ids.
 * `seq` disambiguates genuinely identical same-day transactions within a file.
 */
export function makeFitid(
  t: Pick<Transaction, 'date' | 'amount' | 'payee' | 'memo'>,
  salt = '',
  seq = 0,
): string {
  const key = [salt, t.date, t.amount.toFixed(2), t.payee, t.memo, seq].join('|')
  return fnv1a(key)
}

/**
 * Assign stable fitids to a list, disambiguating duplicates by incrementing a
 * per-content sequence so no two transactions share an id within one file.
 */
export function assignFitids(txns: Transaction[], salt = ''): Transaction[] {
  const seen = new Map<string, number>()
  return txns.map((t) => {
    const base = [salt, t.date, t.amount.toFixed(2), t.payee, t.memo].join('|')
    const seq = seen.get(base) ?? 0
    seen.set(base, seq + 1)
    return { ...t, fitid: makeFitid(t, salt, seq) }
  })
}
