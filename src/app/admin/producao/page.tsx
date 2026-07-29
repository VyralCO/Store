import { createAdminClient } from "@/lib/supabase/server";
import { ProductionManager } from "./production-manager";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminProducaoPage() {
  return (
    <AdminShell>
      <ProducaoContent />
    </AdminShell>
  );
}

async function ProducaoContent() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, customer_name, is_custom, created_at")
    .in("status", ["fila_dtf", "enviado_grafica", "estampado"])
    .order("created_at", { ascending: true });

  const orderIds = (orders ?? []).map((o) => o.id);

  const { data: items } = orderIds.length > 0
    ? await supabase
        .from("order_items")
        .select("id, order_id, product_name, size, color, quantity, dtf_file_path, is_custom")
        .in("order_id", orderIds)
    : { data: [] };

  return (
    <ProductionManager
      orders={orders ?? []}
      orderItems={items ?? []}
    />
  );
}
