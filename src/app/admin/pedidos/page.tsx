import { createAdminClient } from "@/lib/supabase/server";
import { OrdersManager } from "./orders-manager";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminPedidosPage() {
  return (
    <AdminShell>
      <PedidosContent />
    </AdminShell>
  );
}

async function PedidosContent() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*");

  return (
    <OrdersManager
      orders={orders ?? []}
      orderItems={orderItems ?? []}
    />
  );
}
