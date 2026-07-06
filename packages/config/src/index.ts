export const APP_CONFIG = {
  name: 'EmirSign AI',
  version: '0.1.0',
  description: 'Enterprise AI platform for Emirati Sign Language translation',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
} as const;

export const AUTH_CONFIG = {
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
} as const;

export const STORAGE_CONFIG = {
  endpoint: process.env.STORAGE_ENDPOINT || 'localhost',
  port: parseInt(process.env.STORAGE_PORT || '9000', 10),
  accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  bucketName: process.env.STORAGE_BUCKET_NAME || 'emirsign',
  useSsl: process.env.STORAGE_USE_SSL === 'true',
  region: process.env.STORAGE_REGION || 'auto',
} as const;

export const AI_SERVICE_CONFIG = {
  visionUrl: process.env.VISION_SERVICE_URL || 'http://localhost:8001',
  nlpUrl: process.env.NLP_SERVICE_URL || 'http://localhost:8002',
  speechUrl: process.env.SPEECH_SERVICE_URL || 'http://localhost:8003',
} as const;

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  authMaxRequests: 10,
} as const;

export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const SUPPORTED_LANGUAGES = {
  esl: 'Emirati Sign Language',
  ar: 'Arabic',
  en: 'English',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
