'use client';

import { useState, useRef, useCallback } from 'react';

interface Dataset {
  id: string;
  name: string;
  type: string;
  samples: number;
  status: 'Ready' | 'Processing' | 'Draft' | 'Failed';
  accuracy: string;
  updated: string;
  size: string;
  versions: number;
}

interface UploadFile {
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

const MOCK_DATASETS: Dataset[] = [
  { id: '1', name: 'ESL Gestures v2', type: 'Gesture', samples: 12500, status: 'Ready', accuracy: '94.2%', updated: '2 days ago', size: '2.4 GB', versions: 3 },
  { id: '2', name: 'ESL Sentences v1', type: 'Sequence', samples: 3400, status: 'Ready', accuracy: '88.7%', updated: '5 days ago', size: '890 MB', versions: 2 },
  { id: '3', name: 'Arabic Phrases', type: 'Speech', samples: 8900, status: 'Processing', accuracy: '—', updated: '1 hour ago', size: '1.1 GB', versions: 1 },
  { id: '4', name: 'Facial Expressions', type: 'Face', samples: 2100, status: 'Draft', accuracy: '—', updated: '1 week ago', size: '420 MB', versions: 1 },
];

const ANNOTATION_TYPES = [
  { id: 'gesture', label: 'Gesture Label', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'landmark', label: 'Landmark Keypoint', color: 'bg-blue-100 text-blue-700' },
  { id: 'bbox', label: 'Bounding Box', color: 'bg-purple-100 text-purple-700' },
  { id: 'text', label: 'Text Translation', color: 'bg-amber-100 text-amber-700' },
];

export default function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState(MOCK_DATASETS);
  const [showUpload, setShowUpload] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const addFiles = (files: File[]) => {
    const newUploads: UploadFile[] = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type || 'unknown',
      progress: 0,
      status: 'pending' as const,
    }));
    setUploads((prev) => [...prev, ...newUploads]);

    // Simulate upload
    newUploads.forEach((uf, idx) => {
      setTimeout(() => {
        setUploads((prev) =>
          prev.map((u, i) =>
            i === idx ? { ...u, status: 'uploading' as const } : u,
          ),
        );
        let p = 0;
        const interval = setInterval(() => {
          p += Math.random() * 20;
          if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setUploads((prev) =>
              prev.map((u, i) =>
                i === idx ? { ...u, progress: 100, status: 'done' as const } : u,
              ),
            );
            setDatasets((prev) => [
              {
                id: Date.now().toString(),
                name: uf.name.replace(/\.[^/.]+$/, ''),
                type: uf.type.includes('video') ? 'Gesture' : uf.type.includes('audio') ? 'Speech' : 'Sequence',
                samples: Math.floor(Math.random() * 5000) + 500,
                status: 'Processing',
                accuracy: '—',
                updated: 'Just now',
                size: `${(uf.size / (1024 * 1024)).toFixed(1)} MB`,
                versions: 1,
              } as Dataset,
              ...prev,
            ]);
          }
          setUploads((prev) =>
            prev.map((u, i) =>
              i === idx ? { ...u, progress: Math.min(p, 100) } : u,
            ),
          );
        }, 200);
      }, 500 * idx);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-sm text-gray-500">Manage training data for AI models</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-all shadow-sm"
        >
          {showUpload ? 'Browse Datasets' : '+ Upload Dataset'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Datasets', value: datasets.length.toString(), icon: '📦', color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Samples', value: datasets.reduce((a, d) => a + d.samples, 0).toLocaleString(), icon: '📊', color: 'from-emerald-500 to-teal-600' },
          { label: 'Ready to Use', value: datasets.filter((d) => d.status === 'Ready').length.toString(), icon: '✅', color: 'from-green-500 to-emerald-600' },
          { label: 'Processing', value: datasets.filter((d) => d.status === 'Processing').length.toString(), icon: '⏳', color: 'from-amber-500 to-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-lg shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Upload New Dataset</h3>
          </div>
          <div className="p-6 space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragOver ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-700">
                Drop files here or click to browse
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Supports video, audio, image, and CSV/JSON files (max 2GB)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-xl bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp4,.webm,.mov,.wav,.mp3,.jpg,.png,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(Array.from(e.target.files));
                }}
              />
            </div>

            {/* Upload queue */}
            {uploads.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Upload Queue ({uploads.filter((u) => u.status !== 'done').length} remaining)
                </p>
                {uploads.map((uf, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      uf.status === 'done' ? 'bg-green-100 text-green-700' : uf.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {uf.status === 'done' ? '✓' : uf.status === 'error' ? '✕' : uf.type.includes('video') ? '🎬' : uf.type.includes('audio') ? '🎵' : '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{uf.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(uf.size)}</p>
                    </div>
                    <div className="w-24">
                      {uf.status === 'uploading' && (
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${uf.progress}%` }} />
                        </div>
                      )}
                      {uf.status === 'done' && <span className="text-xs text-green-600 font-medium">Done</span>}
                      {uf.status === 'pending' && <span className="text-xs text-gray-400">Queued</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Datasets Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Samples</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Size</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Versions</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Accuracy</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {ds.type === 'Gesture' ? '🤟' : ds.type === 'Speech' ? '🎤' : ds.type === 'Face' ? '😊' : '📄'}
                      </span>
                      <span className="font-medium text-gray-900">{ds.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{ds.type}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium">{ds.samples.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-500">{ds.size}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">v{ds.versions}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ds.status === 'Ready' ? 'bg-green-100 text-green-700' :
                      ds.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      ds.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ds.status === 'Processing' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      {ds.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{ds.accuracy}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setSelectedDataset(ds); setShowAnnotation(ds.id); }}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Annotate
                      </button>
                      <button className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Annotation Modal */}
      {showAnnotation && selectedDataset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annotation Tools</h3>
                <p className="text-sm text-gray-500">{selectedDataset.name} — {selectedDataset.samples.toLocaleString()} samples</p>
              </div>
              <button
                onClick={() => setShowAnnotation(null)}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Annotation type selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ANNOTATION_TYPES.map((at) => (
                  <button
                    key={at.id}
                    className={`rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-left transition-all hover:shadow-sm ${
                      at.color.split(' ')[0]}
                    `}
                  >
                    <span className={`inline-block rounded-lg px-2 py-0.5 text-xs mb-1.5 ${at.color}`}>
                      {at.id}
                    </span>
                    <p className="text-gray-700">{at.label}</p>
                  </button>
                ))}
              </div>

              {/* Sample preview */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700">Sample Preview</p>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      ← Previous
                    </button>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-xl bg-gray-900 h-48">
                  <div className="text-center">
                    <span className="text-5xl">🤟</span>
                    <p className="mt-2 text-sm text-gray-400">Sign: Hello / مرحبا</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Gesture Label</label>
                    <input type="text" defaultValue="Hello" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Arabic Translation</label>
                    <input type="text" defaultValue="مرحبا" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Confidence</label>
                    <input type="number" defaultValue={95} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none" />
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: '68%' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">68%</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAnnotation(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
