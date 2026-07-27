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

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <ProductsManager
      products={productsRes.data ?? []}
      categories={categoriesRes.data ?? []}
    />
  );
}
