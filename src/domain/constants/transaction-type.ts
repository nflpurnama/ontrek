export enum TransactionType{
    CREDIT,
    DEBIT,
}

export function parseTransactionType(value: number): TransactionType {
  if (value === TransactionType.CREDIT) return TransactionType.CREDIT;
  if (value === TransactionType.DEBIT) return TransactionType.DEBIT;

  throw new Error(`Invalid TransactionType: ${value}`);
}