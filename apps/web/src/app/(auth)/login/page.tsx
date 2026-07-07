'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('demo@emirsign.ae');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      window.location.href = '/translate';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-2xl">🤟</span>
          <span className="text-xl font-bold text-gray-900">EmirSign</span>
          <span className="text-xl font-bold text-primary-600">AI</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs font-semibold text-blue-800 mb-2">Demo Accounts (click to fill)</p>
          <div className="space-y-1 text-xs text-blue-700">
            {[
              { email: 'demo@emirsign.ae', password: 'demo', label: 'Demo User' },
              { email: 'ahmed@emirsign.ae', password: 'ahmed123', label: 'Ahmed' },
              { email: 'admin@emirsign.ae', password: 'admin123', label: 'Admin' },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => { setEmail(account.email); setPassword(account.password); setError(''); }}
                className="block w-full text-left rounded-lg px-2 py-1 hover:bg-blue-100 transition-colors"
              >
                {account.label}: <span className="font-mono">{account.email}</span> / <span className="font-mono">{account.password}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
