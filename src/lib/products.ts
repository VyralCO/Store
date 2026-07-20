import "server-only";
import { CATALOG } from "@/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type Product, type ProductRow } from "@/types/product";

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
