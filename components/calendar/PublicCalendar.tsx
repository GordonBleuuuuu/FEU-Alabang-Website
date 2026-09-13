"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PublicEvent = {
  id: string;
  title: string;
  description: string;
  organizer_name: string;
  venue: string | null;
  starts_at: string;
  ends_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function EventCard({ event, ongoing }: { event: PublicEvent; ongoing: boolean }) {
  return (
    <article className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            ongoing
              ? "bg-gold-default/20 text-feu-moss"
              : "bg-feu-green/10 text-feu-green"
          }`}
        >
          {ongoing ? "Ongoing" : "Upcoming"}
        </span>
        <span className="text-right text-xs font-semibold text-feu-teal">
          {event.organizer_name}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black text-ink">{event.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {event.description || "More event details will be announced soon."}
      </p>

      <dl className="mt-auto space-y-3 pt-6 text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-feu-green" aria-hidden="true" />
          <div>
            <dt className="sr-only">Schedule</dt>
            <dd>{dateFormatter.format(new Date(event.starts_at))}</dd>
          </div>
        </div>
        {event.venue && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-feu-green" aria-hidden="true" />
            <div>
              <dt className="sr-only">Venue</dt>
              <dd>{event.venue}</dd>
            </div>
          </div>
        )}
      </dl>
    </article>
  );
}

export default function PublicCalendar() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshotAt, setSnapshotAt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      const { data, error: queryError } = await supabase
        .from("events")
        .select("id,title,description,organizer_name,venue,starts_at,ends_at")
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (!active) return;
      if (queryError) setError("The events calendar is temporarily unavailable.");
      else setEvents((data ?? []) as PublicEvent[]);
      setSnapshotAt(Date.now());
      setIsLoading(false);
    }

    void loadEvents();
    return () => {
      active = false;
    };
  }, []);

  const { ongoing, upcoming } = useMemo(() => {
    const now = snapshotAt;
    return {
      ongoing: events.filter(
        (event) => new Date(event.starts_at).getTime() <= now && new Date(event.ends_at).getTime() > now,
      ),
      upcoming: events.filter((event) => new Date(event.starts_at).getTime() > now),
    };
  }, [events, snapshotAt]);

  return (
    <section id="events" className="scroll-mt-24 bg-cloud py-20 sm:py-24">
      <div className="container-px">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="section-eyebrow">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              RSO Calendar
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              What’s happening at FEU Alabang
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Follow ongoing programs and plan ahead for recognized student organization events.
            </p>
          </div>
          <div className="flex gap-3 text-xs font-bold uppercase tracking-wide">
            <span className="rounded-full bg-gold-default/20 px-3 py-2 text-feu-moss">
              {ongoing.length} ongoing
            </span>
            <span className="rounded-full bg-feu-green/10 px-3 py-2 text-feu-green">
              {upcoming.length} upcoming
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </p>
        ) : events.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-feu-green/30 bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-feu-green" aria-hidden="true" />
            <p className="mt-4 font-bold text-ink">No current or upcoming events</p>
            <p className="mt-1 text-sm text-slate-500">Published RSO events will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {ongoing.length > 0 && (
              <div>
                <h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-feu-moss">
                  Ongoing now
                </h3>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {ongoing.map((event) => <EventCard key={event.id} event={event} ongoing />)}
                </div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-feu-moss">
                  Coming up
                </h3>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => <EventCard key={event.id} event={event} ongoing={false} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
