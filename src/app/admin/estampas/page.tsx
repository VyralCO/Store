import { createAdminClient } from "@/lib/supabase/server";
import { DesignsManager } from "./designs-manager";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminEstampasPage() {
  return (
    <AdminShell>
      <EstampasContent />
    </AdminShell>
  );
}

async function EstampasContent() {
  const supabase = createAdminClient();

  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .order("created_at", { ascending: false });

  return <DesignsManager designs={designs ?? []} />;
}
