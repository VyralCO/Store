import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/produtos", label: "Produtos", icon: "👕" },
  { href: "/admin/estampas", label: "Estampas", icon: "🎨" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/producao", label: "Produção DTF", icon: "🏭" },
  { href: "/admin/uploads", label: "Uploads Clientes", icon: "📤" },
];

async function AdminLogout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <Link href="/admin" className="adm-brand">
          VYRAL<span className="adm-badge">ADMIN</span>
        </Link>

        <nav className="adm-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="adm-nav-item">
              <span className="adm-nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user">{user?.email}</div>
          <form action={AdminLogout}>
            <button type="submit" className="adm-logout">
              Sair
            </button>
          </form>
          <Link href="/" className="adm-back">
            ← Voltar à loja
          </Link>
        </div>
      </aside>

      <div className="adm-main">{children}</div>
    </div>
  );
}
