// Transaction[] → OFX 2.x (well-formed XML). Importable by YNAB, GnuCash,
// Quicken, Banktivity, etc. FITIDs are emitted so apps de-duplicate on import.

import type { AccountMeta, Transaction } from '../model'
import { DEFAULT_ACCOUNT_META } from '../model'
import { formatIsoDate } from '../normalize'

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function ofxDate(iso: string): string {
  const d = formatIsoDate(iso, 'YYYYMMDD')
  return /^\d{8}$/.test(d) ? `${d}000000` : d
}

function dateRange(txns: Transaction[]): { start: string; end: string } {
  const dates = txns.map((t) => t.date).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  return {
    start: dates[0] ?? '1970-01-01',
    end: dates[dates.length - 1] ?? '1970-01-01',
  }
}

export function exportOfx(transactions: Transaction[], metaIn?: Partial<AccountMeta>): string {
  const meta: AccountMeta = { ...DEFAULT_ACCOUNT_META, ...metaIn }
  const { start, end } = dateRange(transactions)
  const now = ofxDate(end)
  const isCard = meta.accountType === 'CREDITCARD'

  const net = transactions.reduce((s, t) => s + t.amount, 0)

  const trns = transactions
    .map((t) => {
      const lines = [
        '        <STMTTRN>',
        `          <TRNTYPE>${t.amount < 0 ? 'DEBIT' : 'CREDIT'}</TRNTYPE>`,
        `          <DTPOSTED>${ofxDate(t.date)}</DTPOSTED>`,
        `          <TRNAMT>${t.amount.toFixed(2)}</TRNAMT>`,
        `          <FITID>${xml(t.fitid)}</FITID>`,
      ]
      if (t.checkNumber) lines.push(`          <CHECKNUM>${xml(t.checkNumber)}</CHECKNUM>`)
      if (t.payee) lines.push(`          <NAME>${xml(t.payee)}</NAME>`)
      if (t.memo) lines.push(`          <MEMO>${xml(t.memo)}</MEMO>`)
      lines.push('        </STMTTRN>')
      return lines.join('\n')
    })
    .join('\n')

  const acctFrom = isCard
    ? `      <CCACCTFROM>\n        <ACCTID>${xml(meta.accountId)}</ACCTID>\n      </CCACCTFROM>`
    : `      <BANKACCTFROM>\n        <BANKID>${xml(meta.bankId)}</BANKID>\n        <ACCTID>${xml(meta.accountId)}</ACCTID>\n        <ACCTTYPE>${meta.accountType}</ACCTTYPE>\n      </BANKACCTFROM>`

  const stmtRs = [
    `    <CURDEF>${xml(meta.currency)}</CURDEF>`,
    acctFrom,
    '      <BANKTRANLIST>',
    `        <DTSTART>${ofxDate(start)}</DTSTART>`,
    `        <DTEND>${ofxDate(end)}</DTEND>`,
    trns,
    '      </BANKTRANLIST>',
    '      <LEDGERBAL>',
    `        <BALAMT>${net.toFixed(2)}</BALAMT>`,
    `        <DTASOF>${now}</DTASOF>`,
    '      </LEDGERBAL>',
  ].join('\n')

  const msgWrapperOpen = isCard
    ? '  <CREDITCARDMSGSRSV1>\n    <CCSTMTTRNRS>'
    : '  <BANKMSGSRSV1>\n    <STMTTRNRS>'
  const stmtOpen = isCard ? '    <CCSTMTRS>' : '    <STMTRS>'
  const stmtClose = isCard ? '    </CCSTMTRS>' : '    </STMTRS>'
  const msgWrapperClose = isCard
    ? '    </CCSTMTTRNRS>\n  </CREDITCARDMSGSRSV1>'
    : '    </STMTTRNRS>\n  </BANKMSGSRSV1>'

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<?OFX OFXHEADER="200" VERSION="211" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>',
    '<OFX>',
    '  <SIGNONMSGSRSV1>',
    '    <SONRS>',
    '      <STATUS>',
    '        <CODE>0</CODE>',
    '        <SEVERITY>INFO</SEVERITY>',
    '      </STATUS>',
    `      <DTSERVER>${now}</DTSERVER>`,
    '      <LANGUAGE>ENG</LANGUAGE>',
    '    </SONRS>',
    '  </SIGNONMSGSRSV1>',
    msgWrapperOpen,
    '      <TRNUID>1</TRNUID>',
    '      <STATUS>',
    '        <CODE>0</CODE>',
    '        <SEVERITY>INFO</SEVERITY>',
    '      </STATUS>',
    stmtOpen,
    stmtRs,
    stmtClose,
    msgWrapperClose,
    '</OFX>',
    '',
  ].join('\n')
}
