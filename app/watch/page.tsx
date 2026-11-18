"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Service = {
  id: string | number;
  name: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string | null;
  language: string | null;
};

type SiteSetting = { key: string; value: string };
type Sermon = { id: string | number; title: string };
type Phase = "before" | "during" | "after";
type LoadState = "loading" | "ready" | "error";
type TimedService = { service: Service; start: Date; end: Date };

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DEFAULT_SERVICE_DURATION_MS = 2 * 60 * 60 * 1000;

function serviceTimeOnDate(service: Service, date: Date): Date | null {
  const dayOffset = DAYS.indexOf(service.day_of_week);
  const [hours, minutes] = service.start_time.split(":").map(Number);
  if (
    dayOffset < 0 ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const occurrence = new Date(date);
  occurrence.setDate(date.getDate() + dayOffset - date.getDay());
  occurrence.setHours(hours, minutes, 0, 0);
  return occurrence;
}

function serviceEndOnDate(service: Service, start: Date): Date {
  if (!service.end_time) {
    return new Date(start.getTime() + DEFAULT_SERVICE_DURATION_MS);
  }

  const [hours, minutes] = service.end_time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return new Date(start.getTime() + DEFAULT_SERVICE_DURATION_MS);
  }

  const end = new Date(start);
  end.setHours(hours, minutes, 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  return end;
}

function getTimedServices(services: Service[], now: Date): TimedService[] {
  return services.flatMap((service) => {
    const start = serviceTimeOnDate(service, now);
    if (!start) return [];
    return [{ service, start, end: serviceEndOnDate(service, start) }];
  });
}

function nextServiceOccurrence(
  service: Service,
  now: Date,
): TimedService | null {
  const thisWeek = serviceTimeOnDate(service, now);
  if (!thisWeek) return null;
  const candidate =
    thisWeek <= now
      ? new Date(thisWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      : thisWeek;

  return {
    service,
    start: candidate,
    end: serviceEndOnDate(service, candidate),
  };
}

function getPhase(services: Service[], now: Date): Phase {
  const thisWeek = getTimedServices(services, now);
  if (thisWeek.some(({ start, end }) => now >= start && now < end)) {
    return "during";
  }

  const serviceEndedToday = thisWeek.some(({ start, end }) => {
    const isToday = start.toDateString() === now.toDateString();
    return isToday && end <= now;
  });

  const serviceStillToday = thisWeek.some(({ start }) => {
    const isToday = start.toDateString() === now.toDateString();
    return isToday && start > now;
  });

  return serviceEndedToday && !serviceStillToday ? "after" : "before";
}

function getYouTubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1` : null;
    }
    if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      return null;
    }

    let id: string | null = null;
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (/^\/(live|embed)\/[^/]+/.test(url.pathname)) {
      id = url.pathname.split("/")[2] ?? null;
    }

    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`
      : null;
  } catch {
    return null;
  }
}

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Starting now";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`;
}

