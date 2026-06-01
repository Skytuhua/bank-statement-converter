import { describe, it, expect } from 'vitest'
import { describeUnsupportedFile, hasAcceptedExtension } from '../readFile'

describe('describeUnsupportedFile', () => {
  it('gives PDF-specific guidance', () => {
    const msg = describeUnsupportedFile('statement-april.pdf')
    expect(msg).toContain('statement-april.pdf')
    expect(msg).toMatch(/PDF/i)
    expect(msg).toMatch(/Export|Download/)
  })

  it('points spreadsheet users to "Save As CSV"', () => {
    for (const name of ['budget.xlsx', 'q1.xls', 'sheet.numbers', 'data.ods']) {
      expect(describeUnsupportedFile(name)).toMatch(/spreadsheet/i)
      expect(describeUnsupportedFile(name)).toMatch(/CSV/)
    }
  })

  it('recognises images', () => {
    for (const name of ['scan.png', 'photo.JPG', 'statement.heic']) {
      expect(describeUnsupportedFile(name)).toMatch(/image/i)
    }
  })

  it('recognises archives', () => {
    expect(describeUnsupportedFile('export.zip')).toMatch(/archive|Unzip/i)
  })

  it('falls back to a clear generic message for unknown extensions', () => {
    const msg = describeUnsupportedFile('mystery.dat')
    expect(msg).toContain('mystery.dat')
    expect(msg).toMatch(/CSV, OFX\/QFX or QIF/)
  })

  it('always names the offending file', () => {
    for (const name of ['a.pdf', 'b.xlsx', 'c.png', 'd.zip', 'e.weird']) {
      expect(describeUnsupportedFile(name)).toContain(name)
    }
  })
})

describe('hasAcceptedExtension', () => {
  it('accepts supported statement extensions (case-insensitive)', () => {
    expect(hasAcceptedExtension('data.CSV')).toBe(true)
    expect(hasAcceptedExtension('bank.ofx')).toBe(true)
    expect(hasAcceptedExtension('old.qif')).toBe(true)
  })
  it('rejects unsupported extensions', () => {
    expect(hasAcceptedExtension('statement.pdf')).toBe(false)
    expect(hasAcceptedExtension('photo.png')).toBe(false)
  })
})
