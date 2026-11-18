// app/admin/layout.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/settings', label: 'Site Settings' },
  { href: '/admin/about', label: 'About Page' },
  { href: '/admin/services', label: 'Service Times' },
  { href: '/admin/visit', label: 'Visit Info' },
  { href: '/admin/sermons', label: 'Sermons' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/groups', label: 'Small Groups' },
  { href: '/admin/giving', label: 'Giving Impact' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/prayers', label: 'Prayer Requests' },
  { href: '/admin/nav', label: 'Nav Links' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [newPrayerCount, setNewPrayerCount] = useState<number | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Could not verify the admin session.', error);
        router.replace('/admin/login');
      } else if (!data.session) {
        router.replace('/admin/login');
      } else {
        setEmail(data.session.user.email ?? null);
        setReady(true);
      }
    }).catch(error => {
      if (!active) return;
      console.error('Could not verify the admin session.', error);
      router.replace('/admin/login');
    });

    return () => { active = false; };
  }, [pathname, router, supabase]);

  useEffect(() => {
    if (!ready) return;

    let active = true;
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('prayer_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');

      if (!active) return;
      if (error) {
        console.error('Could not load the new prayer request count.', error);
        setNewPrayerCount(null);
        return;
      }
      setNewPrayerCount(count ?? 0);
    };

    void fetchCount();
    const timer = window.setInterval(() => { void fetchCount(); }, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [ready, supabase]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-56 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Admin</p>
          <p className="text-sm font-medium truncate mt-1">{email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                pathname === n.href ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-slate-300 hover:bg-white/10'
              }`}>
              <span>{n.label}</span>
              {n.href === '/admin/prayers' && (newPrayerCount ?? 0) > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {newPrayerCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}