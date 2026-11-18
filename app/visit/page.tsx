import Link from "next/link";
import { getServiceTimes, getSettings, getVisitInfo } from "@/lib/data";

export default async function VisitPage() {
  const [settings, visit, services] = await Promise.all([
    getSettings(),
    getVisitInfo(),
    getServiceTimes(),
  ]);

  return (
    <main>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-amber-400">
            First Time at {settings.church_name}?
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Here&apos;s Exactly What to Expect This Sunday
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            No surprises. No pressure. We answer the questions visitors ask
            before walking through our doors.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          {visit.map((item, index) => (
            <article
              key={item.id}
              className="flex gap-5 rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-700">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold">Service Times</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                {service.name && <h3 className="font-semibold">{service.name}</h3>}
                <p className="mt-1 text-sm text-slate-600">
                  {service.day_of_week} · {service.start_time}
                  {service.end_time ? `–${service.end_time}` : ""}
                </p>
                {service.language && (
                  <p className="mt-1 text-sm text-slate-500">
                    Language: {service.language}
                  </p>
                )}
                {service.location && (
                  <p className="text-sm text-slate-500">
                    Location: {service.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl bg-slate-900 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to Come?</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            {[settings.contact_address, settings.contact_phone]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/sermons"
              className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
            >
              Watch Last Sunday First
            </Link>
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="rounded-lg border border-white/30 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
              >
                Ask a Question
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
