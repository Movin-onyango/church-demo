import Image from "next/image";
import Link from "next/link";
import {
  getActiveAnnouncements,
  getFeaturedSermon,
  getServiceTimes,
  getSettings,
  getSmallGroups,
  getVisitInfo,
} from "@/lib/data";

function requiredSetting(
  settings: Record<string, string>,
  key: string,
): string {
  const value = settings[key];
  if (!value) {
    throw new Error(`Missing required site setting: ${key}`);
  }
  return value;
}

export default async function HomePage() {
  const [settings, services, featured, announcements, visit, groups] =
    await Promise.all([
      getSettings(),
      getServiceTimes(),
      getFeaturedSermon(),
      getActiveAnnouncements(),
      getVisitInfo(),
      getSmallGroups(),
    ]);

  const areas = new Set(groups.map((group) => group.area));
  const churchName = requiredSetting(settings, "church_name");
  const contactAddress = requiredSetting(settings, "contact_address");
  const primaryCtaText = requiredSetting(settings, "hero_primary_cta_text");
  const primaryCtaLink = requiredSetting(settings, "hero_primary_cta_link");
  const secondaryCtaText = requiredSetting(settings, "hero_secondary_cta_text");
  const secondaryCtaLink =
    settings.hero_secondary_cta_link || "/watch";
  const heroHeadline = requiredSetting(settings, "hero_headline");
  const heroSubheadline = requiredSetting(settings, "hero_subheadline");

  return (
    <main>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-amber-400">
            {churchName} · {contactAddress}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            {heroHeadline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            {heroSubheadline}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCtaLink}
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400"
            >
              {primaryCtaText}
            </Link>
            <Link
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              {secondaryCtaText}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-amber-500 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium md:text-base">
            {services.map((service) => (
              <span
                key={service.id}
                className="flex items-center gap-2"
              >
                <span className="font-bold">{service.day_of_week}</span>
                {service.start_time}–{service.end_time}
                <span className="opacity-70">· {service.language}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Last Sunday</h2>
            <Link
              href="/sermons"
              className="text-sm font-semibold text-amber-600 hover:underline"
            >
              All sermons →
            </Link>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-200 text-slate-400">
              {featured.thumbnail_url ? (
                <Image
                  src={featured.thumbnail_url}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span>Video poster</span>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {new Date(featured.sermon_date).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {featured.preacher ? ` · ${featured.preacher}` : ""}
              </p>
              <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                {featured.title}
              </h3>
              {featured.description && (
                <p className="mt-3 text-slate-600">{featured.description}</p>
              )}
              {featured.audio_url && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                    Listen on the Go
                    {featured.audio_size_mb != null
                      ? ` · ${featured.audio_size_mb} MB`
                      : ""}
                  </p>
                  <audio controls preload="none" className="w-full">
                    <source src={featured.audio_url} type="audio/mpeg" />
                  </audio>
                  <p className="mt-2 text-xs text-slate-500">
                    Save your data.{" "}
                    <a
                      href={featured.audio_url}
                      download
                      className="font-medium text-amber-600 hover:underline"
                    >
                      Download this sermon
                    </a>{" "}
                    and listen offline on your commute.
                  </p>
                </div>
              )}
              <Link
                href={`/sermons/${featured.id}`}
                className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                Watch / Listen →
              </Link>
            </div>
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">
                This Week at Church
              </h2>
              <Link
                href="/bulletin"
                className="text-sm font-semibold text-amber-600 hover:underline"
              >
                Full bulletin →
              </Link>
            </div>
            <ul className="space-y-3">
              {announcements.map((announcement) => (
                <li
                  key={announcement.id}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        announcement.priority === "urgent"
                          ? "bg-red-500"
                          : announcement.priority === "important"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {announcement.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-8 text-center md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            How Can We Pray for You?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-700">
            Whatever you are carrying this week, you don&apos;t have to carry it
            alone. Our pastoral team prays over every request.
          </p>
          <Link
            href="/prayer"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Share a Prayer Request →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            First Time? We&apos;ve Got You.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Everything you need to know before you walk through our doors.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visit.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold uppercase text-amber-600">
                {item.title.charAt(0)}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/visit"
            className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            See the Full Visit Guide →
          </Link>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              Find Your Jumuiya
            </h2>
            <p className="mt-3 text-slate-300">
              Community happens in homes across Nairobi. Find one near you and
              reach the leader directly on WhatsApp.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 6).map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {group.area}
                </p>
                <h3 className="mt-2 font-semibold">{group.name}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {group.meeting_day} · {group.meeting_time}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Leader: {group.leader_name}
                </p>
                <a
                  href={`https://wa.me/${group.whatsapp_number}?text=${encodeURIComponent(
                    `Hi ${group.leader_name}, I found ${group.name} on the church website and would like to visit.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                >
                  WhatsApp Leader
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/groups"
              className="font-semibold text-amber-400 hover:underline"
            >
              Find a group near {areas.size} areas →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-amber-500 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Give with One Tap</h2>
          <p className="mx-auto mt-3 max-w-lg">
            Tithe, offering, building fund, or welfare — send directly to the
            church Paybill without leaving this page.
          </p>
          <Link
            href="/give"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Give Now →
          </Link>
        </div>
      </section>
    </main>
  );
}
