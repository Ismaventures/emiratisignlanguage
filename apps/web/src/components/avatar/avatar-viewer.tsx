'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { translateToSignLanguage, type TranslationResult } from '@/lib/avatar/text-to-sign';
import { useToast } from '@/components/ui/toast';

const AvatarScene = dynamic(
  () => import('./avatar-scene').then((mod) => mod.AvatarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-950">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-white/60">Loading 3D engine...</p>
        </div>
      </div>
    ),
  },
);

interface AvatarViewerProps {
  text?: string;
  autoPlay?: boolean;
  width?: string | number;
  height?: number;
  showControls?: boolean;
  onStateChange?: (state: string, token: string) => void;
  onTranslationComplete?: (result: TranslationResult) => void;
  onQueueComplete?: () => void;
}

export function AvatarViewer({
  text = '',
  autoPlay = true,
  width = '100%',
  height = 500,
  showControls = true,
  onStateChange,
  onTranslationComplete,
  onQueueComplete,
}: AvatarViewerProps) {
  const [animationState, setAnimationState] = useState<string>('idle');
  const [currentToken, setCurrentToken] = useState('');
  const [progress, setProgress] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const animatorRef = useRef<any>(null);
  const { addToast } = useToast();

  const handleStateChange = useCallback(
    (state: string, token: string) => {
      setAnimationState(state);
      setCurrentToken(token);
      if (animatorRef.current) {
        setProgress(animatorRef.current.getProgress());
      }
      onStateChange?.(state, token);
    },
    [onStateChange],
  );

  const handleQueueComplete = useCallback(() => {
    setProgress(1);
    setAnimationState('idle');
    setCurrentToken('');
    onQueueComplete?.();
  }, [onQueueComplete]);

  const handleAnimationReady = useCallback(
    (animator: any) => {
      animatorRef.current = animator;
    },
    [],
  );

  useEffect(() => {
    if (!text || !animatorRef.current) return;

    let cancelled = false;

    const run = async () => {
      const animator = animatorRef.current;
      if (!animator) return;

      animator.stop();
      setProgress(0);
      setAnimationState('idle');

      const result = await translateToSignLanguage(text, true);
      if (cancelled) return;

      setTranslation(result);
      onTranslationComplete?.(result);

      const signs = result.tokens.map((t) => t.uppercase);
      animator.setQueue(signs);
      setQueueLength(signs.length);

      if (autoPlay && signs.length > 0) {
        animator.play();
      }
    };

    run();

    return () => { cancelled = true; };
  }, [text, autoPlay, onTranslationComplete]);

  const handlePlay = useCallback(() => {
    animatorRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    const a = animatorRef.current;
    if (!a) return;
    if (a.getState() === 'paused') a.resume();
    else a.pause();
  }, []);

  const handleStop = useCallback(() => {
    animatorRef.current?.stop();
    setProgress(0);
    setCurrentToken('');
    setAnimationState('idle');
  }, []);

  const handleSkip = useCallback(() => {
    const a = animatorRef.current;
    if (!a) return;
    a.stop();
    const queue = a.queue || [];
    const nextIdx = (a.currentIndex || 0) + 1;
    if (nextIdx < queue.length) {
      a.setQueue(queue.slice(nextIdx));
      a.play();
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        <AvatarScene
          width={width}
          height={height}
          showControls={showControls}
          onAnimationStateChange={handleStateChange}
          onQueueComplete={handleQueueComplete}
          onAnimationReady={handleAnimationReady}
        />

        {animationState !== 'idle' && currentToken && (
          <div className="absolute left-4 top-4">
            <div className="rounded-xl bg-black/60 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm font-medium text-white">{currentToken}</p>
              <p className="text-xs text-white/60">
                {animationState === 'playing' ? 'Signing...' : 'Paused'}
              </p>
            </div>
          </div>
        )}

        {queueLength > 0 && (
          <div className="absolute right-4 top-4">
            <div className="rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-xs text-white/80">
                {Math.round(progress * queueLength)}/{queueLength} signs
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <button onClick={handleStop} disabled={animationState === 'idle'} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={2} /></svg>
          </button>
          <button onClick={handlePlay} disabled={animationState === 'playing' || queueLength === 0} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={handlePause} disabled={animationState !== 'playing' && animationState !== 'paused'} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={handleSkip} disabled={animationState === 'idle' || queueLength === 0} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
