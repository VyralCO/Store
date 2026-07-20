import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./config";

/**
 * Client Supabase para Server Components / Route Handlers.
 * Usa a chave pública (anon) + cookies para sessão.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll chamado de um Server Component — pode ser ignorado
          // quando há middleware cuidando da sessão.
        }
      },
    },
  });
}

/**
 * Client administrativo (service role) — SOMENTE server-side.
 * Ignora RLS. Use para webhooks, criação de pedidos e seed.
 * NUNCA importe isto em Client Components.
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente. Configure no .env para operações administrativas.",
    );
  }

  return createServerClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* noop — cliente admin não usa cookies */
      },
    },
  });
}
