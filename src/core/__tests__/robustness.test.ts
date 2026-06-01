// Adversarial / robustness suite for the conversion core.
//
// Goal: throw degenerate, malformed and hostile inputs at every importer,
// exporter, normaliser and the orchestration layer, and assert the core never
// throws/crashes and always produces structurally sane output. Where a genuine
// behavioural quirk is found it is documented and pinned to CURRENT behaviour so
// the suite stays green and acts as a change detector. Any pin that documents a
// real bug is marked with a `BUG:` comment.

import { describe, it, expect } from 'vitest'
import { importCsv, parseCsvGrid, type CsvMapping } from '../importers/csv'
import { importOfx } from '../importers/ofx'
import { importQif } from '../importers/qif'
import { exportCsv } from '../exporters/csv'
import { exportOfx } from '../exporters/ofx'
import { exportQif, DEFAULT_QIF_OPTIONS } from '../exporters/qif'
import { parseAmount, parseDate, DEFAULT_AMOUNT_OPTIONS, type AmountOptions } from '../normalize'
import { detectFormat, detectCsvDialect } from '../detect'
import { importByFormat, exportByPreset } from '../convert'
import { PRESETS } from '../presets'
import type { ColumnRole } from '../detect'
import type { ParseResult, Transaction } from '../model'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mapping = (roles: ColumnRole[], over: Partial<CsvMapping> = {}): CsvMapping => ({
  roles,
  dateFormat: 'auto',
  amount: DEFAULT_AMOUNT_OPTIONS,
  delimiter: ',',
  hasHeader: true,
  ...over,
})

/** Assert a ParseResult is structurally sane: arrays present, every txn well-typed. */
function assertSaneResult(r: ParseResult) {
  expect(Array.isArray(r.transactions)).toBe(true)
  expect(Array.isArray(r.warnings)).toBe(true)
  for (const t of r.transactions) {
    expect(typeof t.date).toBe('string')
    expect(typeof t.amount).toBe('number')
    expect(Number.isFinite(t.amount)).toBe(true)
    expect(typeof t.payee).toBe('string')
    expect(typeof t.memo).toBe('string')
    expect(typeof t.fitid).toBe('string')
    // date is either empty or strict ISO.
    expect(t.date === '' || /^\d{4}-\d{2}-\d{2}$/.test(t.date)).toBe(true)
  }
  for (const w of r.warnings) {
    expect(typeof w.row).toBe('number')
    expect(['date', 'amount', 'general']).toContain(w.field)
  }
}

/** Parse exported OFX as XML and assert well-formedness (jsdom DOMParser). */
function assertWellFormedXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const errs = doc.getElementsByTagName('parsererror')
  expect(errs.length, errs[0]?.textContent ?? '').toBe(0)
  // The OFX XML carries a `<?OFX ...?>` PI before the root; strip the prolog and
  // confirm a single <OFX> root parses cleanly on its own as a sanity check.
  const body = xml.replace(/^<\?xml[^>]*\?>\s*/, '').replace(/^<\?OFX[^>]*\?>\s*/, '')
  const bodyDoc = new DOMParser().parseFromString(body, 'application/xml')
  expect(bodyDoc.getElementsByTagName('parsererror').length).toBe(0)
  expect(bodyDoc.documentElement.nodeName).toBe('OFX')
}

const txn = (over: Partial<Transaction> = {}): Transaction => ({
  date: '2023-01-15',
  amount: -4.5,
  payee: 'Shop',
  memo: 'Memo',
  fitid: 'F1',
  ...over,
})

// ---------------------------------------------------------------------------
// 1. Degenerate inputs (empty / whitespace / header-only / BOM)
// ---------------------------------------------------------------------------

