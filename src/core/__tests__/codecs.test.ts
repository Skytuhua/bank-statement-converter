import { describe, it, expect } from 'vitest'
import { importCsv, type CsvMapping } from '../importers/csv'
import { importOfx } from '../importers/ofx'
import { importQif } from '../importers/qif'
import { exportCsv } from '../exporters/csv'
import { exportOfx } from '../exporters/ofx'
import { exportQif } from '../exporters/qif'
import { DEFAULT_AMOUNT_OPTIONS } from '../normalize'
import { getPreset } from '../presets'
import type { ColumnRole } from '../detect'
import type { Transaction } from '../model'

const csvMapping = (roles: ColumnRole[], over: Partial<CsvMapping> = {}): CsvMapping => ({
  roles,
  dateFormat: 'auto',
  amount: DEFAULT_AMOUNT_OPTIONS,
  delimiter: ',',
  hasHeader: true,
  ...over,
})

describe('importCsv', () => {
  it('imports a signed-amount CSV', () => {
    const text = 'Date,Payee,Memo,Amount\n2023-01-15,Coffee Shop,Latte,-4.50\n2023-01-16,Salary,Pay,2000.00'
    const { transactions, warnings } = importCsv(text, csvMapping(['date', 'payee', 'memo', 'amount']))
    expect(warnings).toHaveLength(0)
    expect(transactions).toHaveLength(2)
    expect(transactions[0]).toMatchObject({ date: '2023-01-15', payee: 'Coffee Shop', amount: -4.5 })
    expect(transactions[1].amount).toBe(2000)
  })

  it('combines separate debit/credit columns into a signed amount', () => {
    const text = 'Date,Payee,Debit,Credit\n2023-01-15,Shop,4.50,\n2023-01-16,Salary,,2000.00'
    const { transactions } = importCsv(text, csvMapping(['date', 'payee', 'debit', 'credit']))
    expect(transactions[0].amount).toBe(-4.5)
    expect(transactions[1].amount).toBe(2000)
  })

  it('handles European semicolon CSV with comma decimals', () => {
    const text = 'Datum;Empfänger;Betrag\n15.01.2023;Laden;-5,00'
    const m = csvMapping(['date', 'payee', 'amount'], {
      delimiter: ';',
      dateFormat: 'DD.MM.YYYY',
      amount: { decimalSeparator: ',', thousandsSeparator: '.', stripCurrency: true, flipSign: false },
    })
    const { transactions } = importCsv(text, m)
    expect(transactions[0]).toMatchObject({ date: '2023-01-15', amount: -5 })
  })

  it('records warnings for unparseable rows without crashing', () => {
    const text = 'Date,Payee,Amount\nnot-a-date,Shop,abc'
    const { transactions, warnings } = importCsv(text, csvMapping(['date', 'payee', 'amount']))
    expect(transactions).toHaveLength(1)
    expect(warnings.some((w) => w.field === 'date')).toBe(true)
    expect(warnings.some((w) => w.field === 'amount')).toBe(true)
  })

  it('tolerates an empty file', () => {
    const { transactions } = importCsv('', csvMapping(['date', 'payee', 'amount']))
    expect(transactions).toHaveLength(0)
  })
})

describe('importQif / exportQif', () => {
  const qif = '!Type:Bank\nD01/15/2023\nT-4.50\nPCoffee Shop\nMLatte\nLFood\n^\nD01/16/2023\nT2000.00\nPSalary\n^\n'

  it('imports QIF records', () => {
    const { transactions } = importQif(qif)
    expect(transactions).toHaveLength(2)
    expect(transactions[0]).toMatchObject({ date: '2023-01-15', amount: -4.5, payee: 'Coffee Shop', memo: 'Latte', category: 'Food' })
  })

  it('round-trips QIF → model → QIF', () => {
    const { transactions } = importQif(qif)
    const out = exportQif(transactions, { accountType: 'CHECKING', dateFormat: 'MM/DD/YYYY' })
    const reparsed = importQif(out).transactions
    expect(reparsed[0]).toMatchObject({ date: '2023-01-15', amount: -4.5, payee: 'Coffee Shop' })
    expect(reparsed[1]).toMatchObject({ date: '2023-01-16', amount: 2000, payee: 'Salary' })
  })
})

