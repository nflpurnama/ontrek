export const SpendingTypes = [
  'ESSENTIAL',
  'DISCRETIONARY',
] as const;

export type SpendingType = typeof SpendingTypes[number];