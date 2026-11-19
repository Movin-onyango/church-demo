
import Link from "next/link";
import { getProjects } from "@/lib/data";

export const revalidate = 10;

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type ProjectMedia = {
  id?: number;
  media_type: "image" | "youtube";
  url: string;
  caption?: string | null;
  display_order?: number;
};

type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: "current" | "upcoming" | "completed";
  target_amount: number | null;
  raised_amount: number | null;
  start_date?: string | null;
  project_media?: ProjectMedia[];
  image_url?: string | null;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProjectImage(project: Project) {
  // Prefer an uploaded image from the project media gallery.
  const uploadedImage = project.project_media?.find(
    (media) =>
      media.media_type === "image" &&
      Boolean(media.url)
  );

  return uploadedImage?.url || project.image_url || null;
}

function getFundingPercentage(project: Project) {
  const target = Number(project.target_amount || 0);
  const raised = Number(project.raised_amount || 0);

  if (target <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, (raised / target) * 100)
  );
}

// --------------------------------------------------
// PROJECT CARD
// --------------------------------------------------

function ProjectCard({ p }: { p: Project }) {
  const image = getProjectImage(p);

  const percentage = getFundingPercentage(p);

  const raised = Number(p.raised_amount || 0);

  const target = Number(p.target_amount || 0);

  const statusStyles = {
    current: "bg-amber-500 text-slate-950",
    upcoming: "bg-white text-slate-900",
    completed: "bg-slate-700 text-white",
  };

  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl"
    >
      {/* IMAGE SECTION */}

      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950">

        {image ? (
          <img
            src={image}
            alt={p.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl text-amber-400">
                ✦
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                Building the Vision
              </p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status Badge */}

        <div className="absolute left-6 top-6 z-20">
          <span
            className={`inline-flex rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-lg ${statusStyles[p.status]}`}
          >
            {p.status}
          </span>
        </div>

        {/* Project Title */}

        <div className="absolute bottom-6 left-6 right-6 z-20">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Grace Church Initiatives
          </p>

          <h3 className="text-2xl font-extrabold leading-tight text-white transition-colors group-hover:text-amber-300 md:text-3xl">
            {p.title}
          </h3>
        </div>

        {/* Hover Indicator */}

        <div className="absolute bottom-6 right-6 z-20 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-slate-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          →
        </div>
      </div>

      {/* PROJECT DETAILS */}

      <div className="flex flex-1 flex-col justify-between p-6">

        <div>
          <p className="mb-6 line-clamp-3 text-sm leading-7 text-slate-600">
            {p.description}
          </p>
        </div>

        {/* FUNDRAISING PROGRESS */}

        {target > 0 ? (
          <div className="mt-auto">

            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Raised so far
                </p>

                <p className="mt-1 text-lg font-extrabold text-emerald-600">
                  KES {formatKES(raised)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  KES {formatKES(target)}
                </p>
              </div>
            </div>

            {/* Progress Track */}

            <div
              className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${p.title} fundraising progress`}
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-600">
                {Math.round(percentage)}% funded
              </p>

              <p className="text-xs text-slate-400">
                {formatKES(Math.max(0, target - raised))} remaining
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-sm font-bold text-amber-600">
              Vision Project
            </p>

            <span className="text-xl text-slate-400 transition-transform group-hover:translate-x-2">
              →
            </span>
          </div>
        )}

        {/* VIEW PROJECT */}

        <div className="mt-6 border-t border-slate-100 pt-4">
          <span className="text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-600">
            Explore Project →
          </span>
        </div>

      </div>
    </Link>
  );
}

// --------------------------------------------------
// PROJECT SECTION
// --------------------------------------------------

function ProjectSection({
  title,
  subtitle,
  projects,
  number,
  color,
}: {
  title: string;
  subtitle: string;
  projects: Project[];
  number: string;
  color: "amber" | "slate" | "green";
}) {
  if (projects.length === 0) return null;

  const numberStyles = {
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-200 text-slate-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <section className="mb-24">

      {/* SECTION HEADER */}

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${numberStyles[color]}`}
            >
              {number}
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Our Church Projects
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <p className="text-sm font-semibold text-slate-400">
          {projects.length}{" "}
          {projects.length === 1 ? "Project" : "Projects"}
        </p>

      </div>

      {/* PROJECT GRID */}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>

    </section>
  );
}

// --------------------------------------------------
// MAIN PROJECTS PAGE
// --------------------------------------------------

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Normalize project records.
  const projectRecords = (projects || []) as unknown as Project[];

  // Organize projects by status.
  const current = projectRecords.filter(
    (p) => p.status === "current"
  );

  const upcoming = projectRecords.filter(
    (p) => p.status === "upcoming"
  );

  const completed = projectRecords.filter(
    (p) => p.status === "completed"
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* HERO SECTION */}

      <section className="relative overflow-hidden bg-slate-950 pb-28 pt-28 md:pb-36 md:pt-36">

        {/* Background Decorations */}

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">

          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Faith in Action
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Building the{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Vision
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            See what God is doing through our church. From building
            projects to community outreach, every initiative is
            an opportunity to make a lasting difference.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

            <Link
              href="#current-projects"
              className="rounded-full bg-amber-400 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-xl transition-all hover:-translate-y-1 hover:bg-amber-300"
            >
              Explore Our Projects
            </Link>

            <Link
              href="/give"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:border-amber-400 hover:bg-white/10"
            >
              Support Our Mission
            </Link>

          </div>

          {/* Project Statistics */}

          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-10">

            <div>
              <p className="text-3xl font-black text-white md:text-4xl">
                {projectRecords.length}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Projects
              </p>
            </div>

            <div>
              <p className="text-3xl font-black text-amber-400 md:text-4xl">
                {current.length}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ongoing
              </p>
            </div>

            <div>
              <p className="text-3xl font-black text-emerald-400 md:text-4xl">
                {completed.length}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Completed
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* PROJECT CONTENT */}

      <div className="mx-auto max-w-7xl px-4 pt-24">

        {/* CURRENT PROJECTS */}

        <div id="current-projects">
          <ProjectSection
            number="01"
            title="Current Projects"
            subtitle="Be part of what God is building today."
            projects={current}
            color="amber"
          />
        </div>

        {/* UPCOMING PROJECTS */}

        <ProjectSection
          number="02"
          title="Coming Soon"
          subtitle="Discover the next steps in our church's vision."
          projects={upcoming}
          color="slate"
        />

        {/* COMPLETED PROJECTS */}

        <ProjectSection
          number="03"
          title="Completed by God's Grace"
          subtitle="Celebrating the milestones made possible through faith and generosity."
          projects={completed}
          color="green"
        />

        {/* EMPTY STATE */}

        {projectRecords.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl text-amber-500">
              ✦
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
              Great things are being prepared.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
              Our project updates will appear here. Please check
              back soon to see what God is doing through our church.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-500 hover:text-slate-950"
            >
              Return Home
            </Link>

          </div>
        )}

      </div>

    </main>
  );
}
