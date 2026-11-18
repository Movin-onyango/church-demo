// app/projects/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/data';

export const revalidate = 10;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p: any) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const images = project.media.filter((m: any) => m.media_type === 'image');
  const videos = project.media.filter((m: any) => m.media_type === 'youtube');

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/projects" className="text-sm text-amber-600 hover:underline mb-6 inline-block">← All Projects</Link>
      
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
            project.status === 'current' ? 'bg-green-100 text-green-800' : 
            project.status === 'upcoming' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {project.status}
          </span>
          {project.start_date && (
            <span className="text-sm text-slate-500">
              {new Date(project.start_date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold">{project.title}</h1>
        <p className="text-xl text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </header>

      {/* Giving Progress */}
      {project.target_amount && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-10">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-green-600">Raised: KES {project.raised_amount?.toLocaleString()}</span>
            <span className="text-slate-500">Goal: KES {project.target_amount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${Math.min(100, (project.raised_amount / project.target_amount) * 100)}%` }} />
          </div>
          <Link href="/give" className="inline-block px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800">
            Support this Project
          </Link>
        </div>
      )}

      {/* Custom Fields (The Key/Value pairs) */}
      {project.fields.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Project Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {project.fields.map((field: any) => (
              <div key={field.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between">
                <span className="text-slate-500 font-medium">{field.field_key}</span>
                <span className="font-semibold text-slate-900">{field.field_value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Media Gallery */}
      {images.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Gallery</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {images.map((img: any) => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-slate-200">
                <img src={img.url} alt={img.caption || project.title} className="w-full h-auto" loading="lazy" />
                {img.caption && <p className="text-xs text-slate-500 p-2 bg-slate-50">{img.caption}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Videos</h2>
          <div className="space-y-6">
            {videos.map((vid: any) => (
              <div key={vid.id}>
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-2">
                  <iframe src={`https://www.youtube-nocookie.com/embed/${vid.url}`} title={vid.caption || 'Project Video'} allowFullScreen className="w-full h-full" />
                </div>
                {vid.caption && <p className="text-sm text-slate-600">{vid.caption}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}