'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatasetStore } from '@/lib/dataset-store';
import { GestureRecorder } from '@/components/datasets/gesture-recorder';
import { VideoUploadPipeline } from '@/components/datasets/video-pipeline';
import { AnnotationValidator } from '@/components/datasets/annotation-validator';
import { REAL_DATASET_SOURCES } from '@/lib/dataset-sources';
import { useToast } from '@/components/ui/toast';
import type { GestureDataset, GestureSample } from '@/lib/dataset-types';
import { initializeTF, buildModel, trainModel, saveModel, predictGesture } from '@/lib/training/tfjs-trainer';
import { generateSampleWLASLData, generateSampleArSLData, convertWLASLToDataset, convertArSLToDataset, downloadDatasetFile } from '@/lib/dataset-converters';

const CATEGORY_COLORS: Record<string, string> = {
  greeting: 'bg-emerald-100 text-emerald-700',
  question: 'bg-blue-100 text-blue-700',
  emotion: 'bg-pink-100 text-pink-700',
  number: 'bg-purple-100 text-purple-700',
  daily: 'bg-amber-100 text-amber-700',
  emergency: 'bg-red-100 text-red-700',
  fingerspelling: 'bg-indigo-100 text-indigo-700',
  custom: 'bg-gray-100 text-gray-700',
};

type Tab = 'browse' | 'import' | 'record' | 'upload' | 'sources';

