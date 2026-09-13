import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Clock3, Mail, MapPin, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("id,slug,title,description,organizer_name,venue,starts_at,ends_at,category,registration_url,image_url,contact_name,contact_email,capacity").eq("slug", slug).single();
  if (!event) notFound();
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const google = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${stamp(event.starts_at)}/${stamp(event.ends_at)}`, details: event.description, location: event.venue ?? "" });
  const schedule = new Intl.DateTimeFormat("en-PH", { dateStyle: "full", timeStyle: "short" });

  return <main className="min-h-screen bg-cloud px-5 py-8 sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/#events" className="inline-flex items-center gap-2 text-sm font-bold text-feu-green"><ArrowLeft className="h-4 w-4" /> Back to events</Link><article className="mt-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl"><div className="relative min-h-60 bg-feu-moss">{event.image_url ? <Image src={event.image_url} alt={`${event.title} poster`} fill className="object-cover" priority /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top_right,_rgba(255,183,3,.28),_transparent_45%)]"><p className="text-sm font-black uppercase tracking-[0.25em] text-gold-default">{event.organizer_name}</p></div>}</div><div className="p-7 sm:p-10"><span className="rounded-full bg-feu-green/10 px-3 py-1 text-xs font-black uppercase text-feu-green">{event.category}</span><h1 className="mt-5 text-3xl font-black text-ink sm:text-5xl">{event.title}</h1><p className="mt-3 font-bold text-feu-teal">Presented by {event.organizer_name}</p><div className="mt-8 grid gap-4 rounded-2xl bg-cloud p-5 sm:grid-cols-2"><Detail icon={Clock3}>{schedule.format(new Date(event.starts_at))} – {schedule.format(new Date(event.ends_at))}</Detail><Detail icon={MapPin}>{event.venue || "Venue to be announced"}</Detail>{event.capacity && <Detail icon={Users}>{event.capacity} participant capacity</Detail>}{event.contact_email && <Detail icon={Mail}>{event.contact_name ? `${event.contact_name} · ` : ""}{event.contact_email}</Detail>}</div><div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-600">{event.description || "More details will be announced soon."}</div><div className="mt-9 flex flex-wrap gap-3">{event.registration_url && <a href={event.registration_url} target="_blank" rel="noreferrer" className="btn-gold">Register now</a>}<a href={`https://calendar.google.com/calendar/render?${google.toString()}`} target="_blank" rel="noreferrer" className="btn-green"><CalendarPlus className="h-4 w-4" /> Add to Google Calendar</a><a href={`/events/${event.slug}/calendar`} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Download .ics</a></div></div></article></div></main>;
}

function Detail({ icon: Icon, children }: { icon: typeof Clock3; children: React.ReactNode }) { return <div className="flex items-start gap-3 text-sm leading-6 text-slate-600"><Icon className="mt-1 h-4 w-4 shrink-0 text-feu-green" />{children}</div>; }
