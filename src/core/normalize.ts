// Date and amount normalisation. Pure, exhaustively unit-tested, because this
// is where competing tools quietly corrupt data.

export type DateFormat =
  | 'auto'
  | 'YYYY-MM-DD'
  | 'YYYY/MM/DD'
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'MM-DD-YYYY'
  | 'DD-MM-YYYY'
  | 'DD.MM.YYYY'
  | 'YYYYMMDD'

export const DATE_FORMAT_LABELS: Record<DateFormat, string> = {
  auto: 'Auto-detect',
  'YYYY-MM-DD': 'YYYY-MM-DD (ISO)',
  'YYYY/MM/DD': 'YYYY/MM/DD',
  'MM/DD/YYYY': 'MM/DD/YYYY (US)',
  'DD/MM/YYYY': 'DD/MM/YYYY (EU/UK)',
  'MM-DD-YYYY': 'MM-DD-YYYY',
  'DD-MM-YYYY': 'DD-MM-YYYY',
  'DD.MM.YYYY': 'DD.MM.YYYY (DE)',
  YYYYMMDD: 'YYYYMMDD (compact)',
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  // Validate against the actual calendar (rejects 2023-02-30 etc.).
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null
  }
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function normYear(y: number): number {
  if (y < 100) return y < 70 ? 2000 + y : 1900 + y // 2-digit year window
  return y
}

/** Try a textual month form like "12 Jan 2023" / "Jan 12, 2023". */
function parseTextual(input: string): string | null {
  const m = input
    .toLowerCase()
    .match(/(\d{1,2})\s*[-\s]\s*([a-z]{3,})\s*[-,\s]\s*(\d{2,4})/)
  if (m) {
    const day = parseInt(m[1], 10)
    const mon = MONTHS[m[2].slice(0, 3)]
    if (mon) return iso(normYear(parseInt(m[3], 10)), mon, day)
  }
  const m2 = input
    .toLowerCase()
    .match(/([a-z]{3,})\s+(\d{1,2})\s*[-,\s]\s*(\d{2,4})/)
  if (m2) {
    const mon = MONTHS[m2[1].slice(0, 3)]
    if (mon) return iso(normYear(parseInt(m2[3], 10)), mon, parseInt(m2[2], 10))
  }
  return null
}

/**
 * Parse a date string into ISO 'YYYY-MM-DD' using the given format, or null if
 * it cannot be parsed. 'auto' uses guessDateFormat heuristics on a single value.
 */
export function parseDate(raw: string, format: DateFormat = 'auto'): string | null {
  if (raw == null) return null
  const input = String(raw).trim()
  if (!input) return null

  // OFX-style timestamps: 20230115, 20230115120000, 20230115120000.000[-5:EST]
  const ofx = input.match(/^(\d{4})(\d{2})(\d{2})/)
  if ((format === 'YYYYMMDD' || format === 'auto') && ofx && input.length >= 8 && /^\d/.test(input)) {
    const res = iso(parseInt(ofx[1], 10), parseInt(ofx[2], 10), parseInt(ofx[3], 10))
    if (res) return res
    if (format === 'YYYYMMDD') return null
  }

  if (format !== 'auto') {
    return parseWithFormat(input, format)
  }

  // auto: textual first, then ISO, then numeric heuristics.
  const textual = parseTextual(input)
  if (textual) return textual

  const parts = input.split(/[-/.]/).map((p) => p.trim())
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    const nums = parts.map((p) => parseInt(p, 10))
    // 4-digit-first => YYYY M D
    if (parts[0].length === 4) return iso(nums[0], nums[1], nums[2])
    // Otherwise the year is last (D/M/Y or M/D/Y), incl. 2-digit years
    // (e.g. Quicken's "1/2/23"); disambiguate day vs month by value.
    {
      const y = normYear(nums[2])
      if (nums[0] > 12 && nums[1] <= 12) return iso(y, nums[1], nums[0]) // DD/MM
      if (nums[1] > 12 && nums[0] <= 12) return iso(y, nums[0], nums[1]) // MM/DD
      // Ambiguous: default to MM/DD (most common in raw bank CSV/US exports).
      return iso(y, nums[0], nums[1])
    }
  }
  return null
}

function parseWithFormat(input: string, format: DateFormat): string | null {
  if (format === 'YYYYMMDD') {
    const m = input.match(/^(\d{4})(\d{2})(\d{2})/)
    return m ? iso(+m[1], +m[2], +m[3]) : null
  }
  const parts = input.split(/[-/.]/).map((p) => parseInt(p.trim(), 10))
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
  const [a, b, c] = parts
  switch (format) {
    case 'YYYY-MM-DD':
    case 'YYYY/MM/DD':
      return iso(a, b, c)
    case 'MM/DD/YYYY':
    case 'MM-DD-YYYY':
      return iso(normYear(c), a, b)
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
    case 'DD.MM.YYYY':
      return iso(normYear(c), b, a)
    default:
      return null
  }
}

