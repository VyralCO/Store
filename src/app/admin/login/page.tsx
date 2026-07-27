"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "not_admin"
      ? "Este email não tem acesso ao painel admin."
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <>
      {error && <div className="adm-error">{error}</div>}

      <form className="adm-form" onSubmit={handleLogin}>
        <div className="adm-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="admin@vyral.com"
          />
        </div>

        <div className="adm-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="adm-btn primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="adm-login-wrap">
      <div className="adm-login-box">
        <h1>VYRAL</h1>
        <p className="sub">Painel Administrativo</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
