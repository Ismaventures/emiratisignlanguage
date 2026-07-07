'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { translateToSignLanguage, type TranslationResult } from '@/lib/avatar/text-to-sign';
import { ESL_SIGNS } from '@/lib/avatar/esl-sign-database';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/avatar/rpm-avatar';

const GlbAvatarScene = dynamic(
  () => import('./glb-avatar-scene').then((mod) => mod.GlbAvatarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-white/60">Loading avatar...</p>
        </div>
      </div>
    ),
  },
);

interface GlbAvatarViewerProps {
  text?: string;
  avatarConfig?: AvatarConfig;
}

export function GlbAvatarViewer({ text = '', avatarConfig }: GlbAvatarViewerProps) {
  const [inputText, setInputText] = useState(text);
  const [signs, setSigns] = useState<string[]>([]);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [currentSign, setCurrentSign] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [avatarHeight, setAvatarHeight] = useState(500);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAvatarHeight(entry.contentRect.height);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const runTranslation = useCallback(async (txt: string) => {
    if (!txt.trim()) {
      setSigns([]);
      setTranslation(null);
      return;
    }
    setIsTranslating(true);
    try {
      const result = await translateToSignLanguage(txt, true);
      setTranslation(result);
      setSigns(result.tokens.map((t) => t.uppercase));
    } catch {
      const result = await translateToSignLanguage(txt, false);
      setTranslation(result);
      setSigns(result.tokens.map((t) => t.uppercase));
    } finally {
      setIsTranslating(false);
    }
  }, []);

  useEffect(() => {
    if (text) {
      setInputText(text);
      runTranslation(text);
    }
  }, [text, runTranslation]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runTranslation(val), 400);
  }, [runTranslation]);

  const handleTranslateClick = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runTranslation(inputText);
  }, [inputText, runTranslation]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const config = avatarConfig || DEFAULT_AVATAR;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Avatar */}
      <div ref={containerRef} className="relative flex-1 min-h-[300px]">
        <GlbAvatarScene
          avatarConfig={config}
          signs={signs}
          autoPlay={true}
          height={avatarHeight}
          onAnimationStateChange={(state: string, token: string) => {
            setCurrentSign(state === 'playing' ? token : '');
          }}
        />
      </div>

      {/* Current sign info */}
      {currentSign && ESL_SIGNS[currentSign] && (
        <div className="rounded-xl bg-primary-50 border border-primary-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            <p className="text-sm font-semibold text-primary-700">Signing: {currentSign}</p>
          </div>
          <p className="text-sm text-primary-600">{ESL_SIGNS[currentSign].english}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-primary-500">
            <span>Handshape: {ESL_SIGNS[currentSign].handshape}</span>
            <span>Movement: {ESL_SIGNS[currentSign].movement}</span>
            {ESL_SIGNS[currentSign].nonManual && (
              <span>Expression: {ESL_SIGNS[currentSign].nonManual}</span>
            )}
          </div>
        </div>
      )}

      {/* Token badges */}
      {translation && translation.tokens.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {translation.tokens.map((token, i) => (
            <div
              key={`${token.uppercase}-${i}`}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                token.hasAnimation
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <span>{token.uppercase}</span>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleTranslateClick()}
            placeholder="Type English text..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
          <button
            onClick={handleTranslateClick}
            disabled={isTranslating || !inputText.trim()}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isTranslating ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing
              </span>
            ) : (
              'Translate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
