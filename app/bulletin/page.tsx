import { getActiveAnnouncements, getSettings } from "@/lib/data";

export default async function BulletinPage() {
  const [announcements, settings] = await Promise.all([
    getActiveAnnouncements(),
    getSettings(),
  ]);
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const shareText = encodeURIComponent(
    `${settings.church_name ?? "Church"} — Sunday Bulletin\n\n` +
      announcements
        .map((announcement) => `• ${announcement.title}\n${announcement.body}`)
        .join("\n\n") +
      (settings.contact_phone ? `\n\n${settings.contact_phone}` : ""),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">
          This Week&apos;s Bulletin
        </h1>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          Share on WhatsApp
        </a>
      </header>

      {announcements.length === 0 ? (
        <p className="text-slate-500">No announcements this week.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded-xl border p-5 ${
                announcement.priority === "urgent"
                  ? "border-red-300 bg-red-50"
                  : announcement.priority === "important"
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              {announcement.priority !== "normal" && (
                <p
                  className={`mb-1 text-xs font-bold uppercase tracking-wider ${
                    announcement.priority === "urgent"
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                >
                  {announcement.priority}
                </p>
              )}
              <h2 className="text-lg font-bold">{announcement.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-700">
                {announcement.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
