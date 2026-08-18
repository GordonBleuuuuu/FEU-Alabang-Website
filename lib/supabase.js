import { createClient } from "@supabase/supabase-js";

// Supabase client for browser-side file uploads (Committee Application PDFs).
// The publishable key is safe to commit — it's the browser-side key by design,
// with Row-Level-Security policies enforced by Supabase. The service_role
// (secret) key is never used here.
//
// Env vars override defaults so ops can rotate keys in Vercel without a redeploy.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fbqoqdljdoajbnwruicz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_dbj-uxjfAeXPdvggPKbRKw_yeeNaeBl";

export const APPLICATIONS_BUCKET = "committee-applications";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const APPLICATIONS_TABLE = "committee_applications";

// Insert a Committee Application row into Postgres. Kept separate from the
// Forminit submission on purpose — Supabase is the queryable source of truth
// (dashboard, filters, exports, status tracking) while Forminit still handles
// the email notifications and autoresponder.
//
// Fails soft: if this throws, the caller should still POST to Forminit so the
// applicant experience isn't blocked by our own infra hiccups.
export async function insertCommitteeApplication(record) {
  const { error } = await supabase.from(APPLICATIONS_TABLE).insert(record);
  if (error) throw error;
}

// Upload a PDF to the committee-applications bucket and return its public URL.
// Filenames are prefixed with a random UUID so no two uploads collide.
export async function uploadApplicationPdf(file) {
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
  const safeName = file.name
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[^a-zA-Z0-9-_]+/g, "-") // slugify
    .slice(0, 60);
  const objectPath = `${crypto.randomUUID()}-${safeName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(APPLICATIONS_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(APPLICATIONS_BUCKET)
    .getPublicUrl(objectPath);
  return data.publicUrl;
}
