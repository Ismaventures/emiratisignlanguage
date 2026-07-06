'use client';

import { useState } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  translations: number;
  joined: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Ahmed Al Maktoum', email: 'ahmed@emirsign.ai', role: 'Admin', status: 'Active', translations: 342, joined: 'Jan 2025' },
  { id: '2', name: 'Fatima Hassan', email: 'fatima@example.com', role: 'User', status: 'Active', translations: 156, joined: 'Feb 2025' },
  { id: '3', name: 'Mohammed Al Zaabi', email: 'mohammed@example.com', role: 'Interpreter', status: 'Active', translations: 890, joined: 'Mar 2025' },
  { id: '4', name: 'Noora Al Ketbi', email: 'noora@example.com', role: 'User', status: 'Active', translations: 45, joined: 'Apr 2025' },
  { id: '5', name: 'Khalid Al Shamsi', email: 'khalid@example.com', role: 'User', status: 'Inactive', translations: 12, joined: 'May 2025' },
];

export default function AdminUsersPage() {
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage platform users and roles</p>
        </div>
        <button className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
          + Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Users', value: '1,247', change: '+12 this month', icon: '👥', color: 'from-blue-500 to-indigo-600' },
          { label: 'Active Today', value: '89', change: '7.1% of total', icon: '✅', color: 'from-emerald-500 to-teal-600' },
          { label: 'Interpreters', value: '24', change: '1.9% of total', icon: '🤝', color: 'from-amber-500 to-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-lg shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Translations</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 text-sm font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Interpreter' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{user.translations.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-500">{user.joined}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
