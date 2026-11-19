alter table public.sermons enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.project_custom_fields enable row level security;

grant select on table
  public.sermons,
  public.projects,
  public.project_media,
  public.project_custom_fields
to anon;

drop policy if exists public_read_published_sermons on public.sermons;
create policy public_read_published_sermons
  on public.sermons
  for select
  to anon
  using (is_published = true);

drop policy if exists public_read_published_projects on public.projects;
create policy public_read_published_projects
  on public.projects
  for select
  to anon
  using (is_published = true);

drop policy if exists public_read_published_project_media on public.project_media;
create policy public_read_published_project_media
  on public.project_media
  for select
  to anon
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_media.project_id
        and projects.is_published = true
    )
  );

drop policy if exists public_read_published_project_custom_fields on public.project_custom_fields;
create policy public_read_published_project_custom_fields
  on public.project_custom_fields
  for select
  to anon
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_custom_fields.project_id
        and projects.is_published = true
    )
  );
