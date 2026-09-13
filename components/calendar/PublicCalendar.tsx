"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PublicEvent = {
  id: string; slug: string; title: string; description: string; organizer_name: string;
  venue: string | null; starts_at: string; ends_at: string; category: string;
};
type CalendarView = "list" | "week" | "month";
const dateTime = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-PH", { weekday: "short", month: "short", day: "numeric" });

function googleCalendarUrl(event: PublicEvent) {
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${stamp(event.starts_at)}/${stamp(event.ends_at)}`, details: event.description, location: event.venue ?? "" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function EventCard({ event, ongoing }: { event: PublicEvent; ongoing: boolean }) {
  return <article className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${ongoing ? "bg-gold-default/20 text-feu-moss" : "bg-feu-green/10 text-feu-green"}`}>{ongoing ? "Ongoing" : "Upcoming"}</span><span className="text-right text-xs font-semibold text-feu-teal">{event.organizer_name}</span></div>
    <h3 className="mt-5 text-xl font-black text-ink">{event.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{event.description || "More event details will be announced soon."}</p>
    <dl className="mt-auto space-y-3 pt-6 text-sm text-slate-600"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-feu-green" /><dd>{dateTime.format(new Date(event.starts_at))}</dd></div>{event.venue && <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-feu-green" /><dd>{event.venue}</dd></div>}</dl>
    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><Link href={`/events/${event.slug}`} className="rounded-xl bg-feu-green px-4 py-2 text-xs font-bold text-white">View details</Link><a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Google Calendar <ExternalLink className="h-3 w-3" /></a><a href={`/events/${event.slug}/calendar`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">.ics</a></div>
  </article>;
}

export default function PublicCalendar() {
  const [events, setEvents] = useState<PublicEvent[]>([]); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [snapshotAt, setSnapshotAt] = useState(0);
  const [view, setView] = useState<CalendarView>("list"); const [organization, setOrganization] = useState("all"); const [category, setCategory] = useState("all"); const [venue, setVenue] = useState("all"); const [dateFilter, setDateFilter] = useState(""); const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => { let active = true; async function loadEvents() { const { data, error: queryError } = await supabase.from("events").select("id,slug,title,description,organizer_name,venue,starts_at,ends_at,category").gte("ends_at", new Date().toISOString()).order("starts_at", { ascending: true }); if (!active) return; if (queryError) setError("The events calendar is temporarily unavailable."); else setEvents((data ?? []) as PublicEvent[]); setSnapshotAt(Date.now()); setIsLoading(false); } void loadEvents(); return () => { active = false; }; }, []);

  const organizations = useMemo(() => [...new Set(events.map((event) => event.organizer_name))].sort(), [events]);
  const categories = useMemo(() => [...new Set(events.map((event) => event.category))].sort(), [events]);
  const venues = useMemo(() => [...new Set(events.map((event) => event.venue).filter((item): item is string => Boolean(item)))].sort(), [events]);
  const filtered = useMemo(() => events.filter((event) => organization === "all" || event.organizer_name === organization).filter((event) => category === "all" || event.category === category).filter((event) => venue === "all" || event.venue === venue).filter((event) => !dateFilter || event.starts_at.slice(0, 10) === dateFilter), [events, organization, category, venue, dateFilter]);
  const ongoing = filtered.filter((event) => new Date(event.starts_at).getTime() <= snapshotAt && new Date(event.ends_at).getTime() > snapshotAt);
  const upcoming = filtered.filter((event) => new Date(event.starts_at).getTime() > snapshotAt);

  function moveAnchor(direction: number) { const next = new Date(anchor); if (view === "month") next.setMonth(next.getMonth() + direction); else next.setDate(next.getDate() + 7 * direction); setAnchor(next); }

  return <section id="events" className="scroll-mt-24 bg-cloud py-20 sm:py-24"><div className="container-px">
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><span className="section-eyebrow"><CalendarDays className="h-3.5 w-3.5" /> RSO Calendar</span><h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">What’s happening at FEU Alabang</h2><p className="mt-3 max-w-2xl text-slate-600">Browse approved activities from recognized student organizations.</p></div><div className="flex gap-3 text-xs font-bold uppercase tracking-wide"><span className="rounded-full bg-gold-default/20 px-3 py-2 text-feu-moss">{ongoing.length} ongoing</span><span className="rounded-full bg-feu-green/10 px-3 py-2 text-feu-green">{upcoming.length} upcoming</span></div></div>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Filter value={organization} onChange={setOrganization}><option value="all">All RSOs</option>{organizations.map((item) => <option key={item}>{item}</option>)}</Filter><Filter value={category} onChange={setCategory}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</Filter><Filter value={venue} onChange={setVenue}><option value="all">All venues</option>{venues.map((item) => <option key={item}>{item}</option>)}</Filter><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date" className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600" /><div className="flex rounded-xl bg-slate-100 p-1">{(["list", "week", "month"] as CalendarView[]).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold capitalize ${view === item ? "bg-white text-feu-green shadow-sm" : "text-slate-500"}`}>{item}</button>)}</div></div></div>
    {isLoading ? <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}</div> : error ? <p role="alert" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</p> : !filtered.length ? <div className="mt-10 rounded-3xl border border-dashed border-feu-green/30 bg-white p-10 text-center"><CalendarDays className="mx-auto h-9 w-9 text-feu-green" /><p className="mt-4 font-bold text-ink">No events match these filters</p><button type="button" onClick={() => { setOrganization("all"); setCategory("all"); setVenue("all"); setDateFilter(""); }} className="mt-3 text-sm font-bold text-feu-green">Clear filters</button></div> : view === "list" ? <ListView ongoing={ongoing} upcoming={upcoming} /> : <GridView view={view} anchor={anchor} events={filtered} onMove={moveAnchor} />}
  </div></section>;
}

