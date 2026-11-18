import Link from "next/link";
import { getAboutSections, getSettings } from "@/lib/data";

export default async function AboutPage() {
  const [settings, sections] = await Promise.all([
    getSettings(),
    getAboutSections(),
  ]);
  const phoneLink = settings.contact_phone?.replace(/\s/g, "");

  return (
    <main>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-amber-400">
            About {settings.church_name}
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {settings.church_tagline || "A home for every heart in Nairobi"}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        {sections.map((section) => (
          <article key={section.id}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold">Find Your Jumuiya</h3>
            <p className="mt-2 text-sm text-slate-600">
              Community happens in homes across Nairobi. Find a group near you.
            </p>
            <Link
              href="/groups"
              className="mt-4 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              Browse groups →
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold">Plan Your Visit</h3>
            <p className="mt-2 text-sm text-slate-600">
              Everything you need to know before your first Sunday with us.
            </p>
            <Link
              href="/visit"
              className="mt-4 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              See the visit guide →
            </Link>
          </div>
        </div>
      </section>

      {(settings.contact_email || (settings.contact_phone && phoneLink)) && (
        <section className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Have Questions?</h2>
          <p className="mt-3 text-slate-600">
            Reach out — we would love to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                Email Us
              </a>
            )}
            {settings.contact_phone && phoneLink && (
              <a
                href={`tel:${phoneLink}`}
                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-50"
              >
                Call {settings.contact_phone}
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
