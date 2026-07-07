'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DEFAULT_AVATARS, type AvatarConfig } from '@/lib/avatar/rpm-avatar';
import { ESL_SIGNS, getAllESLGlosses } from '@/lib/avatar/esl-sign-database';

const GlbAvatarScene = dynamic(
  () => import('@/components/avatar/glb-avatar-scene').then((mod) => mod.GlbAvatarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-950">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-white/60">Loading avatar...</p>
        </div>
      </div>
    ),
  },
);

const TEST_PHRASES = [
  'Hello',
  'Thank you',
  'How are you',
  'I need help',
  'Good morning',
  'Please',
  'Yes',
  'No',
  'Goodbye',
  'I love you',
  'What is your name',
  'Where is the school',
  'My friend',
  'Water please',
  'Sorry',
];

// ESL signs available in the database
const ESL_SIGN_LIST = Object.keys(ESL_SIGNS);

export default function AvatarLabPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(DEFAULT_AVATARS[0]);
  const [signs, setSigns] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [currentSign, setCurrentSign] = useState<string>('');
  const [avatarInfo, setAvatarInfo] = useState<{
    boneCount: number;
    hasMorphTargets: boolean;
    clipNames: string[];
  } | null>(null);

  const handleTestSign = (word: string) => {
    setSigns([word.toUpperCase()]);
  };

  const handleTestPhrase = () => {
    if (!customText.trim()) return;
    const tokens = customText
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    setSigns(tokens);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avatar Lab</h1>
        <p className="text-sm text-gray-500">Realistic 3D sign language avatar with full body rigging</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-4">
          {/* Avatar Selection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Select Avatar</h3>
            <div className="space-y-2">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    selectedAvatar.id === av.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: av.skinTone }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{av.label}</p>
                      <p className="text-xs text-gray-500">{av.gender} avatar</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {avatarInfo && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Avatar Info</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {avatarInfo.boneCount} bones
                  </span>
                  {avatarInfo.hasMorphTargets && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      Face rig
                    </span>
                  )}
                  {avatarInfo.clipNames.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                      {avatarInfo.clipNames.length} animations
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Test */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Test</h3>
            <div className="flex flex-wrap gap-1.5">
              {TEST_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handleTestSign(phrase)}
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Custom Sign</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestPhrase()}
                placeholder="Type words..."
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
              <button
                onClick={handleTestPhrase}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Sign
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">About This Avatar</h3>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                Ready Player Me realistic human model
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                Fully rigged with individual finger bones
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                52 ARKit blendshapes for facial expressions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                Animics IK solver + blendshape manager
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                ESL sign database with BML notation
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                Mixamo-compatible skeleton for animation
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                Custom Emirati clothing coming soon
              </li>
            </ul>
          </div>

          {/* ESL Sign Reference */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">ESL Signs ({ESL_SIGN_LIST.length})</h3>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {ESL_SIGN_LIST.map((gloss) => (
                <button
                  key={gloss}
                  onClick={() => handleTestSign(gloss)}
                  className="rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all"
                  title={ESL_SIGNS[gloss].english}
                >
                  {gloss}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar Viewport */}
        <div className="lg:col-span-2">
          <GlbAvatarScene
            avatarConfig={selectedAvatar}
            signs={signs}
            autoPlay={true}
            height={600}
            onAvatarLoaded={(info) => setAvatarInfo(info)}
            onAnimationStateChange={(state, token) => {
              setCurrentSign(state === 'playing' ? token : '');
            }}
          />

          {/* Current Sign Info */}
          {currentSign && ESL_SIGNS[currentSign] && (
            <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
                <h4 className="text-sm font-bold text-primary-800">Signing: {currentSign}</h4>
              </div>
              <p className="text-xs text-primary-600 mb-2">{ESL_SIGNS[currentSign].english}</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">
                  Handshape: {ESL_SIGNS[currentSign].handshape}
                </span>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">
                  Movement: {ESL_SIGNS[currentSign].movement}
                </span>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">
                  Location: {ESL_SIGNS[currentSign].location}
                </span>
                {ESL_SIGNS[currentSign].nonManual && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                    Expression: {ESL_SIGNS[currentSign].nonManual}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
