// app/projects/page.tsx
import Link from 'next/link';
import { getProjects } from '@/lib/data';

export const revalidate = 10;

export default async function ProjectsPage() {
  const projects = await getProjects();

  const current = projects.filter((p: any) => p.status === 'current');
  const upcoming = projects.filter((p: any) => p.status === 'upcoming');
  const completed = projects.filter((p: any) => p.status === 'completed');

  const ProjectCard = ({ p }: { p: any }) => (
    <Link href={`/projects/${p.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
        <div className="h-48 bg-slate-100 relative">
          {/* If the project has images, we'd fetch them here, but for the list view, we use a placeholder or gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
             <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 ${
                p.status === 'current' ? 'bg-green-500 text-white' : 
                p.status === 'upcoming' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                {p.status}
              </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition">{p.title}</h3>
          <p className="text-slate-600 text-sm mt-2 line-clamp-2">{p.description}</p>
          
          {p.target_amount && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-green-600">Raised: KES {p.raised_amount?.toLocaleString()}</span>
                <span className="text-slate-500">Goal: KES {p.target_amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (p.raised_amount / p.target_amount) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold">Our Projects & Vision</h1>
        <p className="text-slate-600 mt-4 text-lg">
          See what God is doing through our church. From building projects to community outreach, you can be part of the story.
        </p>
      </header>

      {current.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full" /> Current Projects
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {current.map((p: any) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full" /> Upcoming Projects
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((p: any) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-slate-400 rounded-full" /> Completed Projects
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((p: any) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}