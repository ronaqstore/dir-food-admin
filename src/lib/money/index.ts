export function toPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaisa(paisa: number): number {
  return paisa / 100;
}

export function formatPkr(paisa: number): string {
  const safePaisa = Number.isFinite(paisa) ? paisa : 0;
  const rupees = fromPaisa(safePaisa);
  return `Rs ${rupees.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
