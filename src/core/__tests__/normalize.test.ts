import { describe, it, expect } from 'vitest'
import {
  parseDate,
  guessDateFormat,
  parseAmount,
  formatIsoDate,
  DEFAULT_AMOUNT_OPTIONS,
  type AmountOptions,
} from '../normalize'

describe('parseDate', () => {
  it('parses ISO', () => {
    expect(parseDate('2023-01-15', 'YYYY-MM-DD')).toBe('2023-01-15')
  })
  it('parses US MM/DD/YYYY', () => {
    expect(parseDate('01/15/2023', 'MM/DD/YYYY')).toBe('2023-01-15')
  })
  it('parses EU DD/MM/YYYY', () => {
    expect(parseDate('15/01/2023', 'DD/MM/YYYY')).toBe('2023-01-15')
  })
  it('parses German DD.MM.YYYY', () => {
    expect(parseDate('15.01.2023', 'DD.MM.YYYY')).toBe('2023-01-15')
  })
  it('parses 2-digit years with windowing', () => {
    expect(parseDate('01/15/23', 'MM/DD/YYYY')).toBe('2023-01-15')
    expect(parseDate('01/15/85', 'MM/DD/YYYY')).toBe('1985-01-15')
  })
  it('parses OFX compact timestamps', () => {
    expect(parseDate('20230115', 'YYYYMMDD')).toBe('2023-01-15')
    expect(parseDate('20230115120000.000[-5:EST]', 'YYYYMMDD')).toBe('2023-01-15')
  })
  it('auto-detects unambiguous DD/MM by value', () => {
    expect(parseDate('25/12/2023', 'auto')).toBe('2023-12-25')
  })
  it('auto-detects textual dates', () => {
    expect(parseDate('15 Jan 2023', 'auto')).toBe('2023-01-15')
    expect(parseDate('Jan 15, 2023', 'auto')).toBe('2023-01-15')
  })
  it('rejects impossible calendar dates', () => {
    expect(parseDate('2023-02-30', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('02/30/2023', 'MM/DD/YYYY')).toBeNull()
  })
  it('returns null for junk and empties', () => {
    expect(parseDate('', 'auto')).toBeNull()
    expect(parseDate('not a date', 'auto')).toBeNull()
    expect(parseDate('   ', 'auto')).toBeNull()
  })
})

describe('guessDateFormat', () => {
  it('detects ISO', () => {
    expect(guessDateFormat(['2023-01-15', '2023-02-20']).format).toBe('YYYY-MM-DD')
  })
  it('detects DD/MM when a day > 12 appears', () => {
    const g = guessDateFormat(['13/01/2023', '25/02/2023'])
    expect(g.format).toBe('DD/MM/YYYY')
    expect(g.ambiguous).toBe(false)
  })
  it('detects MM/DD when second field > 12 appears', () => {
    const g = guessDateFormat(['01/13/2023', '02/25/2023'])
    expect(g.format).toBe('MM/DD/YYYY')
  })
  it('flags ambiguity when both fields are always <= 12', () => {
    const g = guessDateFormat(['01/02/2023', '03/04/2023'])
    expect(g.ambiguous).toBe(true)
  })
  it('detects German dotted dates', () => {
    expect(guessDateFormat(['15.01.2023']).format).toBe('DD.MM.YYYY')
  })
})

describe('parseAmount', () => {
  it('parses plain numbers', () => {
    expect(parseAmount('123.45')).toBe(123.45)
    expect(parseAmount('-50.00')).toBe(-50)
  })
  it('strips currency symbols and thousands separators', () => {
    expect(parseAmount('$1,234.56')).toBe(1234.56)
    expect(parseAmount('£2,000')).toBe(2000)
  })
  it('handles European decimals', () => {
    const eu: AmountOptions = { decimalSeparator: ',', thousandsSeparator: '.', stripCurrency: true, flipSign: false }
    expect(parseAmount('1.234,56', eu)).toBe(1234.56)
    expect(parseAmount('-9,99 €', eu)).toBe(-9.99)
  })
  it('handles accounting-style parentheses as negative', () => {
    expect(parseAmount('(75.00)')).toBe(-75)
  })
  it('honours flipSign', () => {
    expect(parseAmount('50.00', { ...DEFAULT_AMOUNT_OPTIONS, flipSign: true })).toBe(-50)
  })
  it('returns null for empty / non-numeric', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('   ')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('-')).toBeNull()
  })
  it('normalises -0 to 0', () => {
    expect(Object.is(parseAmount('-0.00'), 0)).toBe(true)
  })
})

describe('formatIsoDate', () => {
  it('formats to each target', () => {
    expect(formatIsoDate('2023-01-15', 'MM/DD/YYYY')).toBe('01/15/2023')
    expect(formatIsoDate('2023-01-15', 'DD/MM/YYYY')).toBe('15/01/2023')
    expect(formatIsoDate('2023-01-15', 'DD.MM.YYYY')).toBe('15.01.2023')
    expect(formatIsoDate('2023-01-15', 'YYYYMMDD')).toBe('20230115')
  })
  it('passes through non-ISO input unchanged', () => {
    expect(formatIsoDate('', 'MM/DD/YYYY')).toBe('')
    expect(formatIsoDate('garbage', 'MM/DD/YYYY')).toBe('garbage')
  })
})
