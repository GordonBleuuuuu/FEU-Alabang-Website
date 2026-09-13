import { createClient } from "@/lib/supabase/server";

function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function stamp(value: string) { return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("id,title,description,venue,starts_at,ends_at,updated_at").eq("slug", slug).single();
  if (!event) return new Response("Event not found", { status: 404 });
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FEUASCC//Events Calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT", `UID:${event.id}@scc.feualabang.edu.ph`, `DTSTAMP:${stamp(event.updated_at)}`, `DTSTART:${stamp(event.starts_at)}`, `DTEND:${stamp(event.ends_at)}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.description || "")}`, `LOCATION:${escapeIcs(event.venue || "")}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}.ics"`, "Cache-Control": "public, max-age=300" } });
}
