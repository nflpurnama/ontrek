export function formatCurrency(value: number){
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const parsedString = absValue.toString();
  const numeric = parsedString.replace(/\D/g, "");
  const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyShort(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let result: string;
  if (absValue >= 1000000) {
    result = `${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    result = `${(absValue / 1000).toFixed(0)}k`;
  } else {
    result = absValue.toLocaleString("id-ID");
  }
  return isNegative ? `-${result}` : result;
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/\./g, ""));
}