export default function DatasetsPage() {
  const { datasets, activeDatasetId, setActiveDataset, removeDataset, importFromJson, exportToJson, loadBuiltin, createVersion, rollbackToVersion, setTrainingStatus } = useDatasetStore();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [importText, setImportText] = useState('');
  const [versionChanges, setVersionChanges] = useState('');
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<{ epoch: number; total: number; loss: number; accuracy: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importUrl, setImportUrl] = useState('');

  useEffect(() => { loadBuiltin(); }, [loadBuiltin]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0] || null;

  const filteredGestures = activeDataset
    ? activeDataset.gestures.filter((g) => {
        const q = searchQuery.toLowerCase();
        return (q === '' || g.name.toLowerCase().includes(q) || g.arabicName.includes(q) || g.description.toLowerCase().includes(q)) &&
          (categoryFilter === 'all' || g.category === categoryFilter);
      })
    : [];

  const allCategories = activeDataset ? [...new Set(activeDataset.gestures.map((g) => g.category))] : [];

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importFromJson(text);
      addToast(result.success ? `Imported "${result.dataset?.name}" (${result.dataset?.gestures.length} gestures)` : result.error || 'Import failed', result.success ? 'success' : 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [importFromJson, addToast]);

  const handleExport = useCallback((id: string) => {
    const json = exportToJson(id);
    if (!json) { addToast('Dataset not found', 'error'); return; }
    const ds = datasets.find((d) => d.id === id);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${ds?.name || 'dataset'}-${Date.now()}.json`;
    a.click();
    addToast(`Exported "${ds?.name}"`, 'success');
  }, [exportToJson, datasets, addToast]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'browse', label: 'Browse', icon: '🔍' },
    { id: 'import', label: 'Import', icon: '📥' },
    { id: 'record', label: 'Record', icon: '🎥' },
    { id: 'upload', label: 'Upload Video', icon: '🎬' },
    { id: 'sources', label: 'Real Datasets', icon: '🌐' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dataset Management</h1>
          <p className="text-sm text-gray-500">Browse, import, record, upload videos, and access real-world sign language datasets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {datasets.reduce((a, d) => a + d.gestures.length, 0)} total gestures across {datasets.length} datasets
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'sources' ? (
        /* ─── SOURCES TAB ─── */
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-700">
            <p className="font-medium mb-1">🌐 Real Sign Language Datasets</p>
            <p className="text-xs">These are publicly available sign language datasets you can download and import into EmirSign. Click the links to visit each dataset&apos;s homepage for download instructions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {REAL_DATASET_SOURCES.map((src) => (
              <div key={src.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{src.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{src.region} · {src.language}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600">{src.gestureCount} gestures</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{src.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {src.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>🎬 {src.videoCount.toLocaleString()} videos</span>
                  <span>📄 {src.format}</span>
                  <span>⚖ {src.license}</span>
                </div>
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                  Visit Dataset ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'upload' ? (
        /* ─── UPLOAD TAB ─── */
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Upload Videos</h2>
          <p className="text-sm text-gray-500 mb-4">Upload sign language videos to automatically extract gesture landmarks and add them to a dataset</p>
          {!activeDatasetId && datasets.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <p className="text-sm text-gray-500 mr-2 self-center">Select target dataset:</p>
              {datasets.slice(0, 4).map((ds) => (
                <button key={ds.id} onClick={() => setActiveDataset(ds.id)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">{ds.name}</button>
              ))}
            </div>
          )}
          {activeDatasetId ? (
            <VideoUploadPipeline datasetId={activeDatasetId} />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <span className="text-4xl">📦</span>
              <p className="mt-3 text-gray-500 font-medium">No dataset selected</p>
              <p className="text-sm text-gray-400">Upload a dataset first or select one from the Browse tab</p>
            </div>
          )}
        </div>
      ) : tab === 'import' ? (
        /* ─── IMPORT TAB ─── */
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Import Dataset</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-all">
                Upload JSON File
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileImport} />
              <span className="text-sm text-gray-400">or paste JSON below</span>
            </div>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='Paste dataset JSON here...' rows={8} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={() => {
                if (!importText.trim()) { addToast('Paste a dataset JSON first', 'warning'); return; }
                const result = importFromJson(importText);
                addToast(result.success ? `Imported "${result.dataset?.name}"` : result.error || 'Import failed', result.success ? 'success' : 'error');
                if (result.success) setImportText('');
              }} disabled={!importText.trim()} className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all disabled:opacity-40">
                Import from Text
              </button>
              <button onClick={() => {
                const sample = {
                  name: 'My Custom Dataset',
                  description: 'Dataset created via EmirSign import',
                  version: '1.0.0',
                  source: 'EmirSign User',
                  language: 'ar-AE',
                  sampleCount: 2,
                  categoryCount: 1,
                  categories: ['custom'],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  tags: ['custom'],
                  gestures: [
                    { id: 's1', name: 'Example Gesture', arabicName: 'مثال', description: 'Sample gesture', category: 'custom', landmarks: Array.from({ length: 21 }, (_, i) => [0.3 + i * 0.02, 0.3 + Math.sin(i) * 0.1, 0]) },
                    { id: 's2', name: 'Hello Demo', arabicName: 'مرحبا', description: 'Hello gesture demo', category: 'greeting', landmarks: Array.from({ length: 21 }, (_, i) => [0.5 + Math.cos(i) * 0.05, 0.3 + Math.sin(i) * 0.05, 0]) },
                  ],
                };
                setImportText(JSON.stringify(sample, null, 2));
              }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Load Sample Template
              </button>
            </div>
          </div>
        </div>
      ) : tab === 'record' ? (
        /* ─── RECORD TAB ─── */
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Record New Gesture</h2>
          <p className="text-sm text-gray-500 mb-4">Use your camera to record a new gesture and add it directly to a dataset</p>
          {activeDatasetId ? (
            <GestureRecorder datasetId={activeDatasetId} />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <span className="text-4xl">📦</span>
              <p className="mt-3 text-gray-500 font-medium">No dataset selected</p>
              <p className="text-sm text-gray-400">Upload a dataset first or select one from the Browse tab</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── BROWSE TAB ─── */
        <>
          {/* Dataset selector */}
          <div className="flex flex-wrap gap-2">
            {datasets.map((ds) => (
              <button key={ds.id} onClick={() => setActiveDataset(ds.id)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${activeDatasetId === ds.id || (!activeDatasetId && ds === datasets[0]) ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <span className="text-base">{ds.tags?.includes('asl') ? '🇺🇸' : '🇦🇪'}</span>
                <span>{ds.name}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{ds.sampleCount}</span>
                {ds.trainingStatus === 'ready' && <span className="text-[10px] text-green-600 font-medium">✓Trained</span>}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Gesture list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search gestures..." className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none" />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => setCategoryFilter('all')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${categoryFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                  {allCategories.map((cat) => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${categoryFilter === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
                  ))}
                </div>
              </div>

              {filteredGestures.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="mt-3 text-gray-500 font-medium">No gestures found</p>
                  <p className="text-sm text-gray-400">Try a different search or category filter</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredGestures.map((gesture) => (
                    <div key={gesture.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{gesture.name}</h3>
                          <p className="text-sm text-gray-400" dir="rtl">{gesture.arabicName}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${CATEGORY_COLORS[gesture.category] || 'bg-gray-100 text-gray-600'}`}>{gesture.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{gesture.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{gesture.landmarks?.length || 0} landmarks</span>
                        <span className="text-[10px] text-gray-400">{gesture.source || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {activeDataset && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900">{activeDataset.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{activeDataset.description}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-medium text-gray-700">{activeDataset.version}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Gestures</span><span className="font-medium text-gray-700">{activeDataset.sampleCount}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Categories</span><span className="font-medium text-gray-700">{activeDataset.categories.length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Language</span><span className="font-medium text-gray-700">{activeDataset.language}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="font-medium text-gray-700 text-right truncate max-w-[140px]">{activeDataset.source}</span></div>
                      {activeDataset.trainingMetrics && (
                        <div className="flex justify-between"><span className="text-gray-500">Accuracy</span><span className="font-medium text-emerald-600">{(activeDataset.trainingMetrics.accuracy * 100).toFixed(1)}%</span></div>
                      )}
                    </div>
                    {activeDataset.trainingStatus && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          activeDataset.trainingStatus === 'ready' ? 'bg-green-100 text-green-700' :
                          activeDataset.trainingStatus === 'training' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                          activeDataset.trainingStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activeDataset.trainingStatus === 'ready' ? '✓ Trained' :
                           activeDataset.trainingStatus === 'training' ? '⏳ Training...' :
                           activeDataset.trainingStatus === 'failed' ? '✕ Failed' : '○ Untrained'}
                        </span>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {activeDataset.tags?.map((tag) => (
                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">#{tag}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button onClick={() => handleExport(activeDataset.id)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">📥 Export</button>
                      <button onClick={() => setShowVersionDialog(true)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">🏷 Version</button>
                      <button onClick={() => setShowTrainingDialog(true)} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-all">🧠 Train Model</button>
                      <button onClick={() => setShowAnnotation(true)} className="rounded-xl border border-amber-200 px-4 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors">🏷 Annotate</button>
                      <button onClick={() => {
                        const wlasl = generateSampleWLASLData();
                        const ds = convertWLASLToDataset(wlasl, activeDataset.language);
                        downloadDatasetFile(ds);
                        addToast('Downloading WLASL-format sample dataset', 'info');
                      }} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">🌐 Download Sample</button>
                      <button onClick={() => removeDataset(activeDataset.id)} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">🗑 Remove</button>
                    </div>
                  </div>

                  {/* Version History */}
                  {activeDataset.versionHistory && activeDataset.versionHistory.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Version History</h4>
                      <div className="space-y-2">
                        {[...activeDataset.versionHistory].reverse().map((v, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-gray-700">v{v.version}</span>
                              <span className="text-gray-400 ml-2">{v.changes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                              <button onClick={() => { rollbackToVersion(activeDataset.id, v.version); addToast(`Rolled back to v${v.version}`, 'info'); }} className="text-primary-600 hover:text-primary-700 font-medium">Rollback</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category breakdown */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
                    <div className="space-y-2">
                      {allCategories.map((cat) => {
                        const count = activeDataset.gestures.filter((g) => g.category === cat).length;
                        const pct = (count / activeDataset.gestures.length) * 100;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs mb-1"><span className="capitalize text-gray-600">{cat}</span><span className="text-gray-400">{count}</span></div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Version dialog */}
      {showVersionDialog && activeDataset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowVersionDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Create New Version</h3>
            <p className="text-sm text-gray-500 mb-4">Current version: v{activeDataset.version} · {activeDataset.sampleCount} gestures</p>
            <textarea value={versionChanges} onChange={(e) => setVersionChanges(e.target.value)} placeholder="Describe changes in this version..." rows={3} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowVersionDialog(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => {
                if (!versionChanges.trim()) { addToast('Describe the changes', 'warning'); return; }
                createVersion(activeDataset.id, versionChanges);
                setShowVersionDialog(false);
                setVersionChanges('');
                addToast(`Version v${parseFloat(activeDataset.version) + 0.1} created`, 'success');
              }} className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all">Create Version</button>
            </div>
          </div>
        </div>
      )}

      {/* Training Dialog */}
      {showTrainingDialog && activeDataset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { if (!trainingProgress) setShowTrainingDialog(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Train Model on &ldquo;{activeDataset.name}&rdquo;</h3>
            <p className="text-sm text-gray-500 mb-4">{activeDataset.gestures.length} gesture samples · {activeDataset.categories.length} classes</p>

            {!trainingProgress ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  <p className="font-medium">How training works</p>
                  <p className="text-xs mt-1">Builds a neural network classifier on your gesture landmarks. Uses TensorFlow.js with WebGL acceleration. Model is saved to browser storage.</p>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Input: 63 features (21 landmarks × 3 coords)</p>
                  <p>• Architecture: Dense(128) → Dense(64) → Softmax</p>
                  <p>• Epochs: 50 · Batch: 32 · LR: 0.001</p>
                  <p>• Validation split: 20%</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowTrainingDialog(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={async () => {
                    setTrainingProgress({ epoch: 0, total: 50, loss: 0, accuracy: 0 });
                    setTrainingStatus(activeDataset.id, 'training');
                    try {
                      const ready = await initializeTF();
                      if (!ready) { addToast('TensorFlow.js initialization failed', 'error'); setShowTrainingDialog(false); return; }

                      const labels = [...new Set(activeDataset.gestures.map((g) => g.name))];
                      const samples = activeDataset.gestures.map((g) => ({ landmarks: g.landmarks, label: g.name }));
                      const model = await buildModel(labels.length);
                      const result = await trainModel(model, samples, labels, undefined, (p) => {
                        setTrainingProgress({ epoch: p.epoch, total: p.totalEpochs, loss: p.loss, accuracy: p.accuracy });
                      });

                      await saveModel(result.model, activeDataset.id);
                      setTrainingStatus(activeDataset.id, 'ready', {
                        accuracy: result.accuracy,
                        loss: result.loss,
                        epochs: 50,
                        trainedAt: new Date().toISOString(),
                      });
                      addToast(`Model trained! Accuracy: ${(result.accuracy * 100).toFixed(1)}%`, 'success');
                    } catch (err) {
                      setTrainingStatus(activeDataset.id, 'failed');
                      addToast('Training failed: ' + (err instanceof Error ? err.message : 'unknown error'), 'error');
                    }
                    setTrainingProgress(null);
                    setShowTrainingDialog(false);
                  }} className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-all">
                    Start Training
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-semibold text-gray-900">Training...</p>
                  <p className="text-sm text-gray-500">Epoch {trainingProgress.epoch} of {trainingProgress.total}</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((trainingProgress.epoch / trainingProgress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${(trainingProgress.epoch / trainingProgress.total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                      <p className="text-xs text-green-600 mb-0.5">Accuracy</p>
                      <p className="text-lg font-bold text-green-700">{(trainingProgress.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
                      <p className="text-xs text-red-600 mb-0.5">Loss</p>
                      <p className="text-lg font-bold text-red-700">{trainingProgress.loss.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annotation Validator */}
      {showAnnotation && activeDataset && (
        <AnnotationValidator
          datasetName={activeDataset.name}
          samples={activeDataset.gestures}
          onSave={(annotated) => {
            const approved = annotated.filter((a) => a.annotationStatus === 'approved');
            const rejected = annotated.filter((a) => a.annotationStatus === 'rejected');
            addToast(`Saved: ${approved.length} approved, ${rejected.length} rejected`, 'success');
            setShowAnnotation(false);
          }}
          onClose={() => setShowAnnotation(false)}
        />
      )}

      {/* Import URL input */}
      {importUrl && (
        <div className="fixed bottom-4 right-4 z-50 w-96 rounded-2xl bg-white shadow-2xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Import from URL</p>
          <input type="text" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://example.com/dataset.json" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2" />
          <div className="flex gap-2">
            <button onClick={async () => {
              try {
                const res = await fetch(importUrl);
                const text = await res.text();
                const result = importFromJson(text);
                addToast(result.success ? `Imported from URL (${result.dataset?.gestures.length} gestures)` : result.error || 'Import failed', result.success ? 'success' : 'error');
              } catch { addToast('Failed to fetch URL', 'error'); }
              setImportUrl('');
            }} className="flex-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white">Fetch & Import</button>
            <button onClick={() => setImportUrl('')} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
