// A realistic sample bank CSV so users can try the tool instantly with no data
// of their own. Intentionally messy: US dates, $ signs, thousands separators,
// a quoted payee containing a comma, and a mix of inflow/outflow.

export const SAMPLE_CSV_NAME = 'sample-bank-export.csv'

export const SAMPLE_CSV = `Date,Description,Memo,Amount
01/03/2024,"Whole Foods Market, Inc.",Groceries,-84.23
01/04/2024,Acme Payroll,January salary,"3,500.00"
01/05/2024,Shell Gas Station,Fuel,-52.10
01/08/2024,Netflix,Monthly subscription,-15.49
01/09/2024,Transfer from Savings,,250.00
01/12/2024,Corner Coffee,Latte,-4.75
01/15/2024,Rent — Maple Apartments,February rent,"-1,450.00"
01/18/2024,Refund: Amazon,Returned headphones,39.99
01/22/2024,City Water & Power,Utilities,-118.64
01/26/2024,Freelance Invoice #204,Design work,"1,200.00"
`
