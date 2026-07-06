'use client';

import type { GestureDataset, GestureSample, DatasetImportResult } from './dataset-types';

export interface WLASLEntry {
  gloss: string;
  instances: {
    video_id: string;
    url: string;
    start: number;
    end: number;
    signer_id: number;
    split: string;
    landmarks?: number[][];
  }[];
}

export interface ArSLEntry {
  sign: string;
  arabic: string;
  category: string;
  description: string;
  landmarks: number[][];
}

export function convertWLASLToDataset(
  entries: WLASLEntry[],
  language: string = 'Emirati Sign Language',
): GestureDataset {
  const gestures: GestureSample[] = entries.map((entry, idx) => ({
    id: `wlasl-${idx}`,
    name: entry.gloss,
    arabicName: entry.gloss,
    description: `WLASL gloss: ${entry.gloss}. ${entry.instances.length} instance(s).`,
    category: determineCategory(entry.gloss),
    landmarks: entry.instances[0]?.landmarks ?? generateSimulatedLandmarks(entry.gloss),
    source: 'WLASL',
    contributor: `signer_${entry.instances[0]?.signer_id ?? 0}`,
    tags: ['wlasl', language.toLowerCase().replace(/\s+/g, '-')],
  }));

  return {
    id: `dataset-wlasl-${Date.now()}`,
    name: `WLASL - ${language}`,
    description: `Converted from WLASL dataset (${entries.length} glosses)`,
    version: '1.0.0',
    source: 'WLASL',
    language,
    sampleCount: gestures.length,
    categoryCount: new Set(gestures.map((g) => g.category)).size,
    categories: [...new Set(gestures.map((g) => g.category))],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['wlasl', 'converted', language.toLowerCase().replace(/\s+/g, '-')],
    gestures,
    trainingStatus: 'untrained',
  };
}

export function convertArSLToDataset(entries: ArSLEntry[]): GestureDataset {
  const gestures: GestureSample[] = entries.map((entry, idx) => ({
    id: `arsl-${idx}`,
    name: entry.sign,
    arabicName: entry.arabic,
    description: entry.description,
    category: (entry.category as GestureSample['category']) || 'custom',
    landmarks: entry.landmarks.length > 0
      ? entry.landmarks
      : generateSimulatedLandmarks(entry.sign),
    source: 'ArSL',
    tags: ['arsl', 'arabic-sign-language'],
  }));

  return {
    id: `dataset-arsl-${Date.now()}`,
    name: 'ArSL - Arabic Sign Language',
    description: `Converted from ArSL dataset (${entries.length} signs)`,
    version: '1.0.0',
    source: 'ArSL',
    language: 'Arabic Sign Language',
    sampleCount: gestures.length,
    categoryCount: new Set(gestures.map((g) => g.category)).size,
    categories: [...new Set(gestures.map((g) => g.category))],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['arsl', 'arabic-sign-language', 'converted'],
    gestures,
    trainingStatus: 'untrained',
  };
}

