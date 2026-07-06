'use client';

import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

let handLandmarkerInstance: HandLandmarker | null = null;
let initPromise: Promise<boolean> | null = null;

export async function initializeExtractor(): Promise<boolean> {
  if (handLandmarkerInstance) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
      );
      handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
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
      return true;
    } catch {
      handLandmarkerInstance = null;
      return false;
    }
  })();

  return initPromise;
}

export interface ExtractedFrame {
  timestamp: number;
  landmarks: number[][] | null;
  handedness: string[];
}

export async function extractLandmarksFromVideo(
  video: HTMLVideoElement,
  onProgress?: (frame: number, total: number) => void,
): Promise<ExtractedFrame[]> {
  if (!handLandmarkerInstance) {
    throw new Error('HandLandmarker not initialized. Call initializeExtractor() first.');
  }

  const frames: ExtractedFrame[] = [];
  const fps = 15;
  const totalFrames = Math.floor(video.duration * fps);

  video.currentTime = 0;
  await video.play();

  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    video.currentTime = time;

    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      setTimeout(resolve, 50);
    });

    const timestamp = time * 1000;
    const result = handLandmarkerInstance!.detectForVideo(video, timestamp);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0].map(
        (lm: NormalizedLandmark) => [lm.x, lm.y, lm.z ?? 0],
      );
      const handedness = result.handedness?.map(
        (h: any) => h[0]?.categoryName || 'Right',
      ) ?? ['Right'];

      frames.push({ timestamp: time, landmarks, handedness });
    } else {
      frames.push({ timestamp: time, landmarks: null, handedness: [] });
    }

    onProgress?.(i + 1, totalFrames);
  }

  video.pause();
  return frames;
}

export async function extractLandmarksFromVideoFile(
  file: File,
  onProgress?: (frame: number, total: number) => void,
): Promise<ExtractedFrame[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
    setTimeout(() => reject(new Error('Video load timeout')), 30000);
  });

  try {
    return await extractLandmarksFromVideo(video, onProgress);
  } finally {
    URL.revokeObjectURL(url);
    video.remove();
  }
}
