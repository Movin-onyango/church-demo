insert into public.site_settings (key, value) values
  ('live_stream_url', ''),
  ('live_stream_enabled', 'false')
on conflict (key) do nothing;

update public.site_settings
set value = '/watch'
where key = 'hero_secondary_cta_link'
  and value = '/sermons';

insert into public.nav_links (label, href, display_order)
select 'Watch', '/watch', 3
where not exists (
  select 1
  from public.nav_links
  where href = '/watch'
);
