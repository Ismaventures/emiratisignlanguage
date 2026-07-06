'use client';

import { useState, useCallback } from 'react';
import type { GestureSample } from '../../lib/dataset-types';
import { CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Save } from 'lucide-react';

export type AnnotationStatus = 'pending' | 'approved' | 'rejected';

interface AnnotatedSample extends GestureSample {
  annotationStatus: AnnotationStatus;
  annotationComment: string;
  annotatedBy?: string;
  annotatedAt?: string;
}

interface Props {
  datasetName: string;
  samples: GestureSample[];
  onSave: (annotated: AnnotatedSample[]) => void;
  onClose: () => void;
}

export function AnnotationValidator({ datasetName, samples, onSave, onClose }: Props) {
  const [annotated, setAnnotated] = useState<AnnotatedSample[]>(
    samples.map((s) => ({
      ...s,
      annotationStatus: 'pending' as AnnotationStatus,
      annotationComment: '',
    })),
  );
  const [currentIdx, setCurrentIdx] = useState(0);

  const current = annotated[currentIdx];

  const setStatus = useCallback((status: AnnotationStatus) => {
    setAnnotated((prev) => {
      const next = [...prev];
      if (next[currentIdx]) {
        next[currentIdx] = { ...next[currentIdx], annotationStatus: status, annotatedAt: new Date().toISOString() };
      }
      return next;
    });
  }, [currentIdx]);

  const setComment = useCallback((comment: string) => {
    setAnnotated((prev) => {
      const next = [...prev];
      if (next[currentIdx]) {
        next[currentIdx] = { ...next[currentIdx], annotationComment: comment };
      }
      return next;
    });
  }, [currentIdx]);

  const stats = {
    total: annotated.length,
    approved: annotated.filter((a) => a.annotationStatus === 'approved').length,
    rejected: annotated.filter((a) => a.annotationStatus === 'rejected').length,
    pending: annotated.filter((a) => a.annotationStatus === 'pending').length,
  };

  if (!current) {
    return (
      <div className="p-6 text-center text-slate-400">
        No samples to validate
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Validate: {datasetName}</h2>
            <p className="text-xs text-slate-400">
              {stats.approved} approved / {stats.rejected} rejected / {stats.pending} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
              {currentIdx + 1}/{stats.total}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <AlertCircle size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{current.name}</span>
                <span className="text-sm text-slate-400">{current.arabicName}</span>
              </div>
              <p className="text-xs text-slate-500">{current.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {current.category}
                </span>
                {current.source && (
                  <span className="text-[10px] uppercase tracking-wider bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">
                    {current.source}
                  </span>
                )}
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
              current.annotationStatus === 'approved' ? 'bg-green-900/30 text-green-400' :
              current.annotationStatus === 'rejected' ? 'bg-red-900/30 text-red-400' :
              'bg-slate-800 text-slate-400'
            }`}>
              {current.annotationStatus}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {current.landmarks.slice(0, 21).map((lm, i) => (
              <div key={i} className="bg-slate-800 rounded p-1.5">
                <div className="text-[9px] font-mono text-slate-500">#{i}</div>
                <div className="text-[9px] font-mono text-slate-300">
                  {lm[0].toFixed(2)}, {lm[1].toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Review Comment</label>
            <textarea
              value={current.annotationComment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note about this gesture sample..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatus('approved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                current.annotationStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle size={15} /> Approve
            </button>
            <button
              onClick={() => setStatus('rejected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                current.annotationStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <XCircle size={15} /> Reject
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(annotated.length - 1, i + 1))}
              disabled={currentIdx >= annotated.length - 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onSave(annotated)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors ml-2"
            >
              <Save size={15} /> Save Annotations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getAnnotationStats(samples: GestureSample[]): {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
} {
  const annotated = samples as unknown as AnnotatedSample[];
  return {
    total: samples.length,
    approved: annotated.filter((a) => a.annotationStatus === 'approved').length,
    rejected: annotated.filter((a) => a.annotationStatus === 'rejected').length,
    pending: annotated.filter((a) => !a.annotationStatus || a.annotationStatus === 'pending').length,
  };
}
