export function formatCurrency(value: string){
  const numeric = value.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/\./g, ""));
}