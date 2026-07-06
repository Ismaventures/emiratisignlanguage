'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ANIMATION_DATABASE, type AnimationEntry } from '@/lib/avatar/animation-database';

const AvatarScene = dynamic(
  () => import('@/components/avatar/avatar-scene').then((mod) => mod.AvatarScene),
  { ssr: false, loading: () => <div className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-950"><p className="text-white/60">Loading 3D engine...</p></div> },
);

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'greeting', label: 'Greetings', icon: '👋' },
  { id: 'common', label: 'Common', icon: '💬' },
  { id: 'question', label: 'Questions', icon: '❓' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'daily', label: 'Daily', icon: '📅' },
  { id: 'numbers', label: 'Numbers', icon: '🔢' },
  { id: 'emotion', label: 'Emotions', icon: '😊' },
] as const;

export default function AvatarLabPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGesture, setSelectedGesture] = useState<AnimationEntry | null>(null);
  const [currentToken, setCurrentToken] = useState('');
  const [animState, setAnimState] = useState('idle');
  const [animatorRef, setAnimatorRef] = useState<any>(null);

  const filteredAnimations = ANIMATION_DATABASE.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.arabicName.includes(searchQuery) ||
      a.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePlayGesture = (entry: AnimationEntry) => {
    setSelectedGesture(entry);
    if (animatorRef) {
      animatorRef.stop();
      animatorRef.setQueue([entry.name.toUpperCase()]);
      animatorRef.play();
    }
  };

  const handlePlayAll = () => {
    if (filteredAnimations.length > 0 && animatorRef) {
      setSelectedGesture(null);
      animatorRef.stop();
      animatorRef.setQueue(filteredAnimations.map((a) => a.name.toUpperCase()));
      animatorRef.play();
    }
  };

  const handleStop = () => {
    animatorRef?.stop();
    setCurrentToken('');
    setAnimState('idle');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avatar Lab</h1>
        <p className="text-sm text-gray-500">3D avatar gesture library — procedural animations, no GLB files needed</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-950"><p className="text-white/60">Loading 3D engine...</p></div>}>
            <AvatarScene
              height={500}
              onAnimationStateChange={(state, token) => { setAnimState(state); setCurrentToken(token); }}
              onAnimationReady={(a) => setAnimatorRef(a)}
            />
          </Suspense>

          {currentToken && animState === 'playing' && (
            <div className="mt-3 rounded-xl bg-gray-900 p-3 text-center">
              <p className="text-lg font-bold text-white">{currentToken}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button onClick={handlePlayAll} disabled={filteredAnimations.length === 0} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              ▶ Play All ({filteredAnimations.length})
            </button>
            <button onClick={handleStop} disabled={animState === 'idle'} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              ■ Stop
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gestures..."
              className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />

            <div className="mb-3 flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400">{filteredAnimations.length} gestures</p>
          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {filteredAnimations.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handlePlayGesture(entry)}
                  className={`flex w-full items-center gap-3 p-3 text-left transition-all hover:bg-gray-50 ${
                    selectedGesture?.id === entry.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-emerald-100 text-sm font-bold text-primary-700">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
                    <p className="text-xs text-gray-500 truncate">{entry.arabicName}</p>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Procedural
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
