'use client';

import { useState, useCallback, useRef } from 'react';
import { ProCamera } from '@/components/camera/pro-camera';
import { useHandTracker, type LandmarkPoint } from '@/lib/hand-tracker';
import { useDatasetStore } from '@/lib/dataset-store';
import { useToast } from '@/components/ui/toast';
import type { GestureSample } from '@/lib/dataset-types';

interface GestureRecorderProps {
  datasetId: string;
  onRecorded?: (gesture: GestureSample) => void;
}

export function GestureRecorder({ datasetId, onRecorded }: GestureRecorderProps) {
  const [gestureName, setGestureName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GestureSample['category']>('custom');
  const [recordedLandmarks, setRecordedLandmarks] = useState<number[][] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const currentLandmarksRef = useRef<LandmarkPoint[]>([]);
  const recordingRef = useRef<LandmarkPoint[][]>([]);
  const { addGestureToDataset } = useDatasetStore();
  const { addToast } = useToast();

  const handleGestureFrame = useCallback((gesture: any, landmarks: LandmarkPoint[]) => {
    if (landmarks && landmarks.length > 0) {
      currentLandmarksRef.current = landmarks;
      if (isRecording) {
        recordingRef.current.push([...landmarks]);
      }
    }
  }, [isRecording]);

  const startRecording = useCallback(() => {
    recordingRef.current = [];
    setIsRecording(true);
    addToast('Recording gesture — hold your pose', 'info');
    setTimeout(() => {
      setIsRecording(false);
      if (recordingRef.current.length > 0) {
        const avg = averageLandmarks(recordingRef.current);
        setRecordedLandmarks(avg);
        setSampleCount(recordingRef.current.length);
        addToast(`Captured ${recordingRef.current.length} samples`, 'success');
      }
    }, 3000);
  }, [addToast]);

  const averageLandmarks = (samples: LandmarkPoint[][]): number[][] => {
    if (samples.length === 0) return [];
    const len = samples[0].length;
    const result: number[][] = [];
    for (let i = 0; i < len; i++) {
      let x = 0, y = 0, z = 0, count = 0;
      for (const s of samples) {
        if (i < s.length) {
          x += s[i].x;
          y += s[i].y;
          z += s[i].z;
          count++;
        }
      }
      result.push([x / count, y / count, z / count]);
    }
    return result;
  };

  const saveGesture = useCallback(() => {
    if (!gestureName.trim() || !recordedLandmarks) {
      addToast('Enter a name and record a gesture first', 'warning');
      return;
    }
    const gesture: GestureSample = {
      id: `rec-${Date.now()}`,
      name: gestureName.trim(),
      arabicName: arabicName.trim() || gestureName.trim(),
      description: description.trim() || `Recorded gesture: ${gestureName}`,
      category,
      landmarks: recordedLandmarks,
      source: 'EmirSign Recorder',
      contributor: 'Live Recording',
      recordedAt: new Date().toISOString(),
    };
    addGestureToDataset(datasetId, gesture);
    addToast(`"${gestureName}" added to dataset!`, 'success');
    onRecorded?.(gesture);
    setGestureName('');
    setArabicName('');
    setDescription('');
    setRecordedLandmarks(null);
    setSampleCount(0);
  }, [gestureName, arabicName, description, category, recordedLandmarks, datasetId, addGestureToDataset, addToast, onRecorded]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <ProCamera onGesture={handleGestureFrame} />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gesture Name (English)</label>
            <input
              type="text" value={gestureName} onChange={(e) => setGestureName(e.target.value)}
              placeholder="e.g. Hello, Thank you, Yes"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
            <input
              type="text" value={arabicName} onChange={(e) => setArabicName(e.target.value)}
              placeholder="e.g. مرحبا, شكرا, نعم"
              dir="rtl"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the handshape and movement..."
              rows={2}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category} onChange={(e) => setCategory(e.target.value as GestureSample['category'])}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              <option value="greeting">Greeting</option>
              <option value="question">Question</option>
              <option value="emotion">Emotion</option>
              <option value="number">Number</option>
              <option value="daily">Daily</option>
              <option value="emergency">Emergency</option>
              <option value="fingerspelling">Fingerspelling</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                isRecording
                  ? 'bg-red-500 animate-pulse cursor-wait'
                  : recordedLandmarks
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isRecording ? '🔴 Recording... (3s)' : recordedLandmarks ? '✓ Re-record' : '🎥 Record Gesture'}
            </button>
            <button
              onClick={saveGesture}
              disabled={!recordedLandmarks}
              className="flex-1 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💾 Save to Dataset
            </button>
          </div>

          {recordedLandmarks && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✓ Gesture captured — {recordedLandmarks.length} landmark points from {sampleCount} frames
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
