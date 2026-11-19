
import Link from "next/link";
import {
  getNavLinks,
  getSettings,
  type NavLink,
} from "@/lib/data";
import MobileMenu from "./MobileMenu";

export default async function SiteHeader() {
  // Fetch navigation links and church settings simultaneously.
  const [links, settings] = await Promise.all([
    getNavLinks(),
    getSettings(),
  ]);

  // Church name with a fallback.
  const churchName = settings?.church_name || "Grace Church";

  // Use database navigation links when available.
  // Otherwise, display the default navigation links.
  const safeLinks: NavLink[] =
    links && links.length > 0
      ? links
      : [
          { id: "home", label: "Home", href: "/" },
          { id: "visit", label: "Visit", href: "/visit" },
          { id: "sermons", label: "Sermons", href: "/sermons" },
          { id: "projects", label: "Projects", href: "/projects" },
          { id: "give", label: "Give", href: "/give" },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">

        {/* Church Logo / Name */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white"
        >
          {churchName}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {safeLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-4">

          {/* Give Now Button */}
          <Link
            href="/give"
            className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:scale-105 hover:bg-amber-400 sm:inline-flex"
          >
            Give Now
          </Link>

          {/* Mobile Navigation */}
          <MobileMenu
            links={safeLinks}
            churchName={churchName}
          />

        </div>
      </div>
    </header>
  );
}