function Filter({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">{children}</select>; }
function ListView({ ongoing, upcoming }: { ongoing: PublicEvent[]; upcoming: PublicEvent[] }) { return <div className="mt-10 space-y-12">{ongoing.length > 0 && <div><h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-feu-moss">Ongoing now</h3><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{ongoing.map((event) => <EventCard key={event.id} event={event} ongoing />)}</div></div>}{upcoming.length > 0 && <div><h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-feu-moss">Coming up</h3><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((event) => <EventCard key={event.id} event={event} ongoing={false} />)}</div></div>}</div>; }
function GridView({ view, anchor, events, onMove }: { view: Exclude<CalendarView, "list">; anchor: Date; events: PublicEvent[]; onMove: (direction: number) => void }) {
  const start = new Date(anchor); if (view === "month") { start.setDate(1); } else { start.setDate(start.getDate() - start.getDay()); } start.setHours(0, 0, 0, 0);
  const count = view === "month" ? new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() : 7;
  const days = Array.from({ length: count }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });
  return <div className="mt-10"><div className="mb-4 flex items-center justify-between"><button type="button" onClick={() => onMove(-1)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white"><ChevronLeft className="h-4 w-4" /></button><h3 className="font-black text-ink">{view === "month" ? anchor.toLocaleDateString("en-PH", { month: "long", year: "numeric" }) : `${dayLabel.format(days[0])} – ${dayLabel.format(days[6])}`}</h3><button type="button" onClick={() => onMove(1)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white"><ChevronRight className="h-4 w-4" /></button></div><div className={`grid gap-2 ${view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"}`}>{days.map((day) => { const key = localDateKey(day); const dayEvents = events.filter((event) => localDateKey(new Date(event.starts_at)) === key); return <div key={key} className="min-h-32 rounded-2xl border border-slate-200 bg-white p-3"><p className="text-xs font-black text-slate-500">{dayLabel.format(day)}</p><div className="mt-2 space-y-2">{dayEvents.map((event) => <Link key={event.id} href={`/events/${event.slug}`} className="block rounded-lg bg-feu-green/10 p-2 text-[0.68rem] font-bold leading-4 text-feu-green">{event.title}</Link>)}</div></div>; })}</div></div>;
}
function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