describe('degenerate inputs never crash', () => {
  const blanks: Record<string, string> = {
    empty: '',
    whitespace: '   \t  ',
    'single newline': '\n',
    'crlf only': '\r\n',
    'header only (csv)': 'Date,Payee,Amount',
    'header + trailing newline': 'Date,Payee,Amount\n',
    'BOM only': '﻿',
    'BOM + header': '﻿Date,Payee,Amount\n2023-01-15,Shop,-1.00',
  }

  for (const [name, text] of Object.entries(blanks)) {
    it(`importCsv: ${name}`, () => {
      const r = importCsv(text, mapping(['date', 'payee', 'amount']))
      assertSaneResult(r)
    })
    it(`importOfx: ${name}`, () => {
      const r = importOfx(text)
      assertSaneResult(r)
    })
    it(`importQif: ${name}`, () => {
      const r = importQif(text)
      assertSaneResult(r)
    })
    it(`detectFormat: ${name}`, () => {
      expect(() => detectFormat(text)).not.toThrow()
    })
    it(`detectCsvDialect: ${name}`, () => {
      expect(() => detectCsvDialect(text)).not.toThrow()
    })
  }

  it('BOM-prefixed CSV: header-only yields no transactions', () => {
    const r = importCsv('\uFEFFDate,Payee,Amount\n', mapping(['date', 'payee', 'amount']))
    expect(r.transactions).toHaveLength(0)
  })

  it('BOM-prefixed CSV with a data row still imports the row', () => {
    const r = importCsv('\uFEFFDate,Payee,Amount\n2023-01-15,Shop,-1.00', mapping(['date', 'payee', 'amount']))
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
    expect(r.transactions[0].amount).toBe(-1)
    // NOTE: the BOM is not stripped from the first header cell, so the date
    // column header becomes "<BOM>Date"; the role mapping is positional so the
    // value still parses. This documents current (acceptable) behaviour.
  })
})

// ---------------------------------------------------------------------------
// 2. Huge input (performance / no stack or memory blowups)
// ---------------------------------------------------------------------------

describe('huge input', () => {
  it('parses a 50,000-row CSV in reasonable time without crashing', () => {
    const N = 50_000
    const parts: string[] = ['Date,Payee,Memo,Amount']
    for (let i = 0; i < N; i++) {
      parts.push(`2023-01-${String((i % 28) + 1).padStart(2, '0')},Payee ${i},Memo ${i},${(i % 1000) - 500}.50`)
    }
    const text = parts.join('\n')
    const t0 = Date.now()
    const r = importCsv(text, mapping(['date', 'payee', 'memo', 'amount']))
    const elapsed = Date.now() - t0
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(N)
    // Generous ceiling; mostly a guard against accidental O(n^2) regressions.
    expect(elapsed).toBeLessThan(15_000)
  })

  it('exports 50,000 transactions to OFX/QIF/CSV without crashing', () => {
    const txns: Transaction[] = Array.from({ length: 50_000 }, (_, i) =>
      txn({ payee: `P${i}`, amount: i % 2 ? i : -i, fitid: `F${i}` }),
    )
    expect(() => exportCsv(txns, PRESETS[0].csv!)).not.toThrow()
    expect(() => exportQif(txns)).not.toThrow()
    const ofx = exportOfx(txns)
    expect(ofx).toContain('</OFX>')
  })
})

// ---------------------------------------------------------------------------
// 3. Malformed CSV
// ---------------------------------------------------------------------------

describe('malformed CSV', () => {
  it('ragged rows (varying column counts)', () => {
    const text = [
      'Date,Payee,Memo,Amount',
      '2023-01-15,Shop',
      '2023-01-16,Shop,Memo,-1.00,extra,more',
      '2023-01-17',
      ',,,,',
    ].join('\n')
    const r = importCsv(text, mapping(['date', 'payee', 'memo', 'amount']))
    assertSaneResult(r)
  })

  it('unterminated quotes do not throw', () => {
    const text = 'Date,Payee,Amount\n2023-01-15,"unterminated payee,-1.00\n2023-01-16,Other,-2.00'
    const r = importCsv(text, mapping(['date', 'payee', 'amount']))
    assertSaneResult(r)
  })

  it('embedded newlines in quoted fields stay within one transaction', () => {
    const text = 'Date,Payee,Amount\n2023-01-15,"line one\nline two",-1.00'
    const r = importCsv(text, mapping(['date', 'payee', 'amount']))
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
    expect(r.transactions[0].payee).toContain('line one')
    expect(r.transactions[0].payee).toContain('line two')
  })

  it('only delimiters', () => {
    const text = ',,,\n,,,\n,,,'
    const r = importCsv(text, mapping(['date', 'payee', 'amount']))
    assertSaneResult(r)
  })

  it('only delimiters with no header', () => {
    const text = ';;;\n;;;'
    const r = importCsv(text, mapping(['date', 'payee', 'amount'], { delimiter: ';', hasHeader: false }))
    assertSaneResult(r)
  })

  it('parseCsvGrid tolerates degenerate inputs', () => {
    expect(() => parseCsvGrid('', ',', true)).not.toThrow()
    expect(() => parseCsvGrid('\n\n\n', ',', true)).not.toThrow()
    expect(() => parseCsvGrid(',,,', ',', false)).not.toThrow()
    expect(parseCsvGrid('', ',', true)).toEqual({ headers: [], rows: [] })
  })
})

