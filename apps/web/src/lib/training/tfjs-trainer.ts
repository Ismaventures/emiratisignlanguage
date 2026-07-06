'use client';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface TrainingConfig {
  epochs: number;
  learningRate: number;
  batchSize: number;
  validationSplit: number;
  hiddenLayers: number[];
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface TrainingResult {
  model: tf.LayersModel;
  history: TrainingProgress[];
  accuracy: number;
  loss: number;
  labels: string[];
}

const DEFAULT_CONFIG: TrainingConfig = {
  epochs: 50,
  learningRate: 0.001,
  batchSize: 32,
  validationSplit: 0.2,
  hiddenLayers: [128, 64],
};

export async function initializeTF(): Promise<boolean> {
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    return true;
  } catch {
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      return true;
    } catch {
      return false;
    }
  }
}

function landmarksToFeatures(landmarks: number[][]): number[] {
  if (landmarks.length === 0) return new Array(63).fill(0);
  const wrist = landmarks[0];
  const features: number[] = [];
  for (const lm of landmarks) {
    features.push(lm[0] - wrist[0], lm[1] - wrist[1], (lm[2] ?? 0) - (wrist[2] ?? 0));
  }
  while (features.length < 63) features.push(0);
  return features.slice(0, 63);
}

export async function buildModel(
  numClasses: number,
  config: TrainingConfig = DEFAULT_CONFIG,
): Promise<tf.LayersModel> {
  const input = tf.input({ shape: [63] });
  let x = input;

  for (const units of config.hiddenLayers) {
    x = tf.layers.dense({ units, activation: 'relu' }).apply(x) as tf.SymbolicTensor;
    x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor;
    x = tf.layers.dropout({ rate: 0.3 }).apply(x) as tf.SymbolicTensor;
  }

  const output = tf.layers.dense({
    units: numClasses,
    activation: 'softmax',
  }).apply(x) as tf.SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: output });

  const optimizer = tf.train.adam(config.learningRate);
  model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

export async function trainModel(
  model: tf.LayersModel,
  samples: { landmarks: number[][]; label: string }[],
  labels: string[],
  config: TrainingConfig = DEFAULT_CONFIG,
  onProgress?: (progress: TrainingProgress) => void,
): Promise<TrainingResult> {
  const labelMap = new Map(labels.map((l, i) => [l, i]));

  const features: number[][] = [];
  const oneHotLabels: number[][] = [];

  for (const sample of samples) {
    const f = landmarksToFeatures(sample.landmarks);
    features.push(f);
    const oh = new Array(labels.length).fill(0);
    const idx = labelMap.get(sample.label) ?? 0;
    oh[idx] = 1;
    oneHotLabels.push(oh);
  }

  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(oneHotLabels);

  const history: TrainingProgress[] = [];

  const result = await model.fit(xs, ys, {
    epochs: config.epochs,
    batchSize: Math.min(config.batchSize, features.length),
    validationSplit: config.validationSplit,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch: number, logs?: tf.Logs) => {
        const progress: TrainingProgress = {
          epoch: epoch + 1,
          totalEpochs: config.epochs,
          loss: logs?.loss ?? 0,
          accuracy: logs?.acc ?? logs?.accuracy ?? 0,
          valLoss: logs?.val_loss,
          valAccuracy: logs?.val_acc ?? logs?.val_accuracy,
        };
        history.push(progress);
        onProgress?.(progress);
      },
    },
  });

  const finalLoss = result.history.loss[result.history.loss.length - 1] as number;
  const finalAcc = result.history.accuracy
    ? (result.history.accuracy[result.history.accuracy.length - 1] as number)
    : 0;

  xs.dispose();
  ys.dispose();

  return {
    model,
    history,
    accuracy: finalAcc,
    loss: finalLoss,
    labels,
  };
}

export async function saveModel(
  model: tf.LayersModel,
  name: string,
): Promise<boolean> {
  try {
    await model.save(`localstorage://emirsign-model-${name}`);
    return true;
  } catch {
    return false;
  }
}

export async function loadModel(
  name: string,
): Promise<tf.LayersModel | null> {
  try {
    return await tf.loadLayersModel(`localstorage://emirsign-model-${name}`);
  } catch {
    return null;
  }
}

export async function predictGesture(
  model: tf.LayersModel,
  landmarks: number[][],
  labels: string[],
): Promise<{ label: string; confidence: number; scores: { label: string; score: number }[] }> {
  const features = landmarksToFeatures(landmarks);
  const input = tf.tensor2d([features]);
  const output = model.predict(input) as tf.Tensor;
  const probs = await output.data();
  input.dispose();
  output.dispose();

  const scores = Array.from(probs).map((p, i) => ({
    label: labels[i] ?? `class-${i}`,
    score: p,
  }));
  scores.sort((a, b) => b.score - a.score);

  return {
    label: scores[0]?.label ?? 'unknown',
    confidence: scores[0]?.score ?? 0,
    scores,
  };
}

export function getDefaultConfig(): TrainingConfig {
  return { ...DEFAULT_CONFIG };
}
