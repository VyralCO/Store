import { createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";
import { StockManager } from "./stock-manager";

export default async function AdminEstoquePage() {
  return (
    <AdminShell>
      <EstoqueContent />
    </AdminShell>
  );
}

async function EstoqueContent() {
  const supabase = createAdminClient();
  const { data: stock } = await supabase
    .from("tshirt_stock")
    .select("*")
    .order("color")
    .order("size");

  return <StockManager stock={stock ?? []} />;
}
