'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface CameraProps {
  onFrame?: (frame: ImageBitmap) => void;
  onError?: (error: Error) => void;
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  fps?: number;
  autoStart?: boolean;
}

export function Camera({
  onFrame,
  onError,
  facingMode = 'user',
  width = 640,
  height = 480,
  fps = 30,
  autoStart = false,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStreamingRef = useRef(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: fps },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    }
  }, [facingMode, width, height, fps, onError]);

  const stopCamera = useCallback(() => {
    stopStreaming();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
    setIsActive(false);
  }, []);

  const startStreaming = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    isStreamingRef.current = true;
    setIsActive(true);

    const processFrame = (timestamp: number) => {
      if (!isStreamingRef.current) return;

      const elapsed = timestamp - lastFrameTimeRef.current;
      const frameInterval = 1000 / fps;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp;
        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then((buffer) => {
              onFrame?.(new ImageBitmap());
            });
          }
        }, 'image/jpeg', 0.8);
      }

      rafRef.current = requestAnimationFrame(processFrame);
    };

    lastFrameTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(processFrame);
  }, [width, height, fps, onFrame]);

  const stopStreaming = useCallback(() => {
    isStreamingRef.current = false;
    setIsActive(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isActive) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [isActive, startStreaming, stopStreaming]);

  useEffect(() => {
    return stopCamera;
  }, [stopCamera]);

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="h-full w-full object-cover scale-x-[-1]"
        playsInline
        muted
        autoPlay
        onLoadedData={() => {
          if (autoStart) startStreaming();
        }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]"
      />

      {!hasPermission && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
          <button
            onClick={startCamera}
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Start Camera
          </button>
        </div>
      )}

      {hasPermission && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={toggle}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg transition-colors',
              isActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary-600 text-white hover:bg-primary-700',
            )}
          >
            {isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 p-3 text-sm text-white">
          {error}
        </div>
      )}
    </div>
  );
}
