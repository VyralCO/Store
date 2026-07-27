import { createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";
import { CategoriesManager } from "./categories-manager";

export default async function AdminCategoriasPage() {
  return (
    <AdminShell>
      <CategoriasContent />
    </AdminShell>
  );
}

async function CategoriasContent() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return <CategoriesManager categories={categories ?? []} />;
}
