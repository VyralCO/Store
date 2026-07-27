import { createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminClientesPage() {
  return (
    <AdminShell>
      <ClientesContent />
    </AdminShell>
  );
}

async function ClientesContent() {
  const supabase = createAdminClient();

  // Fetch users from auth.users via admin API
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const users = usersData?.users ?? [];

  // Exclude admin users
  const { data: admins } = await supabase.from("admin_users").select("user_id");
  const adminIds = new Set(admins?.map((a) => a.user_id) ?? []);

  const clients = users.filter((u) => !adminIds.has(u.id));

  // Get order counts per customer
  const { data: orderCounts } = await supabase
    .from("orders")
    .select("customer_id, id");

  const countMap: Record<string, number> = {};
  orderCounts?.forEach((o) => {
    if (o.customer_id) countMap[o.customer_id] = (countMap[o.customer_id] ?? 0) + 1;
  });

  return (
    <>
      <div className="adm-page-header">
        <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
          Clientes
        </h1>
        <span style={{ color: "#888", fontSize: "0.85rem" }}>
          {clients.length} cliente(s) cadastrado(s)
        </span>
      </div>

      {clients.length === 0 ? (
        <div className="adm-empty">
          <h3>Nenhum cliente cadastrado</h3>
          <p>Clientes aparecerão aqui ao se registrarem na loja.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nome</th>
                <th>Cadastro</th>
                <th>Pedidos</th>
                <th>Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: "#fff" }}>{u.email}</td>
                  <td>{u.user_metadata?.name ?? "—"}</td>
                  <td style={{ color: "#888", fontSize: "0.8rem" }}>
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <span style={{ color: countMap[u.id] ? "#00ff88" : "#555" }}>
                      {countMap[u.id] ?? 0}
                    </span>
                  </td>
                  <td style={{ color: "#888", fontSize: "0.8rem" }}>
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
