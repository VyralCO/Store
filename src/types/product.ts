import type { BUSINESS } from "@/lib/format";

export type ProductColor = "preta" | "branca" | "meme";
export type Size = (typeof BUSINESS.SIZES)[number];

/** Produto como consumido pela UI. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  color: ProductColor;
  price: number;
  oldPrice?: number;
  badge?: string;
  badgeCyan?: boolean;
  description: string;
  imagePath: string;
}

/** Linha do banco (snake_case) da tabela products. */
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  color: ProductColor;
  price: number;
  old_price: number | null;
  badge: string | null;
  badge_cyan: boolean;
  description: string;
  image_path: string;
  active: boolean;
  created_at: string;
}

/** Mapeia linha do banco → objeto de UI. */
export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    color: row.color,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    badge: row.badge ?? undefined,
    badgeCyan: row.badge_cyan,
    description: row.description,
    imagePath: row.image_path,
  };
}
