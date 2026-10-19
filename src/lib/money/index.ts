export function toPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaisa(paisa: number): number {
  return paisa / 100;
}

export function formatPkr(paisa: number): string {
  const rupees = fromPaisa(paisa);
  return `Rs ${rupees.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
