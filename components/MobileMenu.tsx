// components/MobileMenu.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu({ links, churchName }: { links: any[], churchName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <div className="lg:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2 text-white">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      <div className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-white font-extrabold text-xl">{churchName}</span>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {links.map((l) => (
            <Link key={l.id} href={l.href} className="block px-4 py-4 rounded-xl text-lg font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link href="/give" className="flex justify-center items-center w-full px-6 py-4 rounded-xl bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 transition">
            Give Now
          </Link>
        </div>
      </div>
    </div>
  );
}