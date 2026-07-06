export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface GestureSample {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  category: 'greeting' | 'question' | 'emotion' | 'number' | 'daily' | 'emergency' | 'fingerspelling' | 'custom';
  landmarks: number[][];
  source?: string;
  contributor?: string;
  recordedAt?: string;
  confidence?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationMs?: number;
  tags?: string[];
}

export interface DatasetVersion {
  version: string;
  createdAt: string;
  sampleCount: number;
  changes: string;
  commitHash?: string;
}

export interface GestureDataset {
  id: string;
  name: string;
  description: string;
  version: string;
  source: string;
  language: string;
  sampleCount: number;
  categoryCount: number;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  gestures: GestureSample[];
  versionHistory?: DatasetVersion[];
  trainingStatus?: 'untrained' | 'training' | 'ready' | 'failed';
  trainingMetrics?: {
    accuracy: number;
    loss: number;
    epochs: number;
    trainedAt: string;
  };
}

export interface DatasetImportResult {
  success: boolean;
  dataset: GestureDataset | null;
  error?: string;
}
