grant usage on schema public to anon;
grant select on table
  public.site_settings,
  public.nav_links,
  public.service_times,
  public.visit_info,
  public.about_sections,
  public.giving_sections,
  public.sermons,
  public.announcements,
  public.small_groups,
  public.projects,
  public.project_media,
  public.project_custom_fields
to anon;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings"
  on public.site_settings
  for select
  to anon
  using (true);

drop policy if exists "public read nav" on public.nav_links;
create policy "public read nav"
  on public.nav_links
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read services" on public.service_times;
create policy "public read services"
  on public.service_times
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read visit" on public.visit_info;
create policy "public read visit"
  on public.visit_info
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read about" on public.about_sections;
create policy "public read about"
  on public.about_sections
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read giving" on public.giving_sections;
drop policy if exists "public read giving_sections" on public.giving_sections;
create policy "public read giving"
  on public.giving_sections
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read sermons" on public.sermons;
drop policy if exists public_read_published_sermons on public.sermons;
create policy "public read sermons"
  on public.sermons
  for select
  to anon
  using (is_published = true);

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements"
  on public.announcements
  for select
  to anon
  using (is_published = true);

drop policy if exists "public read groups" on public.small_groups;
create policy "public read groups"
  on public.small_groups
  for select
  to anon
  using (is_active = true);

drop policy if exists "public read projects" on public.projects;
drop policy if exists public_read_published_projects on public.projects;
create policy "public read projects"
  on public.projects
  for select
  to anon
  using (is_published = true);

drop policy if exists "public read project_media" on public.project_media;
drop policy if exists public_read_published_project_media on public.project_media;
create policy "public read project_media"
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

drop policy if exists "public read project_fields" on public.project_custom_fields;
drop policy if exists public_read_published_project_custom_fields on public.project_custom_fields;
create policy "public read project_fields"
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