export interface DateGuess {
  format: DateFormat
  ambiguous: boolean
}

/**
 * Inspect a column of date samples and guess the most likely format. Flags
 * ambiguity when both MM/DD and DD/MM remain plausible (e.g. every value <= 12).
 */
export function guessDateFormat(samples: string[]): DateGuess {
  const vals = samples.map((s) => String(s ?? '').trim()).filter(Boolean)
  if (vals.length === 0) return { format: 'auto', ambiguous: false }

  if (vals.every((v) => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(v))) {
    const sep = vals[0].includes('/') ? 'YYYY/MM/DD' : 'YYYY-MM-DD'
    return { format: sep as DateFormat, ambiguous: false }
  }
  if (vals.every((v) => /^\d{8}$/.test(v))) {
    return { format: 'YYYYMMDD', ambiguous: false }
  }

  // Determine the separator family among dd?mm?yyyy forms.
  const dot = vals.every((v) => /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(v))
  if (dot) return { format: 'DD.MM.YYYY', ambiguous: false }

  const slash = vals.every((v) => /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v))
  const dash = vals.every((v) => /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(v))
  if (slash || dash) {
    let firstGt12 = false
    let secondGt12 = false
    for (const v of vals) {
      const [a, b] = v.split(/[-/]/).map((n) => parseInt(n, 10))
      if (a > 12) firstGt12 = true
      if (b > 12) secondGt12 = true
    }
    if (firstGt12 && !secondGt12) return { format: slash ? 'DD/MM/YYYY' : 'DD-MM-YYYY', ambiguous: false }
    if (secondGt12 && !firstGt12) return { format: slash ? 'MM/DD/YYYY' : 'MM-DD-YYYY', ambiguous: false }
    // Cannot tell them apart from the data — default US, flag ambiguous.
    return { format: slash ? 'MM/DD/YYYY' : 'MM-DD-YYYY', ambiguous: true }
  }
  return { format: 'auto', ambiguous: true }
}

/**
 * Format an ISO 'YYYY-MM-DD' string into a target output format. Returns the
 * input unchanged if it is not a valid ISO date.
 */
export function formatIsoDate(isoDate: string, format: DateFormat): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!m) return isoDate
  const [, y, mo, d] = m
  switch (format) {
    case 'YYYY-MM-DD':
    case 'auto':
      return `${y}-${mo}-${d}`
    case 'YYYY/MM/DD':
      return `${y}/${mo}/${d}`
    case 'MM/DD/YYYY':
      return `${mo}/${d}/${y}`
    case 'DD/MM/YYYY':
      return `${d}/${mo}/${y}`
    case 'MM-DD-YYYY':
      return `${mo}-${d}-${y}`
    case 'DD-MM-YYYY':
      return `${d}-${mo}-${y}`
    case 'DD.MM.YYYY':
      return `${d}.${mo}.${y}`
    case 'YYYYMMDD':
      return `${y}${mo}${d}`
    default:
      return isoDate
  }
}

export interface AmountOptions {
  decimalSeparator: '.' | ','
  /** Character used to group thousands; '' for none. */
  thousandsSeparator: ',' | '.' | ' ' | "'" | ''
  /** Remove currency symbols and stray letters before parsing. */
  stripCurrency: boolean
  /** Multiply the parsed number by -1. */
  flipSign: boolean
}

export const DEFAULT_AMOUNT_OPTIONS: AmountOptions = {
  decimalSeparator: '.',
  thousandsSeparator: ',',
  stripCurrency: true,
  flipSign: false,
}

/**
 * Parse a monetary string into a Number, honouring decimal/grouping separators,
 * accounting-style parentheses for negatives, leading/trailing signs and an
 * optional currency strip. Returns null when no number is present.
 */
export function parseAmount(raw: string, opts: AmountOptions = DEFAULT_AMOUNT_OPTIONS): number | null {
  if (raw == null) return null
  let s = String(raw).trim()
  if (!s) return null

  // Accounting negatives: (123.45) => -123.45
  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1).trim()
  }

  if (opts.stripCurrency) {
    // Drop everything except digits, separators, signs and parentheses.
    s = s.replace(/[^\d.,\-+'\s]/g, '')
  }
  s = s.trim()

  // Remove the configured thousands separator, then normalise the decimal mark.
  if (opts.thousandsSeparator) {
    s = s.split(opts.thousandsSeparator).join('')
  }
  // Any remaining spaces are stray grouping; remove them.
  s = s.replace(/\s/g, '')
  if (opts.decimalSeparator === ',') {
    s = s.replace(/,/g, '.')
  }

  if (s === '' || s === '-' || s === '+' || s === '.') return null
  const n = Number(s)
  if (!Number.isFinite(n)) return null

  let result = negative ? -Math.abs(n) : n
  if (opts.flipSign) result = -result
  // Normalise -0 to 0.
  return result === 0 ? 0 : result
}
