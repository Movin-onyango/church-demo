import Image from "next/image";
import Link from "next/link";
import type {
  Announcement,
  HomepageSection,
  ServiceTime,
  Sermon,
  SmallGroup,
  VisitInfo,
} from "@/lib/data";

type Props = {
  sections: HomepageSection[];
  settings: Record<string, string>;
  services: ServiceTime[];
  featured: Sermon | null;
  announcements: Announcement[];
  visit: VisitInfo[];
  groups: SmallGroup[];
};

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: -1, section_type: "hero", title: null, is_active: true, display_order: 0 },
  { id: -2, section_type: "service_times", title: null, is_active: true, display_order: 1 },
  { id: -3, section_type: "featured_sermon", title: null, is_active: true, display_order: 2 },
  { id: -4, section_type: "visit_cards", title: null, is_active: true, display_order: 3 },
  { id: -5, section_type: "giving_cta", title: null, is_active: true, display_order: 4 },
  { id: -6, section_type: "announcements", title: null, is_active: true, display_order: 5 },
];

function setting(
  settings: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return settings[key] || fallback;
}

function HomepageSectionContent({
  section,
  settings,
  services,
  featured,
  announcements,
  visit,
}: Omit<Props, "sections" | "groups"> & { section: HomepageSection }) {
  switch (section.section_type) {
    case "hero":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white"
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 md:py-40">
            <div className="max-w-3xl">
              <p className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-amber-400 backdrop-blur">
                {setting(settings, "church_name", "Our Church")}
                {settings.contact_address
                  ? ` · ${settings.contact_address}`
                  : ""}
              </p>
              <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
                {setting(settings, "hero_headline", "Welcome")}
              </h1>
              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-2xl">
                {setting(
                  settings,
                  "hero_subheadline",
                  "Join us for worship, community, and service.",
                )}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={setting(
                    settings,
                    "hero_primary_cta_link",
                    "/visit",
                  )}
                  className="rounded-full bg-amber-500 px-8 py-4 text-center text-lg font-bold text-slate-900 shadow-lg transition hover:scale-105 hover:bg-amber-400"
                >
                  {setting(
                    settings,
                    "hero_primary_cta_text",
                    "Plan Your Visit",
                  )}
                </Link>
                <Link
                  href={setting(
                    settings,
                    "hero_secondary_cta_link",
                    "/watch",
                  )}
                  className="rounded-full border-2 border-white/20 px-8 py-4 text-center text-lg font-bold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  {setting(
                    settings,
                    "hero_secondary_cta_text",
                    "Watch Online",
                  )}
                </Link>
              </div>
            </div>
          </div>
        </section>
      );

    case "service_times":
      if (services.length === 0) return null;
      return (
        <section
          key={section.id}
          className="bg-amber-500 text-slate-900"
          aria-label="Service times"
        >
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium md:text-base">
              {services.map((service) => (
                <span key={service.id} className="flex items-center gap-2">
                  <span className="font-bold">{service.day_of_week}</span>
                  {service.start_time}
                  {service.end_time ? `–${service.end_time}` : ""}
                  {service.language && (
                    <span className="opacity-70">· {service.language}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>
      );

    case "featured_sermon":
      if (!featured) return null;
      return (
        <section key={section.id} className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                  Last Sunday
                </h2>
                <p className="mt-3 text-lg text-slate-500">
                  Catch up on the latest message.
                </p>
              </div>
              <Link
                href="/sermons"
                className="hidden items-center gap-2 font-bold text-amber-600 transition hover:text-amber-700 md:flex"
              >
                All sermons <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="group relative lg:col-span-7">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl">
                  {featured.thumbnail_url ? (
                    <Image
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Video poster
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-5 lg:pl-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                    Latest Message
                  </span>
                  <span className="text-sm text-slate-500">
                    {new Date(featured.sermon_date).toLocaleDateString(
                      "en-KE",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </span>
                </div>
                <h3 className="mb-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                  {featured.title}
                </h3>
                {featured.description && (
                  <p className="mb-8 line-clamp-3 text-lg leading-relaxed text-slate-600">
                    {featured.description}
                  </p>
                )}
                {featured.audio_url && (
                  <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      Low-data audio
                      {featured.audio_size_mb != null
                        ? ` · ${featured.audio_size_mb} MB`
                        : ""}
                    </p>
                    <audio
                      controls
                      preload="none"
                      className="w-full"
                      src={featured.audio_url}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}
                <Link
                  href={`/sermons/${featured.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  Watch / Listen
                </Link>
              </div>
            </div>
          </div>
        </section>
      );

    case "visit_cards":
      return (
        <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-20 md:py-24" key={section.id}>
          <div className="relative z-10 mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                First Time? We&apos;ve Got You.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Everything you need to know before you walk through our doors.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visit.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl font-bold text-amber-600">
                    {item.title.charAt(0)}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/visit"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                See the Full Visit Guide <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      );

    case "giving_cta":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-amber-500 py-20 md:py-24"
        >
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
              Give with One Tap
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl font-medium text-slate-800">
              Tithe, offering, building fund, or welfare — give directly to the
              church.
            </p>
            <Link
              href="/give"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:bg-slate-800"
            >
              Give Now <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      );

    case "announcements":
      if (announcements.length === 0) return null;
      return (
        <section key={section.id} className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                  This Week
                </h2>
                <p className="mt-3 text-lg text-slate-500">
                  Stay updated with the life of the church.
                </p>
              </div>
              <Link
                href="/bulletin"
                className="shrink-0 font-bold text-amber-600 transition hover:text-amber-700"
              >
                Full Bulletin →
              </Link>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="group flex gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg md:p-8"
                >
                  <div
                    className={`w-1.5 shrink-0 rounded-full ${
                      announcement.priority === "urgent"
                        ? "bg-red-500"
                        : announcement.priority === "important"
                          ? "bg-amber-500"
                          : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 transition group-hover:text-amber-600">
                      {announcement.title}
                    </h3>
                    <p className="leading-relaxed text-slate-600">
                      {announcement.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
  }
}

export default function HomepageSections(props: Props) {
  const sections =
    props.sections.length > 0 ? props.sections : DEFAULT_SECTIONS;
  const areas = new Set(props.groups.map((group) => group.area));

  return (
    <main className="flex flex-col">
      {sections.map((section) => (
        <HomepageSectionContent key={section.id} {...props} section={section} />
      ))}

      <section className="bg-amber-50 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
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

      <section className="bg-slate-950 py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-5xl">
                Find Your Jumuiya
              </h2>
              <p className="text-lg text-slate-400">
                Community happens in homes across Nairobi. Find a group near
                you.
              </p>
            </div>
            <Link
              href="/groups"
              className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              View All Groups
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {props.groups.slice(0, 6).map((group) => (
              <div
                key={group.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:bg-white/10"
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-400">
                  {group.area}
                </p>
                <h3 className="mb-2 text-xl font-bold">{group.name}</h3>
                <p className="mb-5 text-slate-400">
                  {[group.meeting_day, group.meeting_time]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {group.whatsapp_number && (
                  <a
                    href={`https://wa.me/${group.whatsapp_number}?text=${encodeURIComponent(
                      `Hi ${group.leader_name ?? ""}, I found ${group.name} on the church website and would like to visit.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    Contact group on WhatsApp
                  </a>
                )}
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
    </main>
  );
}
