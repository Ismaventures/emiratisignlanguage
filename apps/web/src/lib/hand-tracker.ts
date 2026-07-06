'use client';

import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useState, useCallback, useRef } from 'react';

export type LandmarkPoint = { x: number; y: number; z: number };

export interface HandTrackingResult {
  landmarks: LandmarkPoint[][];
  handedness: ('Left' | 'Right')[];
  timestamp: number;
}

export interface HandTrackerState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  isTracking: boolean;
}

export function useHandTracker() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [state, setState] = useState<HandTrackerState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    isTracking: false,
  });

  const initialize = useCallback(async () => {
    if (handLandmarkerRef.current || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handLandmarkerRef.current = handLandmarker;
      setState({ isLoaded: true, isLoading: false, error: null, isTracking: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load hand tracker';
      setState({ isLoaded: false, isLoading: false, error: msg, isTracking: false });
    }
  }, [state.isLoading]);

  const detect = useCallback(
    (video: HTMLVideoElement, timestamp: number): HandTrackingResult | null => {
      if (!handLandmarkerRef.current || !video.videoWidth) return null;

      const result = handLandmarkerRef.current.detectForVideo(video, timestamp);

      if (!result.landmarks || result.landmarks.length === 0) {
        return null;
      }

      const landmarks: LandmarkPoint[][] = result.landmarks.map(
        (hand: NormalizedLandmark[]) =>
          hand.map((lm: NormalizedLandmark) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          })),
      );

      const handedness: ('Left' | 'Right')[] = result.handedness?.map(
        (h: any) => h[0]?.categoryName || 'Right',
      ) ?? ['Right'];

      return { landmarks, handedness, timestamp };
    },
    [],
  );

  const reset = useCallback(() => {
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }
    setState({ isLoaded: false, isLoading: false, error: null, isTracking: false });
  }, []);

  return { state, initialize, detect, reset };
}
