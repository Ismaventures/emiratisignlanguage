'use client';

import React, { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { translateToSignLanguage, type TranslationResult, type SignToken } from '@/lib/avatar/text-to-sign';
import { useToast } from '@/components/ui/toast';

const AvatarViewer = dynamic(
  () => import('./avatar-viewer').then((mod) => mod.AvatarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[450px] items-center justify-center rounded-2xl bg-gray-950">
        <p className="text-white/60">Loading 3D avatar...</p>
      </div>
    ),
  },
);

interface TextToSignViewerProps {
  text?: string;
}

export function TextToSignViewer({ text = '' }: TextToSignViewerProps) {
  const [inputText, setInputText] = useState(text);
  const [activeText, setActiveText] = useState('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [useHuggingFace, setUseHuggingFace] = useState(true);
  const { addToast } = useToast();

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const result = await translateToSignLanguage(inputText, useHuggingFace);
      setTranslation(result);
      setActiveText(inputText);
      addToast(`Mapped ${result.tokens.length} signs`, 'success');
    } catch {
      addToast('Translation failed, using fallback', 'warning');
      const result = await translateToSignLanguage(inputText, false);
      setTranslation(result);
      setActiveText(inputText);
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, useHuggingFace, addToast]);

  const handleQuickPhrase = useCallback((phrase: string) => {
    setInputText(phrase);
  }, []);

  const fingerSpellCount = translation?.tokens.filter((t) => t.needsFingerspelling).length || 0;
  const directMatchCount = translation?.tokens.filter((t) => t.hasAnimation).length || 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Text to Sign Language</h3>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={useHuggingFace}
              onChange={(e) => setUseHuggingFace(e.target.checked)}
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
          {['Hello', 'Thank you', 'How are you', 'I need help', 'Good morning', 'Please'].map((phrase) => (
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

      <Suspense
        fallback={
          <div className="flex h-[450px] items-center justify-center rounded-2xl bg-gray-950">
            <p className="text-white/60">Loading 3D avatar...</p>
          </div>
        }
      >
        <AvatarViewer
          text={activeText}
          autoPlay={true}
          height={450}
          onTranslationComplete={setTranslation}
        />
      </Suspense>

      {translation && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Translation Pipeline</h4>

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
                <TokenBadge key={`${token.uppercase}-${i}`} token={token} index={i} />
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

function TokenBadge({ token, index }: { token: SignToken; index: number }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
        token.hasAnimation
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
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
  );
}
