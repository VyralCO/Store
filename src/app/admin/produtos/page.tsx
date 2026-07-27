import { createAdminClient } from "@/lib/supabase/server";
import { ProductsManager } from "./products-manager";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminProdutosPage() {
  return (
    <AdminShell>
      <ProdutosContent />
    </AdminShell>
  );
}

async function ProdutosContent() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: variants } = await supabase.from("variants").select("*");

  const variantsMap: Record<string, { size: string; stock: number }[]> = {};
  variants?.forEach((v) => {
    if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
    variantsMap[v.product_id].push({ size: v.size, stock: v.stock });
  });

  return (
    <ProductsManager
      products={products ?? []}
      variantsMap={variantsMap}
    />
  );
}
