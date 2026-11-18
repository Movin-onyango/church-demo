import "server-only";

type SettingRow = { key: string; value: string };
type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  target_amount: number | null;
  raised_amount: number;
  start_date: string | null;
  is_published: boolean;
  display_order: number;
};
type ProjectMediaRow = {
  id: number;
  media_type: "image" | "youtube";
  url: string;
  caption: string | null;
  display_order: number;
};
type ProjectFieldRow = {
  id: number;
  field_key: string;
  field_value: string;
  display_order: number;
};

export type ServiceTime = {
  id: string;
  name: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string | null;
  language: string;
  location: string | null;
};

export type VisitInfo = {
  id: string;
  title: string;
  body: string;
};

export type AboutSection = {
  id: string;
  section_key: string;
  title: string;
  body: string;
};

export type GivingSection = {
  id: string | number;
  title: string;
  body: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type Sermon = {
  id: string;
  title: string;
  sermon_date: string;
  preacher: string | null;
  description: string | null;
  thumbnail_url: string | null;
  audio_url: string | null;
  audio_size_mb: number | null;
  youtube_video_id: string | null;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: string;
};

export type SmallGroup = {
  id: string;
  area: string;
  name: string;
  meeting_day: string | null;
  meeting_time: string | null;
  leader_name: string | null;
  whatsapp_number: string | null;
};

export type NavLink = {
  id: string;
  href: string;
  label: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url: url.replace(/\/+$/, ""), anonKey };
}

async function restGet<T>(path: string): Promise<T> {
  const { url, anonKey } = getSupabaseConfig();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error(`Supabase request failed (${res.status}): ${path}`);
  }

  return (await res.json()) as T;
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await restGet<SettingRow[]>("site_settings?select=key,value");
  return Object.fromEntries(rows.map(({ key, value }) => [key, value]));
}

export async function getServiceTimes(): Promise<ServiceTime[]> {
  return restGet(
    "service_times?is_active=eq.true&order=display_order.asc",
  );
}

export async function getVisitInfo(): Promise<VisitInfo[]> {
  return restGet("visit_info?is_active=eq.true&order=display_order.asc");
}

export async function getAboutSections(): Promise<AboutSection[]> {
  return restGet(
    "about_sections?is_active=eq.true&order=display_order.asc",
  );
}

export async function getGivingSections(): Promise<GivingSection[]> {
  return restGet(
    "giving_sections?is_active=eq.true&order=display_order.asc",
  );
}

export async function getFeaturedSermon(): Promise<Sermon | null> {
  const rows = await restGet<Sermon[]>(
    "sermons?is_featured=eq.true&is_published=eq.true&limit=1",
  );
  return rows[0] ?? null;
}

export async function getRecentSermons(limit = 3): Promise<Sermon[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("Sermon limit must be a positive integer.");
  }

  return restGet(
    `sermons?is_published=eq.true&order=sermon_date.desc&limit=${limit}`,
  );
}

export async function getAllSermons(): Promise<Sermon[]> {
  return restGet("sermons?is_published=eq.true&order=sermon_date.desc");
}

export async function getSermonById(id: string): Promise<Sermon | null> {
  if (!id) {
    throw new Error("A sermon ID is required.");
  }

  const rows = await restGet<Sermon[]>(
    `sermons?id=eq.${encodeURIComponent(id)}&is_published=eq.true&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  return restGet(
    "announcements?is_published=eq.true&order=priority.desc,created_at.desc&limit=5",
  );
}

export async function getNavLinks(): Promise<NavLink[]> {
  return restGet("nav_links?is_active=eq.true&order=display_order.asc");
}

export async function getSmallGroups(): Promise<SmallGroup[]> {
  return restGet("small_groups?is_active=eq.true&order=area.asc");
}

export async function getGroupAreas(): Promise<string[]> {
  const groups = await restGet<Array<{ area: string }>>(
    "small_groups?is_active=eq.true&select=area",
  );
  return Array.from(new Set(groups.map(({ area }) => area))).sort();
}

export async function getProjects(): Promise<ProjectRow[]> {
  return restGet<ProjectRow[]>(
    "projects?is_published=eq.true&order=display_order.asc",
  );
}

export async function getProjectBySlug(
  slug: string,
): Promise<(ProjectRow & { media: ProjectMediaRow[]; fields: ProjectFieldRow[] }) | null> {
  const projects = await restGet<ProjectRow[]>(
    `projects?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
  );
  if (projects.length === 0) return null;
  const project = projects[0];

  const [media, fields] = await Promise.all([
    restGet<ProjectMediaRow[]>(
      `project_media?project_id=eq.${encodeURIComponent(project.id)}&order=display_order.asc`,
    ),
    restGet<ProjectFieldRow[]>(
      `project_custom_fields?project_id=eq.${encodeURIComponent(project.id)}&order=display_order.asc`,
    ),
  ]);

  return { ...project, media: media || [], fields: fields || [] };
}
