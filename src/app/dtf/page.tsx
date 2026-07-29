import { createAdminClient } from "@/lib/supabase/server";
import { DtfQueue } from "./dtf-queue";

export const dynamic = "force-dynamic";

export default async function DtfPage() {
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("dtf_queue")
    .select("*")
    .order("day", { ascending: false })
    .order("created_at", { ascending: true });

  return <DtfQueue rows={rows ?? []} />;
}
