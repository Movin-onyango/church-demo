import Image from "next/image";
import Link from "next/link";
import { getAllSermons } from "@/lib/data";

export default async function SermonsPage() {
  const sermons = await getAllSermons();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold md:text-4xl">Sermon Archive</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Watch the video, or download low-data audio to listen on your commute.
        </p>
      </header>

      {sermons.length === 0 ? (
        <p className="text-slate-500">No sermons yet. Check back soon.</p>
      ) : (
        <div className="space-y-4">
          {sermons.map((sermon) => (
            <article
              key={sermon.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center"
            >
              <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 md:w-40">
                {sermon.thumbnail_url ? (
                  <Image
                    src={sermon.thumbnail_url}
                    alt={sermon.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 160px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">
                  {new Date(sermon.sermon_date).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {sermon.preacher ? ` · ${sermon.preacher}` : ""}
                </p>
                <h2 className="mt-1 text-lg font-bold">{sermon.title}</h2>
                {sermon.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {sermon.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/sermons/${encodeURIComponent(sermon.id)}`}
                    className="text-sm font-semibold text-amber-600 hover:underline"
                  >
                    Open →
                  </Link>
                  {sermon.audio_url && (
                    <a
                      href={sermon.audio_url}
                      download
                      className="text-sm font-semibold text-slate-700 hover:underline"
                    >
                      Download MP3
                      {sermon.audio_size_mb
                        ? ` (${sermon.audio_size_mb} MB)`
                        : ""}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
