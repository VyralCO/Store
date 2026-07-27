import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";

async function handleLogout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/conta/login");

  // Use admin client to fetch orders (bypasses RLS for user's own orders)
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("customer_email", user.email)
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    producing: "Produzindo",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / Minha conta
      </div>

      <div className="sec-head" style={{ marginTop: 6 }}>
        <div>
          <h2>Minha Conta</h2>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>
            {user.user_metadata?.full_name ?? user.email}
          </p>
        </div>
        <form action={handleLogout}>
          <button type="submit" className="btn ghost" style={{ fontSize: "0.8rem" }}>
            Sair da conta
          </button>
        </form>
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "1.1rem",
          marginTop: 32,
          marginBottom: 16,
        }}
      >
        Meus Pedidos
      </h3>

      {(!orders || orders.length === 0) ? (
        <div className="empty" style={{ paddingTop: 32 }}>
          <p>Você ainda não fez nenhum pedido.</p>
          <Link href="/loja" className="btn" style={{ marginTop: 12, display: "inline-block" }}>
            Ir para a loja →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#111118",
                border: "1px solid #1c1c24",
                borderRadius: 12,
                padding: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase" }}>
                  Pedido
                </div>
                <div style={{ fontWeight: 700, color: "#fff" }}>
                  {order.order_number}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase" }}>
                  Total
                </div>
                <div style={{ color: "#fff" }}>
                  {formatMoney(Number(order.total))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase" }}>
                  Status
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      order.status === "delivered"
                        ? "#00ff88"
                        : order.status === "cancelled"
                          ? "#ff4444"
                          : "#ffcc00",
                  }}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase" }}>
                  Data
                </div>
                <div style={{ color: "#999", fontSize: "0.85rem" }}>
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </div>
                {order.tracking_code && (
                  <div style={{ fontSize: "0.7rem", color: "#00ccff", marginTop: 4 }}>
                    Rastreio: {order.tracking_code}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