export default function WatchPage() {
  const supabase = useMemo(() => createClient(), []);
  const [services, setServices] = useState<Service[]>([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadWatchData() {
      const [serviceResult, settingsResult, sermonResult] = await Promise.all([
        supabase
          .from("service_times")
          .select("id,name,day_of_week,start_time,end_time,language")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("site_settings")
          .select("key,value")
          .in("key", ["live_stream_url", "live_stream_enabled"]),
        supabase
          .from("sermons")
          .select("id,title")
          .eq("is_published", true)
          .order("sermon_date", { ascending: false })
          .limit(1),
      ]);

      if (!active) return;
      if (serviceResult.error || settingsResult.error || sermonResult.error) {
        console.error("Could not load Watch page data.", {
          services: serviceResult.error,
          settings: settingsResult.error,
          sermon: sermonResult.error,
        });
        setLoadState("error");
        return;
      }

      const settings = Object.fromEntries(
        ((settingsResult.data ?? []) as SiteSetting[]).map(({ key, value }) => [
          key,
          value,
        ]),
      );
      setServices((serviceResult.data ?? []) as Service[]);
      setLiveUrl(settings.live_stream_url ?? "");
      setLiveEnabled(settings.live_stream_enabled === "true");
      setLatestSermon(((sermonResult.data ?? [])[0] as Sermon) ?? null);
      setLoadState("ready");
    }

    void loadWatchData();
    return () => {
      active = false;
    };
  }, [supabase]);

  if (loadState === "loading" || now === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">
        Loading Watch…
      </main>
    );
  }

  if (loadState === "error") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Watch Live</h1>
        <p role="alert" className="mt-4 text-red-600">
          Watch information couldn&apos;t be loaded. Please try again later.
        </p>
      </main>
    );
  }

  const phase = getPhase(services, now);
  const upcoming = services
    .map((service) => nextServiceOccurrence(service, now))
    .filter((occurrence): occurrence is TimedService => occurrence !== null)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  const embedUrl =
    liveEnabled && phase === "during" ? getYouTubeEmbedUrl(liveUrl) : null;
  const notifyUrl = upcoming
    ? `https://wa.me/?text=${encodeURIComponent(
        `Reminder: ${upcoming.service.name ?? "Church service"} is on ${upcoming.start.toLocaleDateString(
          "en-KE",
          { weekday: "long", month: "long", day: "numeric" },
        )} at ${upcoming.service.start_time}. Visit the church website to watch live.`,
      )}`
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Watch Live</h1>
        <p className="mt-3 text-slate-600">
          Join our service from wherever you are.
        </p>
      </header>

      {phase === "during" && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <h2 className="font-semibold">Service in progress</h2>
          </div>
          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
              <iframe
                src={embedUrl}
                title="Live church service"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="mb-6 rounded-xl bg-slate-100 p-10 text-center">
              <div
                aria-hidden="true"
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl"
              >
                📡
              </div>
              <p className="text-lg font-semibold">Stream starting soon</p>
              <p className="mt-2 text-slate-600">
                The service is scheduled now. The stream may not have started
                yet.
              </p>
            </div>
          )}
        </section>
      )}

      {phase === "before" && upcoming && (
        <section className="mb-6 rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-400">
            Next Service
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {upcoming.service.name ?? upcoming.service.day_of_week}
          </h2>
          <p className="mt-1 text-slate-300">
            {upcoming.start.toLocaleDateString("en-KE", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {upcoming.service.start_time}
            {upcoming.service.language ? ` · ${upcoming.service.language}` : ""}
          </p>
          <p
            aria-live="polite"
            className="mt-4 font-mono text-3xl"
            suppressHydrationWarning
          >
            {formatCountdown(upcoming.start, now)}
          </p>
          {notifyUrl && (
            <a
              href={notifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500"
            >
              Notify Me on WhatsApp
            </a>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Opens a WhatsApp reminder for you to send.
          </p>
        </section>
      )}

      {phase === "during" && !upcoming && (
        <section className="mb-6 rounded-xl bg-slate-900 p-6 text-white">
          <h2 className="text-xl font-bold">Service in progress</h2>
        </section>
      )}

      {phase === "after" && (
        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-800">
            Service has ended
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Catch up on the latest message
          </h2>
          {latestSermon ? (
            <>
              <p className="mt-2 text-slate-700">{latestSermon.title}</p>
              <Link
                href={`/sermons/${encodeURIComponent(latestSermon.id)}`}
                className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                Watch or listen to the latest sermon
              </Link>
            </>
          ) : (
            <p className="mt-2 text-slate-700">
              The latest recorded sermon will appear here when it is published.
            </p>
          )}
          <Link
            href="/sermons"
            className="ml-4 inline-block text-sm font-semibold text-amber-800 hover:underline"
          >
            Browse all sermons
          </Link>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/sermons"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-amber-400"
        >
          <h3 className="font-bold">Catch Up on Sermons</h3>
          <p className="mt-2 text-sm text-slate-600">
            Watch or download a recorded message.
          </p>
        </Link>
        <Link
          href="/visit"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-amber-400"
        >
          <h3 className="font-bold">Plan a Visit Instead</h3>
          <p className="mt-2 text-sm text-slate-600">
            Everything you need for your first Sunday in person.
          </p>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Stream availability is managed by the church. Service times use your
        device&apos;s local time.
      </p>
    </main>
  );
}