function determineCategory(name: string): GestureSample['category'] {
  const lower = name.toLowerCase();
  if (['hello', 'hi', 'good morning', 'good evening', 'goodbye', 'bye', 'nice to meet', 'thank', 'welcome', 'sorry', 'please'].some((w) => lower.includes(w))) return 'greeting';
  if (['what', 'where', 'when', 'why', 'how', 'who', 'which', 'question'].some((w) => lower.includes(w))) return 'question';
  if (['love', 'happy', 'sad', 'angry', 'emotion', 'feel', 'like', 'hate', 'scared', 'surprise'].some((w) => lower.includes(w))) return 'emotion';
  if (['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'number', 'count'].some((w) => lower.includes(w))) return 'number';
  if (['emergency', 'help', 'danger', 'stop', 'police', 'hospital', 'doctor', 'ambulance', 'fire'].some((w) => lower.includes(w))) return 'emergency';
  return 'daily';
}

function generateSimulatedLandmarks(name: string): number[][] {
  const seed = name.length;
  const landmarks: number[][] = [];
  const centerX = 0.3 + (seed % 5) * 0.05;
  const centerY = 0.25 + (seed % 7) * 0.02;

  for (let i = 0; i < 21; i++) {
    const angle = (i / 21) * Math.PI * 2;
    const r = 0.05 + (i % 5) * 0.02;
    landmarks.push([
      centerX + Math.cos(angle + seed) * r,
      centerY + Math.sin(angle + seed * 0.7) * r,
      (i % 3) * 0.01,
    ]);
  }

  return landmarks;
}

export function generateSampleWLASLData(): WLASLEntry[] {
  return [
    {
      gloss: 'Hello',
      instances: [{ video_id: 'v001', url: '', start: 0, end: 1.5, signer_id: 1, split: 'train', landmarks: generateSimulatedLandmarks('Hello') }],
    },
    {
      gloss: 'Thank You',
      instances: [{ video_id: 'v002', url: '', start: 0, end: 1.8, signer_id: 1, split: 'train', landmarks: generateSimulatedLandmarks('Thank You') }],
    },
    {
      gloss: 'Yes',
      instances: [{ video_id: 'v003', url: '', start: 0, end: 1.2, signer_id: 2, split: 'train', landmarks: generateSimulatedLandmarks('Yes') }],
    },
    {
      gloss: 'No',
      instances: [{ video_id: 'v004', url: '', start: 0, end: 1.0, signer_id: 2, split: 'train', landmarks: generateSimulatedLandmarks('No') }],
    },
    {
      gloss: 'Please',
      instances: [{ video_id: 'v005', url: '', start: 0, end: 1.6, signer_id: 3, split: 'train', landmarks: generateSimulatedLandmarks('Please') }],
    },
    {
      gloss: 'Sorry',
      instances: [{ video_id: 'v006', url: '', start: 0, end: 1.4, signer_id: 3, split: 'train', landmarks: generateSimulatedLandmarks('Sorry') }],
    },
    {
      gloss: 'Help',
      instances: [{ video_id: 'v007', url: '', start: 0, end: 2.0, signer_id: 1, split: 'train', landmarks: generateSimulatedLandmarks('Help') }],
    },
    {
      gloss: 'Goodbye',
      instances: [{ video_id: 'v008', url: '', start: 0, end: 1.5, signer_id: 4, split: 'train', landmarks: generateSimulatedLandmarks('Goodbye') }],
    },
    {
      gloss: 'Love',
      instances: [{ video_id: 'v009', url: '', start: 0, end: 1.3, signer_id: 4, split: 'train', landmarks: generateSimulatedLandmarks('Love') }],
    },
    {
      gloss: 'Emergency',
      instances: [{ video_id: 'v010', url: '', start: 0, end: 2.2, signer_id: 5, split: 'train', landmarks: generateSimulatedLandmarks('Emergency') }],
    },
  ];
}

export function generateSampleArSLData(): ArSLEntry[] {
  return [
    { sign: 'مرحبا', arabic: 'مرحبا', category: 'greeting', description: 'Hello greeting in Arabic Sign Language', landmarks: generateSimulatedLandmarks('marhaba') },
    { sign: 'شكرا', arabic: 'شكراً', category: 'greeting', description: 'Thank you', landmarks: generateSimulatedLandmarks('shukran') },
    { sign: 'نعم', arabic: 'نعم', category: 'daily', description: 'Yes', landmarks: generateSimulatedLandmarks('naam') },
    { sign: 'لا', arabic: 'لا', category: 'daily', description: 'No', landmarks: generateSimulatedLandmarks('la') },
    { sign: 'اسمي', arabic: 'اسمي', category: 'greeting', description: 'My name is', landmarks: generateSimulatedLandmarks('ismi') },
    { sign: 'كيف حالك', arabic: 'كيف حالك؟', category: 'question', description: 'How are you?', landmarks: generateSimulatedLandmarks('kayf halak') },
    { sign: 'الحب', arabic: 'الحب', category: 'emotion', description: 'Love', landmarks: generateSimulatedLandmarks('hubb') },
    { sign: 'مساعدة', arabic: 'مساعدة', category: 'emergency', description: 'Help', landmarks: generateSimulatedLandmarks('musaada') },
    { sign: 'توقف', arabic: 'توقف', category: 'daily', description: 'Stop', landmarks: generateSimulatedLandmarks('tawaqquf') },
    { sign: 'صباح الخير', arabic: 'صباح الخير', category: 'greeting', description: 'Good morning', landmarks: generateSimulatedLandmarks('sabah alkhayr') },
  ];
}

export function exportDatasetJSON(dataset: GestureDataset): string {
  return JSON.stringify(dataset, null, 2);
}

export function downloadDatasetFile(dataset: GestureDataset): void {
  const json = exportDatasetJSON(dataset);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataset.name.replace(/\s+/g, '-').toLowerCase()}-v${dataset.version}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
