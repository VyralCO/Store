/**
 * Format currency to BRL format
 * @example money(119) → "R$ 119,00"
 */
export function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Business constants
 */
export const BUSINESS = {
  // Shipping
  FREE_SHIPPING_THRESHOLD: 249,
  STANDARD_SHIPPING_COST: 29.9,

  // Prices
  CUSTOM_TSHIRT_PRICE: 129,

  // Sizing
  SIZES: ["P", "M", "G", "GG", "XG"] as const,

  // Weight
  STANDARD_WEIGHT_G: 240,

  // Collections
  COLLECTIONS: ["preta", "branca"] as const,
} as const;

/**
 * Calculate shipping cost
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= BUSINESS.FREE_SHIPPING_THRESHOLD
    ? 0
    : BUSINESS.STANDARD_SHIPPING_COST;
}
