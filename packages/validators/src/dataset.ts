import { z } from 'zod';

export const createDatasetSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  language: z.enum(['esl', 'ar', 'en']),
});

export const annotationSchema = z.object({
  frameNumber: z.number().int().min(0),
  landmarksJson: z.string(),
  gestureLabel: z.string().min(1),
  sentenceLabel: z.string().optional(),
});

export const datasetSchemas = {
  create: createDatasetSchema,
  annotation: annotationSchema,
};
