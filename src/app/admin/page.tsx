import { createAdminClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminDashboard() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}

async function DashboardContent() {
  const supabase = createAdminClient();

  const [productsRes, ordersRes, pendingRes, producingRes, uploadsRes] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("production_queue")
        .select("*", { count: "exact", head: true })
        .not("status", "eq", "shipped"),
      supabase
        .from("custom_uploads")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  // Revenue
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total")
    .in("status", ["paid", "producing", "shipped", "delivered"]);

  const revenue = revenueData?.reduce((s, o) => s + Number(o.total), 0) ?? 0;

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <h1 className="adm-page-title">Dashboard</h1>

      <div className="adm-cards">
        <div className="adm-card">
          <div className="adm-card-label">Faturamento Total</div>
          <div className="adm-card-value">{formatMoney(revenue)}</div>
        </div>
        <div className="adm-card">
          <div className="adm-card-label">Pedidos</div>
          <div className="adm-card-value">{ordersRes.count ?? 0}</div>
          <div className="adm-card-sub">
            {pendingRes.count ?? 0} pendente(s)
          </div>
        </div>
        <div className="adm-card">
          <div className="adm-card-label">Produção Ativa</div>
          <div className="adm-card-value">{producingRes.count ?? 0}</div>
          <div className="adm-card-sub">itens na fila DTF</div>
        </div>
        <div className="adm-card">
          <div className="adm-card-label">Produtos Cadastrados</div>
          <div className="adm-card-value">{productsRes.count ?? 0}</div>
        </div>
        <div className="adm-card">
          <div className="adm-card-label">Uploads Pendentes</div>
          <div className="adm-card-value">{uploadsRes.count ?? 0}</div>
          <div className="adm-card-sub">artes de clientes</div>
        </div>
      </div>

      <div className="adm-page-header">
        <h2 className="adm-page-title" style={{ marginBottom: 0 }}>
          Últimos Pedidos
        </h2>
        <Link href="/admin/pedidos" className="adm-btn ghost sm">
          Ver todos →
        </Link>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {(!recentOrders || recentOrders.length === 0) && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum pedido ainda
                </td>
              </tr>
            )}
            {recentOrders?.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, color: "#fff" }}>
                  {order.order_number}
                </td>
                <td>{order.customer_name ?? order.customer_email}</td>
                <td>{formatMoney(Number(order.total))}</td>
                <td>
                  <span className={`adm-status ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

