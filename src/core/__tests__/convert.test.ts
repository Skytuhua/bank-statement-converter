import { describe, it, expect } from 'vitest'
import { importByFormat, exportByPreset } from '../convert'
import { getPreset } from '../presets'
import { totals } from '../model'
import { DEFAULT_AMOUNT_OPTIONS } from '../normalize'
import type { CsvMapping } from '../importers/csv'
import type { Transaction } from '../model'

const mapping: CsvMapping = {
  roles: ['date', 'payee', 'amount'],
  dateFormat: 'auto',
  amount: DEFAULT_AMOUNT_OPTIONS,
  delimiter: ',',
  hasHeader: true,
}

describe('importByFormat', () => {
  it('routes CSV with a mapping', () => {
    const r = importByFormat('Date,Payee,Amount\n2023-01-15,Shop,-5.00', 'csv', mapping)
    expect(r.transactions).toHaveLength(1)
  })
  it('throws when CSV mapping is missing', () => {
    expect(() => importByFormat('x', 'csv')).toThrow(/mapping/i)
  })
  it('routes OFX and QIF', () => {
    expect(importByFormat('!Type:Bank\nD01/15/2023\nT-5.00\n^\n', 'qif').transactions).toHaveLength(1)
  })
})

describe('exportByPreset', () => {
  const txns: Transaction[] = [{ date: '2023-01-15', amount: -5, payee: 'Shop', memo: '', fitid: 'F1' }]

  it('produces a CSV artifact with the right extension and mime', () => {
    const a = exportByPreset(txns, getPreset('csv-generic'), undefined, undefined, 'mybank.csv')
    expect(a.filename).toBe('mybank.csv')
    expect(a.mimeType).toContain('text/csv')
    expect(a.content).toContain('Shop')
  })
  it('produces an OFX artifact', () => {
    const a = exportByPreset(txns, getPreset('ofx'))
    expect(a.filename).toBe('statement.ofx')
    expect(a.content).toContain('<OFX>')
  })
  it('sanitises unsafe base filenames (no path separators survive)', () => {
    const a = exportByPreset(txns, getPreset('qif'), undefined, undefined, '../../etc/passwd')
    expect(a.filename).toBe('.._.._etc_passwd.qif')
    expect(a.filename).not.toContain('/')
    expect(a.filename).not.toContain('\\')
  })
})

describe('totals', () => {
  it('sums inflow, outflow and net', () => {
    const t = totals([
      { date: '', amount: -4.5, payee: '', memo: '', fitid: '' },
      { date: '', amount: 2000, payee: '', memo: '', fitid: '' },
      { date: '', amount: -5.5, payee: '', memo: '', fitid: '' },
    ])
    expect(t.outflow).toBe(-10)
    expect(t.inflow).toBe(2000)
    expect(t.net).toBe(1990)
    expect(t.count).toBe(3)
  })
})
