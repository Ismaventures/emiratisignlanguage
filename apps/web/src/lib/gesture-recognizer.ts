'use client';

import { type LandmarkPoint } from './hand-tracker';
import { GESTURE_DATASET } from './gesture-data';
import { recognizeGesture as mlRecognize } from './ml-service';

interface RecognitionResult {
  gestureId: string;
  name: string;
  arabicName: string;
  confidence: number;
}

function euclideanDistance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function normalizeLandmarks(landmarks: LandmarkPoint[]): LandmarkPoint[] {
  if (landmarks.length === 0) return landmarks;
  const wrist = landmarks[0];
  return landmarks.map((lm) => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));
}

function computeSimilarity(
  detected: LandmarkPoint[],
  reference: number[][],
): number {
  if (detected.length === 0 || reference.length === 0) return 0;

  const minLen = Math.min(detected.length, reference.length);
  const refPoints: LandmarkPoint[] = reference
    .slice(0, minLen)
    .map((p) => ({ x: p[0], y: p[1], z: p[2] ?? 0 }));

  const normDetected = normalizeLandmarks(detected.slice(0, minLen));
  const normReference = normalizeLandmarks(refPoints);

  let totalDist = 0;
  for (let i = 0; i < minLen; i++) {
    totalDist += euclideanDistance(normDetected[i], normReference[i]);
  }

  const avgDist = totalDist / minLen;
  const maxDist = 1.0;
  return Math.max(0, Math.min(1, 1 - avgDist / maxDist));
}

function localRecognize(detectedLandmarks: LandmarkPoint[], topK: number): RecognitionResult[] {
  const scores: RecognitionResult[] = GESTURE_DATASET.map((gesture) => ({
    gestureId: gesture.id,
    name: gesture.name,
    arabicName: gesture.arabicName,
    confidence: computeSimilarity(detectedLandmarks, gesture.landmarks),
  }));

  scores.sort((a, b) => b.confidence - a.confidence);
  return scores
    .filter((s) => s.confidence > 0.15)
    .slice(0, topK);
}

export async function recognizeGesture(
  detectedLandmarks: LandmarkPoint[],
  topK = 3,
): Promise<RecognitionResult[]> {
  if (!detectedLandmarks || detectedLandmarks.length < 5) {
    return [];
  }

  try {
    const landmarkArray = detectedLandmarks.map((lm) => [lm.x, lm.y, lm.z]);
    const results = await mlRecognize(landmarkArray, topK);
    if (results.length > 0) {
      return results;
    }
  } catch {
    // ML service unavailable, fall back to local matching
  }

  return localRecognize(detectedLandmarks, topK);
}

export async function getBestGesture(
  landmarks: LandmarkPoint[],
  minConfidence = 0.25,
): Promise<RecognitionResult | null> {
  const results = await recognizeGesture(landmarks, 1);
  if (results.length > 0 && results[0].confidence >= minConfidence) {
    return results[0];
  }
  return null;
}
