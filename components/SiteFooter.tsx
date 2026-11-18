// components/SiteFooter.tsx
import Link from 'next/link';
import { getSettings, getNavLinks } from '@/lib/data';

export default async function SiteFooter() {
  const [settings, nav] = await Promise.all([getSettings(), getNavLinks()]);

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg">{settings.church_name}</h3>
            <p className="text-sm mt-2 text-slate-400">{settings.church_tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2">
              {nav.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="text-sm hover:text-amber-400 transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Visit Us</h4>
            <address className="not-italic text-sm space-y-1">
              <p>{settings.contact_address}</p>
              {settings.contact_phone && <p>{settings.contact_phone}</p>}
              {settings.contact_email && (
                <p><a href={`mailto:${settings.contact_email}`} className="hover:text-amber-400">{settings.contact_email}</a></p>
              )}
            </address>
          </div>

          {/* Give */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Give</h4>
            <p className="text-sm text-slate-400">Support the ministry via M-Pesa.</p>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-400">Paybill</p>
              <p className="text-white font-mono text-lg">{settings.mpesa_paybill || '—'}</p>
              <p className="text-xs text-slate-400 mt-1">Account: {settings.mpesa_account_prefix || 'CHURCH'}</p>
            </div>
            <Link href="/give" className="inline-block mt-3 text-sm font-semibold text-amber-400 hover:underline">
              Give Now →
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.church_name}. All rights reserved.</p>
          <p>Built for the glory of God.</p>
        </div>
      </div>
    </footer>
  );
}