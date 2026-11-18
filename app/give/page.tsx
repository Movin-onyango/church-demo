import Image from "next/image";
import GiveForm from "@/components/GiveForm";
import { getGivingSections, getSettings } from "@/lib/data";

export default async function GivePage() {
  const [sections, settings] = await Promise.all([
    getGivingSections(),
    getSettings(),
  ]);

  return (
    <main className="pb-20">
      <section className="mx-auto max-w-lg px-4 pb-16 pt-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Give with One Tap</h1>
          <p className="mt-3 text-slate-600">
            Tithe, offering, building fund, or welfare.
          </p>
        </header>
        <GiveForm
          paybill={settings.mpesa_paybill ?? ""}
          accountPrefix={settings.mpesa_account_prefix ?? ""}
        />
      </section>

      {sections.length > 0 && (
        <section className="bg-[#1e1e1e] py-16 text-slate-200 md:py-24">
          <div className="mx-auto max-w-4xl space-y-20 px-4 md:space-y-32">
            {sections.map((section) => (
              <article key={section.id} className="space-y-8">
                {section.image_url && (
                  <div className="relative max-h-[500px] overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src={section.image_url}
                      alt={section.title}
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-auto max-h-[500px] w-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
                    {section.title}
                  </h2>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-300 md:text-xl">
                    {section.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
