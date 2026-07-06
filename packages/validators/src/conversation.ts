import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  languagePair: z.enum(['esl-ar', 'esl-en', 'ar-esl', 'en-esl']),
});

export const addMessageSchema = z.object({
  senderType: z.enum(['USER', 'SYSTEM', 'INTERPRETER']),
  contentType: z.enum(['SIGN', 'TEXT', 'SPEECH', 'AVATAR']),
  content: z.string().min(1),
  translationAr: z.string().optional(),
  translationEn: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const conversationSchemas = {
  create: createConversationSchema,
  addMessage: addMessageSchema,
};
