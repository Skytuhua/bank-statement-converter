// OFX → Transaction[]. Handles both legacy 1.x SGML (unclosed tags, values
// trailing the tag) and 2.x XML (closed tags) with one tolerant tokeniser.

import type { AccountMeta, ParseResult, ParseWarning, Transaction } from '../model'
import { parseDate } from '../normalize'
import { makeFitid } from '../fitid'

/** Pull `<TAG>value` pairs from a block. Works for SGML and XML because the
 *  value is captured up to the next '<' or end of line (XML's closing tag also
 *  starts with '<'). */
function tagValues(block: string): Map<string, string> {
  const map = new Map<string, string>()
  const re = /<([A-Z0-9.]+)>([^<\r\n]*)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(block)) !== null) {
    const tag = m[1].toUpperCase()
    const value = m[2].trim()
    if (value && !map.has(tag)) map.set(tag, value)
  }
  return map
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
}

export function importOfx(text: string): ParseResult {
  const warnings: ParseWarning[] = []
  const transactions: Transaction[] = []

  // Account-level metadata (best-effort).
  const meta: Partial<AccountMeta> = {}
  const curdef = text.match(/<CURDEF>([^<\r\n]*)/i)?.[1]?.trim()
  if (curdef) meta.currency = curdef
  const bankId = text.match(/<BANKID>([^<\r\n]*)/i)?.[1]?.trim()
  if (bankId) meta.bankId = bankId
  const acctId = text.match(/<ACCTID>([^<\r\n]*)/i)?.[1]?.trim()
  if (acctId) meta.accountId = acctId
  const acctType = text.match(/<ACCTTYPE>([^<\r\n]*)/i)?.[1]?.trim()?.toUpperCase()
  if (acctType) meta.accountType = acctType as AccountMeta['accountType']
  if (/<CREDITCARDMSGSRSV1>|<CCSTMTRS>/i.test(text)) meta.accountType = 'CREDITCARD'

  // Split into STMTTRN blocks.
  const parts = text.split(/<STMTTRN>/i).slice(1)
  if (parts.length === 0) {
    warnings.push({ row: 0, field: 'general', message: 'No transactions (<STMTTRN>) found in OFX file.' })
    return { transactions: [], warnings, meta }
  }

  parts.forEach((part, i) => {
    const block = part.split(/<\/STMTTRN>/i)[0]
    const tv = tagValues(block)
    const rawDate = tv.get('DTPOSTED') ?? tv.get('DTUSER') ?? ''
    const date = parseDate(rawDate, 'YYYYMMDD')
    if (!date) {
      warnings.push({ row: i + 1, field: 'date', message: `Bad/missing DTPOSTED "${rawDate}"` })
    }
    const rawAmount = tv.get('TRNAMT') ?? ''
    const amount = Number(rawAmount.replace(/,/g, ''))
    if (!Number.isFinite(amount)) {
      warnings.push({ row: i + 1, field: 'amount', message: `Bad/missing TRNAMT "${rawAmount}"` })
    }

    transactions.push({
      date: date ?? '',
      amount: Number.isFinite(amount) ? amount : 0,
      payee: decodeEntities(tv.get('NAME') ?? tv.get('PAYEE') ?? ''),
      memo: decodeEntities(tv.get('MEMO') ?? ''),
      checkNumber: tv.get('CHECKNUM') || undefined,
      // Preserve the source FITID so re-export keeps de-dup identity stable.
      fitid: tv.get('FITID') ?? '',
    })
  })

  // Keep source FITIDs where present; only fill blanks deterministically so
  // re-export preserves the original de-duplication identity.
  const seen = new Map<string, number>()
  const final = transactions.map((t) => {
    if (t.fitid) return t
    const base = [meta.accountId ?? '', t.date, t.amount.toFixed(2), t.payee, t.memo].join('|')
    const seq = seen.get(base) ?? 0
    seen.set(base, seq + 1)
    return { ...t, fitid: makeFitid(t, meta.accountId ?? '', seq) }
  })
  return { transactions: final, warnings, meta }
}
