import { create } from 'zustand';
import type { GestureDataset, GestureSample, DatasetImportResult, DatasetVersion } from './dataset-types';

interface DatasetState {
  datasets: GestureDataset[];
  activeDatasetId: string | null;
  isLoading: boolean;

  addDataset: (dataset: GestureDataset) => void;
  removeDataset: (id: string) => void;
  setActiveDataset: (id: string | null) => void;
  addGestureToDataset: (datasetId: string, gesture: GestureSample) => void;
  removeGestureFromDataset: (datasetId: string, gestureId: string) => void;
  createVersion: (datasetId: string, changes: string) => void;
  rollbackToVersion: (datasetId: string, version: string) => void;
  setTrainingStatus: (datasetId: string, status: GestureDataset['trainingStatus'], metrics?: GestureDataset['trainingMetrics']) => void;
  importFromJson: (json: string) => DatasetImportResult;
  exportToJson: (datasetId: string) => string | null;
  loadBuiltin: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'emirsign_datasets';

function saveToStorage(datasets: GestureDataset[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets)); } catch {}
}
function loadFromStorage(): GestureDataset[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function generateId(): string { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: loadFromStorage(),
  activeDatasetId: null,
  isLoading: false,

  addDataset: (dataset) => {
    const enriched = { ...dataset, id: dataset.id || generateId() };
    set((s) => {
      const updated = [...s.datasets, enriched];
      saveToStorage(updated);
      return { datasets: updated, activeDatasetId: enriched.id };
    });
  },

  removeDataset: (id) => {
    set((s) => {
      const updated = s.datasets.filter((d) => d.id !== id);
      saveToStorage(updated);
      return { datasets: updated, activeDatasetId: s.activeDatasetId === id ? null : s.activeDatasetId };
    });
  },

  setActiveDataset: (id) => set({ activeDatasetId: id }),

  addGestureToDataset: (datasetId, gesture) => {
    set((s) => {
      const updated = s.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        const newGesture = { ...gesture, id: gesture.id || generateId() };
        return { ...d, gestures: [...d.gestures, newGesture], sampleCount: d.sampleCount + 1, updatedAt: new Date().toISOString() };
      });
      saveToStorage(updated);
      return { datasets: updated };
    });
  },

  removeGestureFromDataset: (datasetId, gestureId) => {
    set((s) => {
      const updated = s.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        return { ...d, gestures: d.gestures.filter((g) => g.id !== gestureId), sampleCount: d.sampleCount - 1, updatedAt: new Date().toISOString() };
      });
      saveToStorage(updated);
      return { datasets: updated };
    });
  },

  createVersion: (datasetId, changes) => {
    set((s) => {
      const updated = s.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        const newVersion: DatasetVersion = {
          version: `${parseFloat(d.version) + 0.1}`,
          createdAt: new Date().toISOString(),
          sampleCount: d.sampleCount,
          changes,
        };
        return {
          ...d,
          version: newVersion.version,
          versionHistory: [...(d.versionHistory || []), newVersion],
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(updated);
      return { datasets: updated };
    });
  },

  rollbackToVersion: (datasetId, version) => {
    set((s) => {
      const updated = s.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        return { ...d, version, updatedAt: new Date().toISOString() };
      });
      saveToStorage(updated);
      return { datasets: updated };
    });
  },

  setTrainingStatus: (datasetId, status, metrics) => {
    set((s) => {
      const updated = s.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        return { ...d, trainingStatus: status, trainingMetrics: metrics || d.trainingMetrics };
      });
      saveToStorage(updated);
      return { datasets: updated };
    });
  },

  importFromJson: (json) => {
    try {
      const parsed = JSON.parse(json) as GestureDataset;
      if (!parsed.name || !Array.isArray(parsed.gestures)) {
        return { success: false, dataset: null, error: 'Invalid dataset format. Required: name (string) + gestures (array)' };
      }
      const dataset: GestureDataset = {
        ...parsed,
        id: parsed.id || generateId(),
        createdAt: parsed.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        gestures: parsed.gestures.map((g, i) => ({
          ...g,
          id: g.id || `${generateId()}-${i}`,
          category: g.category || 'custom',
        })),
      };
      get().addDataset(dataset);
      return { success: true, dataset };
    } catch (err) {
      return { success: false, dataset: null, error: 'Invalid JSON: ' + (err instanceof Error ? err.message : 'parse error') };
    }
  },

  exportToJson: (datasetId) => {
    const dataset = get().datasets.find((d) => d.id === datasetId);
    return dataset ? JSON.stringify(dataset, null, 2) : null;
  },

  loadBuiltin: () => {
    set({ isLoading: true });
    try {
      const existing = get().datasets;
      if (existing.length === 0) {
        import('./sample-datasets').then((mod) => {
          const stored = loadFromStorage();
          const merged = [...mod.builtinDatasets, ...stored];
          saveToStorage(merged);
          set({ datasets: merged, isLoading: false });
        });
      } else {
        set({ isLoading: false });
      }
    } catch { set({ isLoading: false }); }
  },

  clearAll: () => { saveToStorage([]); set({ datasets: [], activeDatasetId: null }); },
}));
