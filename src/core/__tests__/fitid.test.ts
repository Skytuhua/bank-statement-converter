import { describe, it, expect } from 'vitest'
import { fnv1a, makeFitid, assignFitids } from '../fitid'
import type { Transaction } from '../model'

const tx = (over: Partial<Transaction> = {}): Transaction => ({
  date: '2023-01-15',
  amount: -50,
  payee: 'Coffee',
  memo: 'Latte',
  fitid: '',
  ...over,
})

describe('fnv1a', () => {
  it('is deterministic', () => {
    expect(fnv1a('hello')).toBe(fnv1a('hello'))
  })
  it('differs for different input', () => {
    expect(fnv1a('hello')).not.toBe(fnv1a('world'))
  })
  it('produces 8 hex chars', () => {
    expect(fnv1a('anything')).toMatch(/^[0-9a-f]{8}$/)
  })
})

describe('makeFitid', () => {
  it('is stable for identical content', () => {
    expect(makeFitid(tx())).toBe(makeFitid(tx()))
  })
  it('changes with the salt (account id)', () => {
    expect(makeFitid(tx(), 'acct1')).not.toBe(makeFitid(tx(), 'acct2'))
  })
})

describe('assignFitids', () => {
  it('gives every transaction a non-empty id', () => {
    const out = assignFitids([tx(), tx({ amount: 10 })])
    expect(out.every((t) => /^[0-9a-f]{8}$/.test(t.fitid))).toBe(true)
  })
  it('disambiguates genuinely identical transactions', () => {
    const out = assignFitids([tx(), tx(), tx()])
    const ids = new Set(out.map((t) => t.fitid))
    expect(ids.size).toBe(3)
  })
  it('is stable across runs for the same input', () => {
    const a = assignFitids([tx(), tx({ payee: 'Shop' })])
    const b = assignFitids([tx(), tx({ payee: 'Shop' })])
    expect(a.map((t) => t.fitid)).toEqual(b.map((t) => t.fitid))
  })
})
