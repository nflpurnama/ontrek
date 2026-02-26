export const TransactionTypes = [
  'EXPENSE',
  'INCOME',
] as const;

export type TransactionType = typeof TransactionTypes[number];