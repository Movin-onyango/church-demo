insert into public.nav_links (label, href, display_order)
select 'Projects', '/projects', 5
where not exists (
  select 1
  from public.nav_links
  where href = '/projects'
);