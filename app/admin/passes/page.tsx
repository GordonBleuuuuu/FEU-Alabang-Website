import Link from "next/link";
import { redirect } from "next/navigation";
import PassManager, { type EventPass } from "@/components/admin/PassManager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EventPassesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/passes");

  const { data: profile } = await supabase.from("users").select("role").eq("id", authData.user.id).single();
  if (profile?.role !== "SCC Executive" && profile?.role !== "SADU") {
    return <main className="grid min-h-screen place-items-center bg-cloud px-5"><p className="rounded-2xl bg-white p-8 font-bold text-ink">Your account cannot manage SCC IDs.</p></main>;
  }

  const { data: passes, error } = await supabase
    .from("scc_ids")
    .select("id,pass_code,verification_token,holder_name,holder_role,membership_group,photo_url,term_label,status,expires_at,created_at")
    .order("pass_code", { ascending: true });

  return <main className="min-h-screen bg-cloud px-5 py-8 sm:px-8"><div className="mx-auto max-w-6xl"><Link href="/admin" className="text-sm font-bold text-feu-green hover:underline">← Internal workspace</Link><div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-feu-teal">SCC internal workspace</p><h1 className="mt-2 text-3xl font-black text-ink">SCC IDs</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The current roster includes Batch 6 executives and approved committee members. Download each website QR code or revoke an ID when needed. Only signed-in SCC and SADU staff can verify an ID.</p></div>{error ? <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">SCC IDs could not be loaded. Apply the SCC ID database migration first. {error.message}</p> : <PassManager initialPasses={(passes ?? []) as EventPass[]} />}</div></main>;
}
