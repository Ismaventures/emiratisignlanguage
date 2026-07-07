'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/translate');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-primary-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary-50">
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤟</span>
          <span className="text-xl font-bold text-gray-900">EmirSign</span>
          <span className="text-xl font-bold text-primary-600">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="px-6 pt-20 pb-24 md:px-12 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            Text to Sign Language Translator
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
            English to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
              Emirati Sign Language
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
            Type any English sentence and watch a 3D avatar perform Emirati Sign Language in real time.
            Powered by AI translation and realistic 3D animation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:-translate-y-0.5"
            >
              Start Translating Free
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white/50 py-12 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-3 md:px-12">
          {[
            { value: '26+', label: 'ESL Signs' },
            { value: '3D', label: 'Avatar Animation' },
            { value: '<1s', label: 'Translation Speed' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: '✏️', title: 'Type English', desc: 'Enter any English sentence or phrase.' },
              { icon: '🤖', title: 'AI Translates', desc: 'Qwen3-8B converts it to ESL sign tokens.' },
              { icon: '🤟', title: 'Avatar Signs', desc: 'A 3D character performs the sign language.' },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                  {step.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🤟</span>
            <span>&copy; {new Date().getFullYear()} EmirSign AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
