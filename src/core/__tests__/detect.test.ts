import { describe, it, expect } from 'vitest'
import { detectFormat, detectCsvDialect, splitCsvLine, guessColumnRoles } from '../detect'

describe('detectFormat', () => {
  it('detects OFX by header', () => {
    expect(detectFormat('OFXHEADER:100\nDATA:OFXSGML\n')).toBe('ofx')
  })
  it('detects OFX 2.x by root tag', () => {
    expect(detectFormat('<?xml version="1.0"?>\n<OFX><SIGNON/></OFX>')).toBe('ofx')
  })
  it('detects QIF by type header', () => {
    expect(detectFormat('!Type:Bank\nD01/15/2023\n')).toBe('qif')
  })
  it('detects CSV by content', () => {
    expect(detectFormat('Date,Payee,Amount\n2023-01-15,Shop,-5.00')).toBe('csv')
  })
  it('uses the file extension as a tie-breaker', () => {
    expect(detectFormat('whatever content', 'export.qfx')).toBe('ofx')
    expect(detectFormat('whatever content', 'export.qif')).toBe('qif')
  })
  it('returns unknown for opaque content', () => {
    expect(detectFormat('just some prose with no delimiters')).toBe('unknown')
  })
})

describe('detectCsvDialect', () => {
  it('detects comma delimiter and header', () => {
    const d = detectCsvDialect('Date,Payee,Amount\n2023-01-15,Shop,-5.00\n2023-01-16,Cafe,-3.00')
    expect(d.delimiter).toBe(',')
    expect(d.hasHeader).toBe(true)
  })
  it('detects semicolon delimiter and comma decimals (EU)', () => {
    const d = detectCsvDialect('Datum;Empfänger;Betrag\n15.01.2023;Laden;-5,00\n16.01.2023;Cafe;-3,50')
    expect(d.delimiter).toBe(';')
    expect(d.decimalSeparator).toBe(',')
  })
  it('detects tab delimiter', () => {
    const d = detectCsvDialect('Date\tPayee\tAmount\n2023-01-15\tShop\t-5.00')
    expect(d.delimiter).toBe('\t')
  })
  it('detects absence of a header', () => {
    const d = detectCsvDialect('2023-01-15,Shop,-5.00\n2023-01-16,Cafe,-3.00')
    expect(d.hasHeader).toBe(false)
  })
})

describe('splitCsvLine', () => {
  it('respects quoted fields containing the delimiter', () => {
    expect(splitCsvLine('2023-01-15,"Shop, Inc.",-5.00', ',')).toEqual([
      '2023-01-15',
      'Shop, Inc.',
      '-5.00',
    ])
  })
  it('handles escaped quotes', () => {
    expect(splitCsvLine('"a ""b"" c",x', ',')).toEqual(['a "b" c', 'x'])
  })
})

describe('guessColumnRoles', () => {
  it('maps common header names', () => {
    const roles = guessColumnRoles(['Date', 'Description', 'Amount'])
    expect(roles[0]).toBe('date')
    expect(roles[1]).toBe('payee')
    expect(roles[2]).toBe('amount')
  })
  it('maps separate debit and credit columns', () => {
    const roles = guessColumnRoles(['Date', 'Payee', 'Debit', 'Credit'])
    expect(roles).toContain('debit')
    expect(roles).toContain('credit')
  })
  it('falls back positionally without useful headers', () => {
    const roles = guessColumnRoles(['Column 1', 'Column 2', 'Column 3'])
    expect(roles[0]).toBe('date')
    expect(roles[roles.length - 1]).toBe('amount')
  })
})
