export function formatCurrency(value: number){
  const parsedString = value.toString();
  const numeric = parsedString.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/\./g, ""));
}