'use client';

import { useAuthStore } from '@/lib/auth';

export function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-gray-500">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-500">AI Ready</span>
        </div>
      </div>
    </header>
  );
}
