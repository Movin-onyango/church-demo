import Link from "next/link";
import { notFound } from "next/navigation";
import SermonVideo from "@/components/SermonVideo";
import { getAllSermons, getSermonById } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const sermons = await getAllSermons();
  return sermons.map((sermon) => ({ id: String(sermon.id) }));
}

export default async function SermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sermon = await getSermonById(id);
  if (!sermon) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/sermons"
        className="text-sm text-amber-600 hover:underline"
      >
        ← All sermons
      </Link>

      <header className="mb-8 mt-4">
        <p className="text-sm text-slate-500">
          {new Date(sermon.sermon_date).toLocaleDateString("en-KE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {sermon.preacher ? ` · ${sermon.preacher}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{sermon.title}</h1>
        {sermon.description && (
          <p className="mt-3 leading-relaxed text-slate-600">
            {sermon.description}
          </p>
        )}
      </header>

      {sermon.youtube_video_id && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Watch (Video)
          </h2>
          <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
            <SermonVideo
              videoId={sermon.youtube_video_id}
              title={sermon.title}
              thumbnailUrl={sermon.thumbnail_url}
            />
          </div>
        </section>
      )}

      {sermon.audio_url && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Listen (Low-Data Audio
            {sermon.audio_size_mb ? ` · ${sermon.audio_size_mb} MB` : ""})
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <audio controls preload="none" className="w-full">
              <source src={sermon.audio_url} type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
            <a
              href={sermon.audio_url}
              download
              className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              Download MP3 for offline listening
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
