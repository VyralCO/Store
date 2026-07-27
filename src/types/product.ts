import type { BUSINESS } from "@/lib/format";

export type ProductColor = "preta" | "branca";
export type Size = (typeof BUSINESS.SIZES)[number];

/** Produto como consumido pela UI (estampa). */
export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  categoryName?: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  badgeCyan?: boolean;
  description: string;
  keywords?: string;
  availableBlack: boolean;
  availableWhite: boolean;
  mockupBlackPath?: string;
  mockupWhitePath?: string;
}

/** Linha do banco (snake_case) da tabela products. */
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  old_price: number | null;
  badge: string | null;
  badge_cyan: boolean;
  description: string;
  keywords: string | null;
  available_black: boolean;
  available_white: boolean;
  dtf_black_path: string | null;
  dtf_white_path: string | null;
  mockup_black_path: string | null;
  mockup_white_path: string | null;
  active: boolean;
  created_at: string;
  // joined
  categories?: { name: string } | null;
}

/** Mapeia linha do banco → objeto de UI. */
export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? undefined,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    badge: row.badge ?? undefined,
    badgeCyan: row.badge_cyan,
    description: row.description,
    keywords: row.keywords ?? undefined,
    availableBlack: row.available_black,
    availableWhite: row.available_white,
    mockupBlackPath: row.mockup_black_path ?? undefined,
    mockupWhitePath: row.mockup_white_path ?? undefined,
  };
}
