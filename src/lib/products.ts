import "server-only";
import { CATALOG } from "@/data/catalog";
import { BUSINESS } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type Product, type ProductRow } from "@/types/product";

/** Disponibilidade de estoque por tamanho. */
export interface VariantStock {
  size: string;
  stock: number;
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return CATALOG;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[getProducts] Supabase error, usando fallback:", error);
    return CATALOG;
  }

  return (data as ProductRow[]).map(mapProductRow);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    const q = query.toLowerCase();
    return CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  const supabase = await createClient();
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("active", true)
    .or(`name.ilike.${q},keywords.ilike.${q},description.ilike.${q}`)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[searchProducts] Supabase error:", error);
    return [];
  }

  return (data as ProductRow[]).map(mapProductRow);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return CATALOG.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[getProductBySlug] Supabase error, usando fallback:", error);
    return CATALOG.find((p) => p.slug === slug) ?? null;
  }

  return data ? mapProductRow(data as ProductRow) : null;
}

/**
 * Estoque de camisetas por cor e tamanho.
 * Retorna disponibilidade para a cor especificada.
 */
export async function getStockByColor(color: string): Promise<VariantStock[]> {
  const fallback: VariantStock[] = BUSINESS.SIZES.map((size) => ({
    size,
    stock: 25,
  }));

  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tshirt_stock")
    .select("size, stock")
    .eq("color", color);

  if (error || !data) {
    console.error("[getStockByColor] Supabase error, fallback:", error);
    return fallback;
  }

  const map = new Map(
    (data as VariantStock[]).map((v) => [v.size, Number(v.stock)]),
  );
  return BUSINESS.SIZES.map((size) => ({
    size,
    stock: map.get(size) ?? 0,
  }));
}
