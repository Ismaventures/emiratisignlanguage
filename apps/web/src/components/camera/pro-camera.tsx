'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useHandTracker, type LandmarkPoint } from '@/lib/hand-tracker';
import { recognizeGesture, getBestGesture } from '@/lib/gesture-recognizer';
import { useToast } from '@/components/ui/toast';

export interface DetectedGesture {
  name: string;
  arabicName: string;
  confidence: number;
}

interface ProCameraProps {
  onGesture?: (gesture: DetectedGesture | null, landmarks: LandmarkPoint[]) => void;
  onFrame?: (imageData: ImageData) => void;
  width?: number;
  height?: number;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

function drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: LandmarkPoint[], w: number, h: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const [i, j] of HAND_CONNECTIONS) {
    if (i < landmarks.length && j < landmarks.length) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
      ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
      ctx.stroke();
    }
  }
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const x = lm.x * w;
    const y = lm.y * h;
    const r = i === 0 ? 5 : 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = [4, 8, 12, 16, 20].includes(i) ? '#facc15' : color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function ProCamera({ onGesture, width = 640, height = 480 }: ProCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(0);

  const [isOn, setIsOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeGesture, setActiveGesture] = useState<DetectedGesture | null>(null);
  const [fps, setFps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { state: trackerState, initialize, detect, reset } = useHandTracker();

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: width }, height: { ideal: height } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!trackerState.isLoaded) {
        await initialize();
      }

      setIsOn(true);
      frameCountRef.current = 0;
      fpsTimerRef.current = performance.now();
    } catch (err) {
      setError('Camera access denied. Allow camera permissions and try again.');
      addToast('Camera permission denied', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, width, height, trackerState.isLoaded, initialize, addToast]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsOn(false);
    setActiveGesture(null);
    setFps(0);
    reset();
  }, [reset]);

  const switchCamera = useCallback(() => {
    if (!isOn) return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    stopCamera();
    setTimeout(() => startCamera(), 400);
  }, [isOn, startCamera, stopCamera]);

  // Tracking loop
  useEffect(() => {
    if (!isOn || !trackerState.isLoaded || !videoRef.current || !overlayRef.current) return;

    const video = videoRef.current;
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const tick = (timestamp: number) => {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mirror the video onto the canvas so landmarks align with mirrored view
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const result = detect(video, timestamp);
      if (result) {
        for (let h = 0; h < result.landmarks.length; h++) {
          const color = result.handedness[h] === 'Left' ? '#3b82f6' : '#22c55e';
          drawLandmarks(ctx, result.landmarks[h], canvas.width, canvas.height, color);
        }

        const bestLm = result.landmarks[0];
        if (bestLm) {
          getBestGesture(bestLm, 0.2).then((best) => {
            const detected: DetectedGesture | null = best
              ? { name: best.name, arabicName: best.arabicName, confidence: best.confidence }
              : null;
            setActiveGesture(detected);
            onGesture?.(detected, bestLm);
          });
        }
      }

      // FPS
      frameCountRef.current++;
      if (performance.now() - fpsTimerRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimerRef.current = performance.now();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isOn, trackerState.isLoaded, width, height, detect, onGesture]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-950 shadow-xl" style={{ aspectRatio: `${width}/${height}` }}>
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1]" playsInline muted />

      <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          {isOn && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 backdrop-blur-sm border border-green-500/20">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
          {trackerState.isLoading && (
            <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-sm border border-yellow-500/20">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              Loading AI model...
            </span>
          )}
          {error && (
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm border border-red-500/20">
              {error}
            </span>
          )}
        </div>
        {isOn && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-mono text-white/60 backdrop-blur-sm">
            ⚡ {fps} FPS
          </span>
        )}
      </div>

      {/* Gesture badge */}
      {isOn && activeGesture && activeGesture.confidence > 0.35 && (
        <div className="absolute left-1/2 top-1/3 z-10 -translate-x-1/2 pointer-events-none">
          <div className="animate-pulse rounded-2xl bg-primary-500/30 px-6 py-3 text-center backdrop-blur-sm border border-primary-500/40 shadow-xl">
            <p className="text-2xl font-bold text-white drop-shadow-lg">{activeGesture.name}</p>
            <p className="text-sm text-primary-200">{activeGesture.arabicName}</p>
          </div>
        </div>
      )}

      {/* Bottom controls — always on top */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isOn ? stopCamera : startCamera}
            disabled={isLoading}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all shadow-xl ${
              isLoading ? 'bg-gray-500 cursor-wait' :
              isOn ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/40'
            }`}
          >
            {isLoading ? (
              <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                )}
              </svg>
            )}
          </button>

          {isOn && (
            <>
              <button onClick={switchCamera} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white/80 hover:bg-white/30 hover:text-white transition-all backdrop-blur-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button onClick={() => {
                if (!videoRef.current) return;
                const c = document.createElement('canvas');
                c.width = width; c.height = height;
                const ctx = c.getContext('2d');
                if (!ctx) return;
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, -width, 0, width, height);
                c.toBlob((blob) => {
                  if (blob) {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `gesture-${Date.now()}.jpg`;
                    a.click();
                    addToast('Frame saved!', 'success');
                  }
                }, 'image/jpeg', 0.9);
              }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white/80 hover:bg-white/30 hover:text-white transition-all backdrop-blur-sm" title="Save frame">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Off-state overlay — lets clicks pass through to controls */}
      {!isOn && !isLoading && (
        <div className="absolute inset-0 z-5 flex flex-col items-center justify-center bg-gray-950/85 gap-3 pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <svg className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white">Camera is off</p>
          <p className="text-sm text-gray-400">Click the button below to start</p>
        </div>
      )}
    </div>
  );
}
