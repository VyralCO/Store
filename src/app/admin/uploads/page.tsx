import { createAdminClient } from "@/lib/supabase/server";
import { UploadsManager } from "./uploads-manager";
import { AdminShell } from "@/components/admin-shell";
import { getCustomPricing } from "../actions";

export default async function AdminUploadsPage() {
  return (
    <AdminShell>
      <UploadsContent />
    </AdminShell>
  );
}

async function UploadsContent() {
  const supabase = createAdminClient();

  const { data: uploads } = await supabase
    .from("custom_uploads")
    .select("*")
    .order("created_at", { ascending: false });

  const pricing = await getCustomPricing();

  return <UploadsManager uploads={uploads ?? []} pricing={pricing} />;
}
