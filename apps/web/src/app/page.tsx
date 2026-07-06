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
      router.push('/dashboard');
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
      {/* Nav */}
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
            href="/register"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 md:px-12 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            UAE's First AI Sign Language Platform
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
            Bridge the{' '}
            <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
              Communication Gap
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
            Enterprise AI platform that translates Emirati Sign Language into Arabic and English in real time.
            Making every conversation accessible.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:-translate-y-0.5"
            >
              Start Translating Free
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-white/50 py-12 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4 md:px-12">
          {[
            { value: '95%+', label: 'Accuracy Rate' },
            { value: '<300ms', label: 'Response Time' },
            { value: '50K+', label: 'Gestures Recognized' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything you need for seamless communication
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Powered by advanced AI to bridge the gap between Deaf and hearing communities across the UAE.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: '🤟',
                title: 'Sign Language Recognition',
                desc: 'Real-time recognition of Emirati Sign Language gestures using advanced computer vision AI.',
                color: 'from-emerald-500 to-primary-600',
              },
              {
                icon: '🌍',
                title: 'Bidirectional Translation',
                desc: 'Translate between ESL, Arabic, and English instantly with context-aware AI models.',
                color: 'from-blue-500 to-violet-600',
              },
              {
                icon: '🎤',
                title: 'Speech to Sign',
                desc: 'Convert spoken Arabic and English into animated sign language through our avatar engine.',
                color: 'from-amber-500 to-orange-600',
              },
              {
                icon: '⚡',
                title: 'Real-time Processing',
                desc: 'Sub-300ms latency for natural, flowing conversations without awkward pauses.',
                color: 'from-rose-500 to-pink-600',
              },
              {
                icon: '📱',
                title: 'Cross-Platform',
                desc: 'Works on mobile, web, kiosks, and smart devices. Online and offline modes available.',
                color: 'from-cyan-500 to-teal-600',
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                desc: 'AES-256 encryption, RBAC, audit logging, and full UAE PDPL compliance built in.',
                color: 'from-indigo-500 to-purple-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-2xl shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-emerald-600 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to make communication accessible?
          </h2>
          <p className="mb-8 text-lg text-primary-100">
            Join hundreds of organizations across the UAE using EmirSign AI.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-all hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🤟</span>
            <span>&copy; {new Date().getFullYear()} EmirSign AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
