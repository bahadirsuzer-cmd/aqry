export function formatParticipants(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(".", ",")}B`;
  return String(count);
}

export function formatPrice(price: number, currency: string): string {
  return `${price.toFixed(2).replace(".", ",")} ${currency}`;
}
