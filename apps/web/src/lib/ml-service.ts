'use client';

import { apiPost, apiGet } from './api';
import type { GestureSample } from './dataset-types';

export interface GestureRecognitionResult {
  gestureId: string;
  name: string;
  arabicName: string;
  confidence: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence: number;
  alternatives?: string[];
}

export interface TtsResult {
  audioBase64: string;
  durationMs: number;
  format: string;
}

export interface AsrResult {
  transcript: string;
  confidence: number;
  language: string;
  alternatives?: { text: string; confidence: number }[];
}

export interface MlHealthStatus {
  vision: boolean;
  nlp: boolean;
  speech: boolean;
}

let cachedHealth: MlHealthStatus | null = null;
let healthCacheTime = 0;
const HEALTH_CACHE_TTL = 30000;

export async function recognizeGesture(landmarks: number[][], topK: number = 3): Promise<GestureRecognitionResult[]> {
  try {
    const result = await apiPost<GestureRecognitionResult[]>('/ml/gesture/recognize', {
      landmarks,
      topK,
    });
    return result;
  } catch (error) {
    console.error('Gesture recognition failed:', error);
    return [];
  }
}

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult | null> {
  try {
    const result = await apiPost<TranslationResult>('/ml/translate', {
      text,
      sourceLang,
      targetLang,
    });
    return result;
  } catch (error) {
    console.error('Translation failed:', error);
    return null;
  }
}

export async function synthesizeSpeech(text: string, locale: string, rate?: number): Promise<TtsResult | null> {
  try {
    const result = await apiPost<TtsResult>('/ml/tts/synthesize', {
      text,
      locale,
      rate,
    });
    return result;
  } catch (error) {
    console.error('TTS failed:', error);
    return null;
  }
}

export async function transcribeSpeech(audioBase64: string, locale: string): Promise<AsrResult | null> {
  try {
    const result = await apiPost<AsrResult>('/ml/asr/transcribe', {
      audioBase64,
      locale,
    });
    return result;
  } catch (error) {
    console.error('ASR failed:', error);
    return null;
  }
}

export async function getMlHealth(): Promise<MlHealthStatus> {
  if (cachedHealth && Date.now() - healthCacheTime < HEALTH_CACHE_TTL) {
    return cachedHealth;
  }

  try {
    const result = await apiGet<MlHealthStatus>('/ml/health');
    cachedHealth = result;
    healthCacheTime = Date.now();
    return result;
  } catch {
    return { vision: false, nlp: false, speech: false };
  }
}

export async function classifyGesture(landmarks: number[][]): Promise<any> {
  try {
    return await apiPost('/ml/gesture/classify', { landmarks });
  } catch (error) {
    console.error('Gesture classification failed:', error);
    return null;
  }
}