// ---------------------------------------------------------------------------
// 4. Weird Unicode round-trips through every exporter
// ---------------------------------------------------------------------------

describe('weird Unicode round-trips without breaking output', () => {
  // Strings that are valid XML 1.0 character data (no illegal control chars).
  // These MUST round-trip and keep the exported OFX well-formed.
  const xmlSafe: Record<string, string> = {
    emoji: '\u{1F4B8}\u{1F3E6} emoji payee',
    'RTL marks': 'RTL ‏‮mirror‬ end',
    combining: 'combining áè mark',
    'zero-width joiners': 'zero​width‌‍ join',
    'XML specials': 'angle <tag> & "quote" \'apos\'',
    tab: 'col\tA\tcol B', // TAB (U+0009) is a legal XML char
  }

  for (const [name, s] of Object.entries(xmlSafe)) {
    const txns: Transaction[] = [txn({ payee: s, memo: s, fitid: 'U1' })]

    it(`OFX export stays well-formed XML for ${name}`, () => {
      assertWellFormedXml(exportOfx(txns))
    })

    it(`OFX round-trips payee/memo for ${name}`, () => {
      const back = importOfx(exportOfx(txns)).transactions[0]
      expect(back.payee).toBe(s)
      expect(back.memo).toBe(s)
    })

    it(`QIF export terminates cleanly for ${name}`, () => {
      const out = exportQif(txns)
      expect(out.endsWith('\n')).toBe(true)
      expect(out.startsWith('!Type:')).toBe(true)
    })

    it(`CSV export quotes embedded specials for ${name}`, () => {
      const out = exportCsv(txns, PRESETS[0].csv!)
      expect(typeof out).toBe('string')
      if (/[",\r\n]/.test(s)) expect(out).toContain('"')
    })
  }

  it('OFX export strips XML-illegal control chars and stays well-formed', () => {
    // NUL (U+0000) and most C0 control characters are illegal in XML 1.0.
    const s = `has nul${String.fromCharCode(0)} soh${String.fromCharCode(1)} end`
    const xml = exportOfx([txn({ payee: s, memo: s, fitid: 'U2' })])
    // FIXED: exporters/ofx.ts xml() now strips C0 control chars (except
    // tab/LF/CR), so the document is always well-formed XML.
    expect(xml).not.toContain(String.fromCharCode(0))
    expect(xml).not.toContain(String.fromCharCode(1))
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    expect(doc.getElementsByTagName('parsererror').length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 5. Amounts
// ---------------------------------------------------------------------------

describe('parseAmount on adversarial values', () => {
  const eu: AmountOptions = { decimalSeparator: ',', thousandsSeparator: '.', stripCurrency: true, flipSign: false }

  const cases: Array<[string, AmountOptions, number | null]> = [
    // BUG (low severity): scientific notation is NOT supported. normalize.ts:249
    // strips every non-[digit . , - + ' space] character when stripCurrency is
    // on, which removes the exponent 'e'. So "1e3" -> "13" and "1.5e2" -> "1.52"
    // rather than 1000 / 150. Pinned to current behaviour.
    ['1e3', DEFAULT_AMOUNT_OPTIONS, 13],
    ['1.5e2', DEFAULT_AMOUNT_OPTIONS, 1.52],
    // leading plus
    ['+42.50', DEFAULT_AMOUNT_OPTIONS, 42.5],
    // multiple grouping separators (US): all commas removed
    ['1,2,3.45', DEFAULT_AMOUNT_OPTIONS, 123.45],
    ['1,234,567.89', DEFAULT_AMOUNT_OPTIONS, 1234567.89],
    // EU grouping with comma decimal
    ['1.234.567,89', eu, 1234567.89],
    ['1.234,56', eu, 1234.56],
    // accounting negatives
    ['(123.45)', DEFAULT_AMOUNT_OPTIONS, -123.45],
    ['($1,000.00)', DEFAULT_AMOUNT_OPTIONS, -1000],
    // currency symbols stripped
    ['$1,000.00', DEFAULT_AMOUNT_OPTIONS, 1000],
    ['€5,00', eu, 5],
    ['£3.50', DEFAULT_AMOUNT_OPTIONS, 3.5],
    // empties / junk -> null
    ['', DEFAULT_AMOUNT_OPTIONS, null],
    ['   ', DEFAULT_AMOUNT_OPTIONS, null],
    ['-', DEFAULT_AMOUNT_OPTIONS, null],
    ['abc', DEFAULT_AMOUNT_OPTIONS, null],
    ['.', DEFAULT_AMOUNT_OPTIONS, null],
  ]

  for (const [raw, opts, expected] of cases) {
    it(`${JSON.stringify(raw)} -> ${expected}`, () => {
      const got = parseAmount(raw, opts)
      expect(got).toBe(expected)
      if (got !== null) expect(Number.isFinite(got)).toBe(true)
    })
  }

  it('"1,2,3.45" under EU options collapses oddly but never NaN/throws', () => {
    // EU options strip '.' as grouping and treat ',' as decimal. The string has
    // two commas, so Number() sees "12.3.45"-ish -> NaN -> null. Pin current.
    const got = parseAmount('1,2,3.45', eu)
    expect(got === null || Number.isFinite(got)).toBe(true)
  })

  it('never returns -0', () => {
    expect(Object.is(parseAmount('(0.00)', DEFAULT_AMOUNT_OPTIONS), -0)).toBe(false)
    expect(parseAmount('-0', DEFAULT_AMOUNT_OPTIONS)).toBe(0)
  })

  it('null/undefined-ish raw is handled', () => {
    // @ts-expect-error exercising the runtime null guard
    expect(parseAmount(null)).toBe(null)
    // @ts-expect-error exercising the runtime undefined guard
    expect(parseAmount(undefined)).toBe(null)
  })
})

// ---------------------------------------------------------------------------
// 6. Dates
// ---------------------------------------------------------------------------

describe('parseDate on adversarial values', () => {
  it('2-digit years use the 1970 pivot window', () => {
    expect(parseDate('01/15/69', 'MM/DD/YYYY')).toBe('2069-01-15')
    expect(parseDate('01/15/70', 'MM/DD/YYYY')).toBe('1970-01-15')
  })

  it('impossible dates (Feb 30, month 13) reject to null', () => {
    expect(parseDate('2023-02-30', 'YYYY-MM-DD')).toBe(null)
    expect(parseDate('2023-13-01', 'YYYY-MM-DD')).toBe(null)
    expect(parseDate('02/30/2023', 'MM/DD/YYYY')).toBe(null)
  })

  it('textual months parse in auto mode', () => {
    expect(parseDate('12 Jan 2023', 'auto')).toBe('2023-01-12')
    expect(parseDate('Jan 12, 2023', 'auto')).toBe('2023-01-12')
    expect(parseDate('15 March 2023', 'auto')).toBe('2023-03-15')
  })

  it('OFX timestamps with timezone suffixes parse to the date', () => {
    expect(parseDate('20230115', 'YYYYMMDD')).toBe('2023-01-15')
    expect(parseDate('20230115120000', 'YYYYMMDD')).toBe('2023-01-15')
    expect(parseDate('20230115120000.000[-5:EST]', 'YYYYMMDD')).toBe('2023-01-15')
    expect(parseDate('20230115120000.000[-5:EST]', 'auto')).toBe('2023-01-15')
  })

  it('empty / whitespace / garbage -> null, never throws', () => {
    expect(parseDate('', 'auto')).toBe(null)
    expect(parseDate('   ', 'auto')).toBe(null)
    expect(parseDate('not a date', 'auto')).toBe(null)
    expect(parseDate('//', 'auto')).toBe(null)
    // @ts-expect-error runtime null guard
    expect(parseDate(null, 'auto')).toBe(null)
  })

  it('every result is strict ISO or null', () => {
    const samples = ['2023-1-2', '1/2/2023', '99/99/9999', '2023', '2023-01', 'Feb', '20231301']
    for (const s of samples) {
      const out = parseDate(s, 'auto')
      expect(out === null || /^\d{4}-\d{2}-\d{2}$/.test(out)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// 7. OFX adversarial
// ---------------------------------------------------------------------------

describe('OFX importer robustness', () => {
  it('file with no STMTTRN warns and returns empty', () => {
    const r = importOfx('<OFX><BANKMSGSRSV1><STMTRS><CURDEF>USD</STMTRS></BANKMSGSRSV1></OFX>')
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(0)
    expect(r.warnings.some((w) => w.field === 'general')).toBe(true)
  })

  it('credit-card message set sets accountType CREDITCARD', () => {
    const ofx =
      '<OFX><CREDITCARDMSGSRSV1><CCSTMTTRNRS><CCSTMTRS><CURDEF>USD' +
      '<CCACCTFROM><ACCTID>4111</ACCTID></CCACCTFROM>' +
      '<BANKTRANLIST><STMTTRN><DTPOSTED>20230115<TRNAMT>-9.99<FITID>C1<NAME>Card buy</STMTTRN>' +
      '</BANKTRANLIST></CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1></OFX>'
    const r = importOfx(ofx)
    assertSaneResult(r)
    expect(r.meta?.accountType).toBe('CREDITCARD')
    expect(r.transactions).toHaveLength(1)
  })

  it('unclosed STMTTRN tag is still parsed (last block runs to EOF)', () => {
    const ofx = '<OFX><STMTTRN><DTPOSTED>20230115<TRNAMT>-1.00<FITID>X1<NAME>Open'
    const r = importOfx(ofx)
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
    expect(r.transactions[0].payee).toBe('Open')
  })

  it('XML entities in NAME/MEMO are decoded', () => {
    const ofx =
      '<OFX><STMTTRN><DTPOSTED>20230115</DTPOSTED><TRNAMT>-1.00</TRNAMT>' +
      '<FITID>E1</FITID><NAME>A &amp; B &lt;Ltd&gt;</NAME><MEMO>x &quot;y&quot;</MEMO></STMTTRN></OFX>'
    const r = importOfx(ofx)
    assertSaneResult(r)
    expect(r.transactions[0].payee).toBe('A & B <Ltd>')
    expect(r.transactions[0].memo).toBe('x "y"')
  })

  it('CDATA-ish / bracketed content does not crash', () => {
    const ofx =
      '<OFX><STMTTRN><DTPOSTED>20230115<TRNAMT>-1.00<FITID>D1' +
      '<NAME><![CDATA[raw text]]></NAME><MEMO>note]]></MEMO></STMTTRN></OFX>'
    const r = importOfx(ofx)
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
  })

  it('missing TRNAMT / DTPOSTED yields a sane (zero) txn', () => {
    const ofx = '<OFX><STMTTRN><FITID>Z1<NAME>No amount or date</STMTTRN></OFX>'
    const r = importOfx(ofx)
    assertSaneResult(r)
    expect(r.transactions[0].amount).toBe(0)
    expect(r.transactions[0].date).toBe('')
    // A missing date is correctly flagged.
    expect(r.warnings.some((w) => w.field === 'date')).toBe(true)
    // FIXED: a missing/empty TRNAMT now routes through parseAmount (which
    // returns null for an empty string) and is flagged with an amount warning
    // rather than silently recorded as a legitimate $0.00 transaction.
    expect(r.warnings.some((w) => w.field === 'amount')).toBe(true)
  })

  it('nested message sets with multiple STMTTRN parse all transactions', () => {
    const ofx =
      '<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>' +
      '<STMTTRN><DTPOSTED>20230115<TRNAMT>-1.00<FITID>N1<NAME>One</STMTTRN>' +
      '<STMTTRN><DTPOSTED>20230116<TRNAMT>2.00<FITID>N2<NAME>Two</STMTTRN>' +
      '</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>'
    const r = importOfx(ofx)
    expect(r.transactions.map((t) => t.fitid)).toEqual(['N1', 'N2'])
  })
})

// ---------------------------------------------------------------------------
// 8. QIF adversarial
// ---------------------------------------------------------------------------

describe('QIF importer robustness', () => {
  it('missing trailing ^ still flushes the final record', () => {
    const qif = '!Type:Bank\nD01/15/2023\nT-1.00\nPShop'
    const r = importQif(qif)
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
    expect(r.transactions[0].payee).toBe('Shop')
  })

  it('split memo / payee lines are concatenated', () => {
    const qif = '!Type:Bank\nD01/15/2023\nT-1.00\nMpart one\nMpart two\nPname a\nPname b\n^'
    const r = importQif(qif)
    assertSaneResult(r)
    expect(r.transactions[0].memo).toBe('part one part two')
    expect(r.transactions[0].payee).toBe('name a name b')
  })

  it('unknown field codes are ignored, not fatal', () => {
    const qif = '!Type:Bank\nD01/15/2023\nT-1.00\nPShop\nZmystery\nXanother\n^'
    const r = importQif(qif)
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
  })

  it('various !Type headers do not break parsing', () => {
    for (const header of ['!Type:Bank', '!Type:CCard', '!Type:Cash', '!Account', '!Option:AutoSwitch', '!Type:Invst']) {
      const r = importQif(`${header}\nD01/15/2023\nT-1.00\nPShop\n^`)
      assertSaneResult(r)
    }
  })

  it('empty / header-only QIF warns and returns empty', () => {
    const r = importQif('!Type:Bank\n')
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(0)
    expect(r.warnings.some((w) => w.field === 'general')).toBe(true)
  })

  it('stray ^ lines and blank lines do not create empty records', () => {
    const qif = '!Type:Bank\n^\n\n^\nD01/15/2023\nT-1.00\n^\n^\n'
    const r = importQif(qif)
    assertSaneResult(r)
    expect(r.transactions).toHaveLength(1)
  })

  it('QIF apostrophe-year shorthand parses to a real date', () => {
    const r = importQif("!Type:Bank\nD1/2'23\nT-1.00\nPShop\n^")
    assertSaneResult(r)
    // FIXED: parseDate('auto') now accepts 2-digit trailing years, so Quicken's
    // "1/2'23" (rewritten to "1/2/23") parses as MM/DD/YY → 2023-01-02.
    expect(r.transactions[0].date).toBe('2023-01-02')
    expect(r.warnings.some((w) => w.field === 'date')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 9. exportByPreset with 0 transactions, for every preset
// ---------------------------------------------------------------------------

describe('exportByPreset with zero transactions', () => {
  for (const preset of PRESETS) {
    it(`preset "${preset.id}" emits a sane artifact for []`, () => {
      const art = exportByPreset([], preset, undefined, DEFAULT_QIF_OPTIONS, 'statement')
      expect(typeof art.content).toBe('string')
      expect(art.content.length).toBeGreaterThan(0)
      expect(art.filename).toBe(`statement.${preset.format}`)
      expect(art.mimeType).toContain(preset.format === 'csv' ? 'csv' : preset.format)

      if (preset.format === 'ofx') {
        // Empty OFX must still be well-formed XML.
        assertWellFormedXml(art.content)
      }
      if (preset.format === 'csv') {
        // Header row should be present and non-empty.
        expect(art.content.split('\r\n')[0].length).toBeGreaterThan(0)
      }
      if (preset.format === 'qif') {
        expect(art.content.startsWith('!Type:')).toBe(true)
      }
    })
  }

  it('filename sanitisation strips unsafe characters', () => {
    const art = exportByPreset([], PRESETS[0], undefined, DEFAULT_QIF_OPTIONS, '../../etc/pa ss wd.csv')
    expect(art.filename).not.toContain('/')
    expect(art.filename).not.toContain(' ')
    expect(art.filename.endsWith('.csv')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 10. Orchestration / cross-format fuzz round-trips
// ---------------------------------------------------------------------------

describe('importByFormat orchestration', () => {
  it('throws a clear error when CSV mapping is missing (documented contract)', () => {
    expect(() => importByFormat('a,b,c', 'csv')).toThrow(/mapping/i)
  })

  it('routes ofx/qif without a mapping and stays sane', () => {
    assertSaneResult(importByFormat('<OFX></OFX>', 'ofx'))
    assertSaneResult(importByFormat('!Type:Bank\n', 'qif'))
  })

  it('full fuzz: parse hostile CSV then export through every preset without crashing', () => {
    const text = [
      'Date,Payee,Memo,Amount',
      '2023-13-40,"💸 <weird> & ""quoted""",emb\nedded,(1,234.56)',
      'not-a-date,,,',
      '2023-02-30,Feb30,impossible,1e3',
      '20230115,Compact,date,+0.00',
    ].join('\n')
    const { transactions } = importCsv(text, mapping(['date', 'payee', 'memo', 'amount']))
    for (const preset of PRESETS) {
      const art = exportByPreset(transactions, preset)
      expect(art.content.length).toBeGreaterThan(0)
      if (preset.format === 'ofx') assertWellFormedXml(art.content)
    }
  })
})
