'use client';

import { useState, useCallback } from 'react';
import { ProCamera, type DetectedGesture } from '@/components/camera/pro-camera';
import { GESTURE_DATASET, GESTURE_CATEGORIES } from '@/lib/gesture-data';
import { useToast } from '@/components/ui/toast';
import { useTextToSpeech } from '@/lib/use-text-to-speech';

export default function GestureLabPage() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentGesture, setCurrentGesture] = useState<DetectedGesture | null>(null);
  const [confidenceHistory, setConfidenceHistory] = useState<{ name: string; confidence: number }[]>([]);
  const [recentGestures, setRecentGestures] = useState<DetectedGesture[]>([]);
  const { addToast } = useToast();
  const { speak } = useTextToSpeech();

  const filteredGestures = categoryFilter === 'all'
    ? GESTURE_DATASET
    : GESTURE_DATASET.filter((g) => g.category === categoryFilter);

  const handleGesture = useCallback(
    (gesture: DetectedGesture | null) => {
      setCurrentGesture(gesture);
      if (gesture) {
        setConfidenceHistory((prev) => [
          ...prev.slice(-19),
          { name: gesture.name, confidence: gesture.confidence },
        ]);
        setRecentGestures((prev) => {
          const exists = prev.find((g) => g.name === gesture.name);
          return exists
            ? prev.map((g) =>
                g.name === gesture.name ? { ...g, confidence: gesture.confidence } : g,
              )
            : [gesture, ...prev].slice(0, 10);
        });
      }
    },
    [],
  );

  const speakGesture = (name: string, arabic: string) => {
    speak(`${name} — ${arabic}`, 'en-US');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gesture Lab</h1>
          <p className="text-sm text-gray-500">
            Test real-time gesture recognition against the EmirSign dataset
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {GESTURE_DATASET.length} gestures in dataset
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Camera */}
        <div className="lg:col-span-3 space-y-4">
          <ProCamera onGesture={handleGesture} />

          {/* Live confidence feed */}
          {confidenceHistory.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Live Confidence</h3>
              <div className="space-y-1.5">
                {confidenceHistory.slice(-8).reverse().map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-gray-600 truncate">{g.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${g.confidence * 100}%`,
                          backgroundColor:
                            g.confidence > 0.7 ? '#22c55e' : g.confidence > 0.4 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-mono text-gray-400">
                      {(g.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dataset panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category filter */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="font-semibold text-gray-900 text-sm">Gesture Dataset</h3>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {GESTURE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {filteredGestures.map((gesture) => {
                  const isActive = currentGesture?.name === gesture.name;
                  const matchConfidence = currentGesture?.name === gesture.name
                    ? currentGesture.confidence
                    : null;

                  return (
                    <button
                      key={gesture.id}
                      onClick={() => speakGesture(gesture.name, gesture.arabicName)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {gesture.category === 'greeting' ? '👋' :
                         gesture.category === 'question' ? '❓' :
                         gesture.category === 'emotion' ? '💚' :
                         gesture.category === 'emergency' ? '🚨' : '📅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{gesture.name}</p>
                        <p className="text-xs text-gray-400 truncate">{gesture.arabicName} — {gesture.description.slice(0, 50)}...</p>
                      </div>
                      {matchConfidence && (
                        <span className="text-xs font-mono text-primary-600">
                          {(matchConfidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently matched */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="font-semibold text-gray-900 text-sm">Recently Matched</h3>
            </div>
            <div className="p-3">
              {recentGestures.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No gestures matched yet. Point a gesture at the camera.
                </p>
              ) : (
                <div className="space-y-1">
                  {recentGestures.map((g, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{g.name}</span>
                        <span className="text-xs text-gray-400">{g.arabicName}</span>
                      </div>
                      <span className={`text-xs font-mono ${
                        g.confidence > 0.7 ? 'text-green-600' : g.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(g.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
