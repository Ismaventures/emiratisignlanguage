'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

interface AnalyticsMetrics {
  totalTranslations: number;
  activeUsers: number;
  avgAccuracy: number;
  avgLatency: number;
  errorRate: number;
  apiCalls: number;
  dailyData: Array<{ day: string; value: number }>;
  languageBreakdown: Array<{ lang: string; count: number }>;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState([
    { label: 'Total Translations', value: '0', change: '+0%', up: true },
    { label: 'Active Users', value: '0', change: '+0%', up: true },
    { label: 'Avg. Accuracy', value: '0%', change: '+0%', up: true },
    { label: 'Avg. Latency', value: '0ms', change: '-0%', up: true },
    { label: 'Error Rate', value: '0%', change: '-0%', up: true },
    { label: 'API Calls', value: '0', change: '+0%', up: true },
  ]);
  const [dailyData, setDailyData] = useState<{ day: string; value: number }[]>([]);
  const [languages, setLanguages] = useState<{ lang: string; pct: number; count: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiGet<AnalyticsMetrics>('/admin/analytics');
        const totalLangs = data.languageBreakdown.reduce((sum, l) => sum + l.count, 0) || 1;

        setMetrics([
          { label: 'Total Translations', value: data.totalTranslations.toLocaleString(), change: '+23%', up: true },
          { label: 'Active Users', value: data.activeUsers.toLocaleString(), change: '+12%', up: true },
          { label: 'Avg. Accuracy', value: `${data.avgAccuracy}%`, change: '+1.3%', up: true },
          { label: 'Avg. Latency', value: `${data.avgLatency}ms`, change: '-12%', up: true },
          { label: 'Error Rate', value: `${data.errorRate}%`, change: '-0.3%', up: true },
          { label: 'API Calls', value: `${(data.apiCalls / 1000).toFixed(1)}K`, change: '+18%', up: true },
        ]);

        setDailyData(data.dailyData || []);

        setLanguages(
          (data.languageBreakdown || []).map((l) => ({
            lang: l.lang,
            pct: Math.round((l.count / totalLangs) * 100),
            count: l.count.toLocaleString(),
          })),
        );
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxVal = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.value)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Platform usage and performance metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : m.value}</p>
              <span className={`text-sm font-medium ${m.up ? (m.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600') : ''}`}>
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold text-gray-900">Daily Translations</h3>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : dailyData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No data available</p>
        ) : (
          <div className="flex items-end gap-3" style={{ height: 160 }}>
            {dailyData.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-primary-500 to-emerald-400 transition-all hover:from-primary-600 hover:to-emerald-500"
                  style={{ height: `${(d.value / maxVal) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Languages */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Translation Languages</h3>
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : languages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data available</p>
          ) : (
            languages.map((item) => (
              <div key={item.lang}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-gray-700">{item.lang}</span>
                  <span className="text-gray-500">{item.count} translations</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-400"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
