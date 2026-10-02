import Link from "next/link";
import { CheckCircle2, CircleX, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VerifyPassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=${encodeURIComponent(`/verify/${token}`)}`);

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "SCC Executive" && profile?.role !== "SADU") {
    return <Result state="restricted" />;
  }

  if (!uuidPattern.test(token)) return <Result state="invalid" />;

  const { data: pass, error } = await supabase
    .from("scc_ids")
    .select("pass_code,holder_name,holder_role,membership_group,photo_url,term_label,status,expires_at")
    .eq("verification_token", token)
    .maybeSingle();

  if (error) return <Result state="error" />;
  if (!pass) return <Result state="invalid" />;

  const expired = pass.expires_at ? await hasExpired(pass.expires_at) : false;
  const active = pass.status === "active" && !expired;
  const photo = pass.photo_url?.startsWith("/officers/") || pass.photo_url?.startsWith("https://")
    ? pass.photo_url
    : null;

  return (
    <main className="min-h-screen bg-cloud px-5 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/admin/passes" className="text-sm font-bold text-feu-green hover:underline">← SCC IDs</Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className={`px-7 py-6 text-white ${active ? "bg-feu-green" : "bg-red-700"}`}>
            <div className="flex items-center gap-3">
              {active ? <CheckCircle2 className="h-8 w-8" aria-hidden="true" /> : <CircleX className="h-8 w-8" aria-hidden="true" />}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">FEU Alabang SCC ID</p>
                <h1 className="text-2xl font-black">{active ? "Active SCC ID" : expired ? "Expired SCC ID" : "Revoked SCC ID"}</h1>
              </div>
            </div>
          </div>
          <div className="p-7">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative h-52 w-44 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={`Photo of ${pass.holder_name}`} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-slate-500">No photo on record</div>
                )}
              </div>
              <dl className="min-w-0 flex-1 space-y-4">
                <Detail label="Name" value={pass.holder_name} />
                <Detail label="Role" value={pass.holder_role} />
                <Detail label="Group" value={pass.membership_group} />
                <Detail label="Term" value={pass.term_label} />
                <Detail label="SCC ID" value={pass.pass_code} />
              </dl>
            </div>
            <p className="mt-7 rounded-2xl bg-cloud p-4 text-sm leading-6 text-slate-600">
              Compare this record and photo with the person presenting the ID. A copied QR code does not confirm who is holding it. If no photo is on record, check the person’s identity another way.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}

async function hasExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words font-bold text-ink">{value}</dd></div>;
}

function Result({ state }: { state: "restricted" | "invalid" | "error" }) {
  const restricted = state === "restricted";
  return <main className="grid min-h-screen place-items-center bg-cloud px-5"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><LockKeyhole className="mx-auto h-10 w-10 text-feu-green" aria-hidden="true" /><h1 className="mt-5 text-2xl font-black text-ink">{restricted ? "Staff access required" : state === "invalid" ? "SCC ID not found" : "Verification unavailable"}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{restricted ? "Only authorized SCC and SADU staff can verify SCC IDs." : state === "invalid" ? "This QR code is not linked to an issued SCC ID." : "The SCC ID database could not be reached. Please try again or check the ID manually."}</p><Link href="/admin" className="btn-green mt-7">Return to workspace</Link></div></main>;
}