describe('importOfx / exportOfx', () => {
  const sgml = `OFXHEADER:100
DATA:OFXSGML
<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS>
<CURDEF>USD
<BANKACCTFROM><BANKID>123<ACCTID>456<ACCTTYPE>CHECKING</BANKACCTFROM>
<BANKTRANLIST>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20230115120000<TRNAMT>-4.50<FITID>A1<NAME>Coffee Shop<MEMO>Latte</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20230116<TRNAMT>2000.00<FITID>A2<NAME>Salary</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`

  it('imports legacy 1.x SGML with unclosed tags', () => {
    const { transactions, meta } = importOfx(sgml)
    expect(transactions).toHaveLength(2)
    expect(transactions[0]).toMatchObject({ date: '2023-01-15', amount: -4.5, payee: 'Coffee Shop', memo: 'Latte', fitid: 'A1' })
    expect(meta?.currency).toBe('USD')
    expect(meta?.accountId).toBe('456')
  })

  it('exports well-formed OFX 2.x that re-imports identically (round-trip)', () => {
    const { transactions } = importOfx(sgml)
    const xml = exportOfx(transactions, { accountId: '456', bankId: '123', accountType: 'CHECKING', currency: 'USD' })
    expect(xml).toContain('<?xml')
    expect(xml).toContain('VERSION="211"')
    const reparsed = importOfx(xml).transactions
    expect(reparsed.map((t) => ({ date: t.date, amount: t.amount, payee: t.payee, fitid: t.fitid }))).toEqual(
      transactions.map((t) => ({ date: t.date, amount: t.amount, payee: t.payee, fitid: t.fitid })),
    )
  })

  it('escapes XML-special characters in payee/memo', () => {
    const txns: Transaction[] = [
      { date: '2023-01-15', amount: -5, payee: 'A & B <Ltd>', memo: '"q"', fitid: 'X1' },
    ]
    const xml = exportOfx(txns)
    expect(xml).toContain('A &amp; B &lt;Ltd&gt;')
    // And it must round-trip back to the original text.
    expect(importOfx(xml).transactions[0].payee).toBe('A & B <Ltd>')
  })

  it('preserves source FITIDs for de-duplication', () => {
    const { transactions } = importOfx(sgml)
    expect(transactions.map((t) => t.fitid)).toEqual(['A1', 'A2'])
  })

  it('uses the credit-card message set for CREDITCARD accounts', () => {
    const xml = exportOfx([{ date: '2023-01-15', amount: -5, payee: 'X', memo: '', fitid: 'F1' }], { accountType: 'CREDITCARD' })
    expect(xml).toContain('CREDITCARDMSGSRSV1')
    expect(xml).toContain('<CCSTMTRS>')
  })
})

describe('exportCsv via presets', () => {
  const txns: Transaction[] = [
    { date: '2023-01-15', amount: -4.5, payee: 'Coffee, Inc.', memo: 'Latte', fitid: 'F1' },
    { date: '2023-01-16', amount: 2000, payee: 'Salary', memo: '', fitid: 'F2' },
  ]

  it('YNAB preset splits outflow/inflow into separate columns', () => {
    const out = exportCsv(txns, getPreset('ynab').csv!)
    expect(out.split('\r\n')[0]).toBe('Date,Payee,Memo,Outflow,Inflow')
    expect(out).toContain('01/15/2023,"Coffee, Inc.",Latte,4.50,')
    expect(out).toContain('01/16/2023,Salary,,,2000.00')
  })

  it('Actual preset emits a single signed amount with ISO dates', () => {
    const out = exportCsv(txns, getPreset('actual').csv!)
    expect(out).toContain('2023-01-15,"Coffee, Inc.",Latte,-4.50')
  })

  it('escapes fields containing commas', () => {
    const out = exportCsv(txns, getPreset('csv-generic').csv!)
    expect(out).toContain('"Coffee, Inc."')
  })
})

describe('CSV → OFX (headline conversion)', () => {
  it('converts a bank CSV into importable OFX with stable de-dup ids', () => {
    const text = 'Date,Payee,Amount\n2023-01-15,Coffee Shop,-4.50\n2023-01-16,Salary,2000.00'
    const { transactions } = importCsv(text, csvMapping(['date', 'payee', 'amount']))
    const xml = exportOfx(transactions, { accountId: '999', bankId: '111', accountType: 'CHECKING', currency: 'USD' })
    const reparsed = importOfx(xml)
    expect(reparsed.transactions).toHaveLength(2)
    // Re-exporting the same data yields identical FITIDs (no double-import).
    const xml2 = exportOfx(transactions, { accountId: '999', bankId: '111', accountType: 'CHECKING', currency: 'USD' })
    expect(xml).toBe(xml2)
  })
})
