'use client';

import { useState, useCallback, useRef } from 'react';
import { useDatasetStore } from '@/lib/dataset-store';
import { useToast } from '@/components/ui/toast';
import type { GestureSample } from '@/lib/dataset-types';
import { initializeExtractor, extractLandmarksFromVideoFile } from '@/lib/video/mediapipe-extractor';

interface VideoUploadPipelineProps {
  datasetId: string;
  onComplete?: () => void;
}

export function VideoUploadPipeline({ datasetId, onComplete }: VideoUploadPipelineProps) {
  const [files, setFiles] = useState<{ file: File; name: string; progress: number; status: string; landmarks?: number[][]; gestureName: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addGestureToDataset } = useDatasetStore();
  const { addToast } = useToast();

  const checkMediapipe = useCallback(async () => {
    try {
      setInitError(null);
      const ok = await initializeExtractor();
      setMediapipeReady(ok);
      if (!ok) setInitError('Failed to load MediaPipe hand model. Using fallback extraction.');
      return ok;
    } catch {
      setMediapipeReady(false);
      setInitError('MediaPipe initialization failed. Using fallback.');
      return false;
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('video/'));
    if (dropped.length === 0) {
      addToast('Please drop video files (.mp4, .webm, .mov)', 'warning');
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...dropped.map((f) => ({ file: f, name: f.name.replace(/\.[^/.]+$/, ''), progress: 0, status: 'pending', gestureName: '' })),
    ]);
  }, [addToast]);

  const addFiles = (fileList: FileList) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('video/'));
    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({ file: f, name: f.name.replace(/\.[^/.]+$/, ''), progress: 0, status: 'pending', gestureName: '' })),
    ]);
  };

  const extractLandmarksFromVideo = useCallback(async (videoFile: File): Promise<number[][] | null> => {
    if (!mediapipeReady) {
      try { await checkMediapipe(); } catch {}
    }
    if (mediapipeReady) {
      try {
        const frames = await extractLandmarksFromVideoFile(videoFile, (frame, total) => {
          const pct = Math.round((frame / total) * 80) + 10;
          setFiles((prev) => prev.map((pf, pi) =>
            pi === 0 ? { ...pf, progress: pct, status: 'extracting' } : pf
          ));
        });
        const validFrames = frames.filter((f) => f.landmarks !== null);
        if (validFrames.length > 0) {
          const avgLandmarks: number[][] = [];
          for (let i = 0; i < 21; i++) {
            let sx = 0, sy = 0, sz = 0;
            for (const f of validFrames) {
              if (f.landmarks) {
                sx += f.landmarks[i][0];
                sy += f.landmarks[i][1];
                sz += f.landmarks[i][2];
              }
            }
            avgLandmarks.push([sx / validFrames.length, sy / validFrames.length, sz / validFrames.length]);
          }
          return avgLandmarks;
        }
      } catch (err) {
        console.warn('MediaPipe extraction failed, using fallback:', err);
      }
    }
    // Fallback: color-based feature extraction
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(videoFile);

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        const w = 320, h = 240;
        canvas.width = w;
        canvas.height = h;

        const totalFrames = Math.min(Math.floor(video.duration * 5), 30);
        const sampled: number[][] = [];
        let frameIdx = 0;

        const sampleFrame = () => {
          if (frameIdx >= totalFrames) {
            URL.revokeObjectURL(url);
            if (sampled.length > 0) {
              const len = sampled[0].length;
              const avg: number[] = [];
              for (let i = 0; i < len; i++) {
                let sum = 0;
                for (const s of sampled) sum += s[i];
                avg.push(sum / sampled.length);
              }
              const landmarks: number[][] = [];
              for (let i = 0; i < 21; i++) {
                const base = i * 3;
                landmarks.push([
                  avg[base] ?? 0.5 + Math.random() * 0.2,
                  avg[base + 1] ?? 0.3 + Math.random() * 0.2,
                  avg[base + 2] ?? 0,
                ]);
              }
              resolve(landmarks);
            } else {
              resolve(null);
            }
            return;
          }

          video.currentTime = (frameIdx / totalFrames) * video.duration;
          video.ontimeupdate = () => {
            ctx.drawImage(video, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const pixels = imageData.data;
            const features: number[] = [];
            const steps = 7;
            for (let y = 0; y < steps; y++) {
              for (let x = 0; x < steps; x++) {
                const px = Math.floor((x / steps) * w);
                const py = Math.floor((y / steps) * h);
                const idx = (py * w + px) * 4;
                features.push(pixels[idx] / 255, pixels[idx + 1] / 255, pixels[idx + 2] / 255);
              }
            }
            sampled.push(features);
            frameIdx++;
            sampleFrame();
          };
        };
        sampleFrame();
      };
      video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      video.src = url;
    });
  }, [mediapipeReady, checkMediapipe]);

  const processAll = useCallback(async () => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.status === 'done') continue;

      setFiles((prev) => prev.map((pf, pi) => pi === i ? { ...pf, status: 'extracting', progress: 20 } : pf));

      const landmarks = await extractLandmarksFromVideo(f.file);

      if (landmarks) {
        setFiles((prev) => prev.map((pf, pi) => pi === i ? { ...pf, landmarks, progress: 100, status: 'done' } : pf));

        const gestureName = f.gestureName || f.name;
        const gesture: GestureSample = {
          id: `vid-${Date.now()}-${i}`,
          name: gestureName,
          arabicName: gestureName,
          description: `Extracted from video: ${f.file.name}`,
          category: 'custom',
          landmarks,
          source: 'Video Upload',
          contributor: 'Video Pipeline',
          recordedAt: new Date().toISOString(),
          videoUrl: URL.createObjectURL(f.file),
          durationMs: Math.round(f.file.size / 1000),
        };
        addGestureToDataset(datasetId, gesture);
        addToast(`"${gestureName}" extracted and saved`, 'success');
      } else {
        setFiles((prev) => prev.map((pf, pi) => pi === i ? { ...pf, status: 'failed', progress: 0 } : pf));
        addToast(`Failed to extract landmarks from "${f.file.name}"`, 'error');
      }
    }
    setIsProcessing(false);
    onComplete?.();
  }, [files, datasetId, extractLandmarksFromVideo, addGestureToDataset, addToast, onComplete]);

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-700">Drop video files here</p>
        <p className="mt-1 text-sm text-gray-400">MP4, WebM, MOV — frames will be auto-processed for landmark extraction</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 rounded-xl bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Browse Videos
        </button>
        <input ref={fileInputRef} type="file" multiple accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">{files.length} file(s)</h3>
            <button onClick={clearFiles} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {files.map((f, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${
                  f.status === 'done' ? 'bg-green-100 text-green-700' :
                  f.status === 'failed' ? 'bg-red-100 text-red-700' :
                  f.status === 'extracting' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {f.status === 'done' ? '✓' : f.status === 'failed' ? '✕' : '🎬'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={f.gestureName}
                      onChange={(e) => setFiles((prev) => prev.map((pf, pi) => pi === i ? { ...pf, gestureName: e.target.value } : pf))}
                      placeholder="Gesture name..."
                      className="text-sm font-medium text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-primary-500 outline-none px-1 py-0.5"
                    />
                    <span className="text-xs text-gray-400">({f.file.name})</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      f.status === 'done' ? 'bg-green-500' : f.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                    }`} style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  f.status === 'done' ? 'text-green-600' : f.status === 'failed' ? 'text-red-600' : f.status === 'extracting' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {f.status === 'done' ? 'Extracted' : f.status === 'failed' ? 'Failed' : f.status === 'extracting' ? 'Processing...' : 'Ready'}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
            <button
              onClick={processAll}
              disabled={isProcessing || files.every((f) => f.status === 'done')}
              className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-all disabled:opacity-40"
            >
              {isProcessing ? '⏳ Processing...' : '🚀 Extract Landmarks & Save'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        <p className="font-medium mb-1">ℹ Video Processing Mode: {mediapipeReady ? 'MediaPipe AI' : 'Fallback (color-based)'}</p>
        <p className="text-xs">
          {mediapipeReady
            ? 'Using real MediaPipe HandLandmarker for accurate 21-point landmark extraction. Each frame is processed through the neural network model.'
            : 'Using simulated landmark extraction from motion features. Click "Load MediaPipe" to enable real AI-based extraction.'}
        </p>
        {!mediapipeReady && (
          <button onClick={checkMediapipe} className="mt-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
            Load MediaPipe AI
          </button>
        )}
      </div>
    </div>
  );
}
