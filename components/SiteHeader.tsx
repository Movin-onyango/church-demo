import Link from "next/link";
import { getNavLinks, getSettings } from "@/lib/data";

export default async function SiteHeader() {
  const [links, settings] = await Promise.all([getNavLinks(), getSettings()]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          {settings.church_name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-amber-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
