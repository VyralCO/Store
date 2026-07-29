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
 * Status de pedido — modelo do fluxo de produção.
 */
export const ORDER_STATUS = [
  "aguardando_arte",
  "aguardando_pagamento",
  "fila_dtf",
  "enviado_grafica",
  "estampado",
  "enviado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  aguardando_arte: "Aguardando Arte",
  aguardando_pagamento: "Aguardando Pagamento",
  fila_dtf: "Fila de Impressão DTF",
  enviado_grafica: "Aguardando Impressão DTF",
  estampado: "Camiseta Estampada",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

/**
 * Calculate shipping cost
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= BUSINESS.FREE_SHIPPING_THRESHOLD
    ? 0
    : BUSINESS.STANDARD_SHIPPING_COST;
}
