'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { translateToSignLanguage, type TranslationResult } from '@/lib/avatar/text-to-sign';
import { ESL_SIGNS } from '@/lib/avatar/esl-sign-database';
import { DEFAULT_AVATAR } from '@/lib/avatar/rpm-avatar';
import { useToast } from '@/components/ui/toast';

const GlbAvatarScene = dynamic(
  () => import('@/components/avatar/glb-avatar-scene').then((mod) => mod.GlbAvatarScene),
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

export default function TranslatePage() {
  const [inputText, setInputText] = useState('');
  const [signs, setSigns] = useState<string[]>([]);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [currentSign, setCurrentSign] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [avatarHeight, setAvatarHeight] = useState(500);
  const { addToast } = useToast();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setAvatarHeight(entry.contentRect.height);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const runTranslation = useCallback(async (txt: string) => {
    if (!txt.trim()) { setSigns([]); setTranslation(null); return; }
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

  const handleQuickPhrase = useCallback((phrase: string) => {
    setInputText(phrase);
    runTranslation(phrase);
  }, [runTranslation]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const config = DEFAULT_AVATAR;
  const fingerSpellCount = translation?.tokens.filter((t) => t.needsFingerspelling).length || 0;
  const directMatchCount = translation?.tokens.filter((t) => t.hasAnimation).length || 0;

  return (
    <div className="flex h-screen gap-4 p-4">
      {/* Left: Big Avatar */}
      <div ref={containerRef} className="flex-1 min-w-0 relative">
        <div className="absolute inset-0">
          <GlbAvatarScene
            avatarConfig={config}
            signs={signs}
            autoPlay={true}
            width="100%"
            height={avatarHeight}
            onAnimationStateChange={(state: string, token: string) => {
              setCurrentSign(state === 'playing' ? token : '');
            }}
          />
        </div>
      </div>

      {/* Right: Text Input + Phrases */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Text to Sign</h1>
          <p className="text-xs text-gray-500">Type English → Avatar signs in ESL</p>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslateClick()}
              placeholder="Type English text..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
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
              ) : 'Translate'}
            </button>
          </div>
        </div>

        {/* Current Sign Info */}
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
              {ESL_SIGNS[currentSign].nonManual && <span>Expression: {ESL_SIGNS[currentSign].nonManual}</span>}
            </div>
          </div>
        )}

        {/* Token badges */}
        {translation && translation.tokens.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Sign Tokens ({translation.tokens.length})</h3>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />{directMatchCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />{fingerSpellCount}
                </span>
              </div>
            </div>
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
                  {token.uppercase}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Phrases */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Phrases</h3>
          <div className="flex flex-wrap gap-1.5">
            {['Hello', 'Thank you', 'Yes', 'No', 'Help', 'Goodbye', 'Please', 'How are you', 'I need help', 'Good morning'].map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleQuickPhrase(phrase)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}