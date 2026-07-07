'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/translate', label: 'Translator', icon: '🤟' },
  { href: '/avatar-lab', label: 'Avatar Lab', icon: '🦸' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink = (href: string, label: string, icon: string) => {
    const active = pathname === href || (href !== '/translate' && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          active
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="w-5 text-center text-base">{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg lg:hidden"
      >
        <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-950 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-primary-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
            E
          </div>
          <div>
            <p className="text-base font-bold text-white">EmirSign</p>
            <p className="text-[10px] font-medium text-emerald-400 tracking-widest uppercase">Translator</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {NAV_ITEMS.map((item) => navLink(item.href, item.label, item.icon))}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
