'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div>
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">🤟</span>
            <span className="text-xl font-bold text-gray-900">EmirSign</span>
            <span className="text-xl font-bold text-primary-600">AI</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Check your email</h2>
          <p className="mb-6 text-sm text-gray-500">
            If an account exists for <strong className="text-gray-700">{email}</strong>, you will receive a password reset link shortly.
          </p>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white hover:bg-primary-700 transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-2xl">🤟</span>
          <span className="text-xl font-bold text-gray-900">EmirSign</span>
          <span className="text-xl font-bold text-primary-600">AI</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
