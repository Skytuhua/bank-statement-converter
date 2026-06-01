// Format and CSV-dialect detection, plus column-role guessing. Heuristic but
// conservative: when unsure it defers to the user via the mapping UI.

import type { FileFormat } from './model'

export type DetectedFormat = FileFormat | 'unknown'

/** Sniff the file format from content (and filename as a tie-breaker). */
export function detectFormat(text: string, filename = ''): DetectedFormat {
  const head = text.slice(0, 4096)
  const trimmed = head.trimStart()
  const ext = filename.toLowerCase().split('.').pop() ?? ''

  // OFX: either the SGML header block or an <OFX> root.
  if (/OFXHEADER\s*[:=]/i.test(head) || /<OFX>/i.test(head)) return 'ofx'
  // QIF: a !Type:/!Account header line.
  if (/^\s*!(Type:|Account|Option)/im.test(head)) return 'qif'

  if (ext === 'ofx' || ext === 'qfx') return 'ofx'
  if (ext === 'qif') return 'qif'
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') return 'csv'

  // Content fallback: if there are consistent delimiters, call it CSV.
  if (trimmed && /[,;\t|]/.test(trimmed.split('\n')[0] ?? '')) return 'csv'
  return 'unknown'
}

export type Delimiter = ',' | ';' | '\t' | '|'
const DELIMITERS: Delimiter[] = [',', ';', '\t', '|']

export interface CsvDialect {
  delimiter: Delimiter
  hasHeader: boolean
  decimalSeparator: '.' | ','
}

function splitLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim() !== '')
}

/** Count delimiter occurrences outside of double-quoted spans. */
function countOutsideQuotes(line: string, delim: string): number {
  let inQuotes = false
  let count = 0
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') inQuotes = !inQuotes
    else if (!inQuotes && c === delim) count++
  }
  return count
}

/**
 * Detect delimiter (by the most consistent column count across rows), whether
 * the first row is a header (non-numeric cells), and the decimal separator.
 */
export function detectCsvDialect(text: string): CsvDialect {
  const lines = splitLines(text).slice(0, 50)
  if (lines.length === 0) {
    return { delimiter: ',', hasHeader: true, decimalSeparator: '.' }
  }

  let best: Delimiter = ','
  let bestScore = -1
  for (const d of DELIMITERS) {
    const counts = lines.map((l) => countOutsideQuotes(l, d))
    const max = Math.max(...counts)
    if (max === 0) continue
    // Reward consistency: how many rows share the modal column count.
    const mode = counts.sort((a, b) => counts.filter((x) => x === b).length - counts.filter((x) => x === a).length)[0]
    const consistent = counts.filter((c) => c === mode).length
    const score = consistent * 100 + max
    if (score > bestScore) {
      bestScore = score
      best = d
    }
  }

  // Header detection: first row all non-numeric while a later row has numbers.
  const firstCells = splitCsvLine(lines[0], best)
  const secondCells = lines[1] ? splitCsvLine(lines[1], best) : []
  const looksNumeric = (s: string) => /^[\s$€£¥+\-(]*[\d.,]+[)%\s]*$/.test(s.trim())
  const firstAllText = firstCells.length > 0 && firstCells.every((c) => !looksNumeric(c) || c.trim() === '')
  const secondHasNumber = secondCells.some((c) => looksNumeric(c))
  const hasHeader = firstAllText && (secondHasNumber || secondCells.length === 0)

  // Decimal separator: look at numeric-ish cells in data rows.
  const decimalSeparator = guessDecimalSeparator(lines.slice(hasHeader ? 1 : 0), best)

  return { delimiter: best, hasHeader, decimalSeparator }
}

/** Minimal RFC-4180-ish single-line splitter (handles quotes, not embedded newlines). */
export function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQuotes = false
      } else cur += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function guessDecimalSeparator(dataLines: string[], delim: Delimiter): '.' | ',' {
  let commaDec = 0
  let dotDec = 0
  for (const line of dataLines.slice(0, 30)) {
    for (const cell of splitCsvLine(line, delim)) {
      const m = cell.trim().match(/[\d](?:[.,])(\d{1,2})$/)
      if (!m) continue
      // The separator immediately before 1–2 trailing digits is the decimal.
      const sepChar = cell.trim().match(/([.,])\d{1,2}$/)?.[1]
      if (sepChar === ',') commaDec++
      else if (sepChar === '.') dotDec++
    }
  }
  return commaDec > dotDec ? ',' : '.'
}

export type ColumnRole =
  | 'ignore'
  | 'date'
  | 'payee'
  | 'memo'
  | 'amount'
  | 'debit'
  | 'credit'
  | 'category'
  | 'checkNumber'

const ROLE_HINTS: Array<[ColumnRole, RegExp]> = [
  ['date', /\b(date|posted|transaction\s*date|booking|datum|fecha)\b/i],
  ['debit', /\b(debit|withdrawal|outflow|paid\s*out|spent|charge)\b/i],
  ['credit', /\b(credit|deposit|inflow|paid\s*in|received)\b/i],
  ['amount', /\b(amount|value|sum|betrag|montant|importe|total)\b/i],
  ['payee', /\b(payee|description|name|merchant|details|narrative|reference|beneficiary)\b/i],
  ['memo', /\b(memo|note|notes|comment|particulars)\b/i],
  ['category', /\b(category|cat|type|tag)\b/i],
  ['checkNumber', /\b(check|cheque|chq|number|no\.?)\b/i],
]

/**
 * Suggest a role for each header. Falls back to a positional guess
 * (date / payee / amount) when headers are absent or unhelpful.
 */
export function guessColumnRoles(headers: string[]): ColumnRole[] {
  const roles: ColumnRole[] = headers.map(() => 'ignore')
  const taken = new Set<ColumnRole>()

  headers.forEach((h, i) => {
    for (const [role, re] of ROLE_HINTS) {
      if (re.test(h)) {
        // Allow only one of each single-value role (but debit & credit coexist).
        if (taken.has(role) && role !== 'debit' && role !== 'credit') continue
        roles[i] = role
        taken.add(role)
        break
      }
    }
  })

  // If nothing matched a date, assume the first column is the date.
  if (!taken.has('date') && roles.length > 0) {
    roles[0] = 'date'
    taken.add('date')
  }
  // If neither amount nor debit/credit matched, assume the last column is amount.
  if (!taken.has('amount') && !taken.has('debit') && !taken.has('credit') && roles.length > 1) {
    roles[roles.length - 1] = 'amount'
  }
  // If no payee matched, pick the widest still-ignored column as the payee.
  if (!taken.has('payee')) {
    const idx = roles.findIndex((r) => r === 'ignore')
    if (idx >= 0) roles[idx] = 'payee'
  }
  return roles
}
