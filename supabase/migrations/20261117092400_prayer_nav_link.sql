insert into public.nav_links (label, href, display_order)
select 'Prayer', '/prayer', 6
where not exists (
  select 1
  from public.nav_links
  where href = '/prayer'
);
