'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  translationsToday: number;
  activeConversations: number;
  accuracyRate: number;
  avgLatency: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

const fallbackStats = [
  { name: 'Translations Today', value: '0', change: 'Start translating!', icon: '🌐', color: 'from-emerald-500 to-teal-600' },
  { name: 'Active Conversations', value: '0', change: '0 total this week', icon: '💬', color: 'from-blue-500 to-indigo-600' },
  { name: 'Accuracy Rate', value: '0%', change: 'No data yet', icon: '🎯', color: 'from-amber-500 to-orange-600' },
  { name: 'Avg. Latency', value: '--ms', change: 'No data yet', icon: '⚡', color: 'from-rose-500 to-pink-600' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(fallbackStats);
  const [activity, setActivity] = useState<DashboardStats['recentActivity']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiGet<DashboardStats>('/dashboard/stats');
        setStats([
          { name: 'Translations Today', value: String(data.translationsToday), change: 'Today', icon: '🌐', color: 'from-emerald-500 to-teal-600' },
          { name: 'Active Conversations', value: String(data.activeConversations), change: 'Active now', icon: '💬', color: 'from-blue-500 to-indigo-600' },
          { name: 'Accuracy Rate', value: `${data.accuracyRate}%`, change: 'Model average', icon: '🎯', color: 'from-amber-500 to-orange-600' },
          { name: 'Avg. Latency', value: `${data.avgLatency}ms`, change: 'Inference time', icon: '⚡', color: 'from-rose-500 to-pink-600' },
        ]);
        setActivity(data.recentActivity || []);
      } catch {
        // Keep fallback stats
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s your translation activity overview.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-xl shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${stat.color} group-hover:w-full transition-all duration-500`} />
          </div>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid gap-3">
            <Link
              href="/translate"
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 p-4 hover:from-emerald-100 hover:to-green-100 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl shadow-sm">
                🤟
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Start Translation</p>
                <p className="text-sm text-gray-500">Real-time sign language translation</p>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/conversations"
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 hover:from-blue-100 hover:to-indigo-100 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-sm">
                💬
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">New Conversation</p>
                <p className="text-sm text-gray-500">Start a two-way conversation</p>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/history"
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4 hover:from-amber-100 hover:to-orange-100 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-2xl shadow-sm">
                📜
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">View History</p>
                <p className="text-sm text-gray-500">Browse past translations and sessions</p>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">View all</Link>
          </div>
          <div className="space-y-1">
            {loading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No recent activity</p>
            ) : (
              activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm">
                    {item.type === 'translation' ? '🤟' : item.type === 'conversation' ? '💬' : '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
