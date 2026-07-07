'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { translateToSignLanguage, type TranslationResult, type SignToken } from '@/lib/avatar/text-to-sign';
import { ESL_SIGNS } from '@/lib/avatar/esl-sign-database';
import { useToast } from '@/components/ui/toast';
import {
  DEFAULT_AVATARS,
  type AvatarConfig,
} from '@/lib/avatar/rpm-avatar';

const GlbAvatarScene = dynamic(
  () => import('./glb-avatar-scene').then((mod) => mod.GlbAvatarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-950">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-white/60">Loading realistic avatar...</p>
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
  const [activeText, setActiveText] = useState('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [signs, setSigns] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(avatarConfig || DEFAULT_AVATARS[0]);
  const [avatarInfo, setAvatarInfo] = useState<{ boneCount: number; hasMorphTargets: boolean; clipNames: string[] } | null>(null);
  const [currentSign, setCurrentSign] = useState<string>('');
  const { addToast } = useToast();

  useEffect(() => {
    if (text && text !== inputText) {
      setInputText(text);
      runTranslation(text);
    }
  }, [text]);

  const runTranslation = useCallback(async (txt: string) => {
    if (!txt.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateToSignLanguage(txt, true);
      setTranslation(result);
      setActiveText(txt);
      setSigns(result.tokens.map((t) => t.uppercase));
      addToast(`Signing ${result.tokens.length} tokens`, 'success');
    } catch {
      const result = await translateToSignLanguage(txt, false);
      setTranslation(result);
      setActiveText(txt);
      setSigns(result.tokens.map((t) => t.uppercase));
    } finally {
      setIsTranslating(false);
    }
  }, [addToast]);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    await runTranslation(inputText);
  }, [inputText, runTranslation]);

  const handleQuickPhrase = useCallback((phrase: string) => {
    setInputText(phrase);
    runTranslation(phrase);
  }, [runTranslation]);

  const fingerSpellCount = translation?.tokens.filter((t) => t.needsFingerspelling).length || 0;
  const directMatchCount = translation?.tokens.filter((t) => t.hasAnimation).length || 0;

  return (
    <div className="space-y-4">
      {/* Avatar Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Realistic Avatar</h3>
          <div className="flex items-center gap-2">
            {avatarInfo && (
              <span className="text-[10px] text-gray-400">
                {avatarInfo.boneCount} bones {avatarInfo.hasMorphTargets ? '+ face rig' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {DEFAULT_AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => setSelectedAvatar(av)}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                selectedAvatar.id === av.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {av.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Text to Sign Language</h3>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            AI Translation
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
            placeholder="Type English text to translate..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Hello', 'Thank you', 'How are you', 'I need help', 'Good morning', 'Please', 'Yes', 'No', 'Goodbye'].map((phrase) => (
            <button
              key={phrase}
              onClick={() => handleQuickPhrase(phrase)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Avatar */}
      <GlbAvatarScene
        avatarConfig={selectedAvatar}
        signs={signs}
        autoPlay={true}
        height={500}
        onAnimationStateChange={(state, token) => {
          setCurrentSign(state === 'playing' ? token : '');
        }}
        onAvatarLoaded={(info) => {
          setAvatarInfo(info);
        }}
      />

      {/* Translation Pipeline */}
      {translation && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Translation Pipeline</h4>

          {/* Current Sign Info */}
          {currentSign && ESL_SIGNS[currentSign] && (
            <div className="mb-3 rounded-xl bg-primary-50 p-3 border border-primary-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-xs font-semibold text-primary-700">Signing: {currentSign}</p>
              </div>
              <p className="text-xs text-primary-600">{ESL_SIGNS[currentSign].english}</p>
              <div className="mt-1 flex gap-2 text-[10px] text-primary-500">
                <span>Handshape: {ESL_SIGNS[currentSign].handshape}</span>
                <span>|</span>
                <span>Movement: {ESL_SIGNS[currentSign].movement}</span>
                {ESL_SIGNS[currentSign].nonManual && (
                  <>
                    <span>|</span>
                    <span>Expression: {ESL_SIGNS[currentSign].nonManual}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mb-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Original</p>
            <p className="text-sm text-gray-900">{translation.originalText}</p>
          </div>

          <div className="mb-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Normalized</p>
            <p className="text-sm text-gray-700">{translation.normalizedText}</p>
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Sign Tokens ({translation.tokens.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {translation.tokens.map((token, i) => (
                <div
                  key={`${token.uppercase}-${i}`}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    token.hasAnimation
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span>{token.uppercase}</span>
                  {token.hasAnimation ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {directMatchCount} direct matches
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              {fingerSpellCount} fingerspelled
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
