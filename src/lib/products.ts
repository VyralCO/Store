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

/**
 * Camada de acesso a produtos.
 * Quando o Supabase está configurado, lê do banco.
 * Caso contrário, usa o catálogo local como fallback (dev sem credenciais).
 */

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return CATALOG;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[getProducts] Supabase error, usando fallback:", error);
    return CATALOG;
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
    .select("*")
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
 * Estoque por tamanho de um produto.
 * Sem Supabase configurado, assume todos os tamanhos disponíveis (fallback dev).
 */
export async function getVariantsBySlug(slug: string): Promise<VariantStock[]> {
  const fallback: VariantStock[] = BUSINESS.SIZES.map((size) => ({
    size,
    stock: 25,
  }));

  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (prodErr || !product) {
    console.error("[getVariantsBySlug] produto não encontrado, fallback:", prodErr);
    return fallback;
  }

  const { data, error } = await supabase
    .from("variants")
    .select("size, stock")
    .eq("product_id", (product as { id: string }).id);

  if (error || !data) {
    console.error("[getVariantsBySlug] Supabase error, fallback:", error);
    return fallback;
  }

  // Garante a ordem canônica dos tamanhos.
  const map = new Map(
    (data as VariantStock[]).map((v) => [v.size, Number(v.stock)]),
  );
  return BUSINESS.SIZES.map((size) => ({
    size,
    stock: map.get(size) ?? 0,
  }));
}
