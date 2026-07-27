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

  const [queueRes, itemsRes, ordersRes] = await Promise.all([
    supabase
      .from("production_queue")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("order_items").select("*"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name"),
  ]);

  return (
    <ProductionManager
      queue={queueRes.data ?? []}
      orderItems={itemsRes.data ?? []}
      orders={ordersRes.data ?? []}
    />
  );
}
