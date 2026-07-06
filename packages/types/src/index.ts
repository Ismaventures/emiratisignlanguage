// ─── User & Auth ────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'USER' | 'INTERPRETER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ─── Conversations ──────────────────────────────────────────
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type SenderType = 'USER' | 'SYSTEM' | 'INTERPRETER';
export type ContentType = 'SIGN' | 'TEXT' | 'SPEECH' | 'AVATAR';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  languagePair: 'esl-ar' | 'esl-en' | 'ar-esl' | 'en-esl';
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderType: SenderType;
  contentType: ContentType;
  content: string;
  translationAr: string | null;
  translationEn: string | null;
  confidence: number | null;
  createdAt: Date;
}

export interface ConversationVideoRef {
  id: string;
  messageId: string;
  storageKey: string;
  durationMs: number;
  thumbnailKey: string | null;
}

// ─── Vision / Landmarks ─────────────────────────────────────
export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandLandmarks {
  handedness: 'Left' | 'Right';
  landmarks: Landmark3D[];
}

export interface FaceLandmarks {
  landmarks: Landmark3D[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PoseLandmarks {
  landmarks: Landmark3D[];
}

export interface VisionDetection {
  hands: HandLandmarks[];
  face: FaceLandmarks | null;
  pose: PoseLandmarks | null;
  timestamp: number;
  confidence: number;
}

// ─── Gesture Recognition ────────────────────────────────────
export interface GesturePrediction {
  gestureId: string;
  gestureName: string;
  confidence: number;
  timestamp: number;
}

export interface GestureVocabulary {
  id: string;
  name: string;
  category: string;
  description: string;
  language: 'esl';
  createdAt: Date;
}

// ─── Translation ────────────────────────────────────────────
export type TranslationDirection = 'esl-ar' | 'esl-en' | 'ar-esl' | 'en-esl';

export interface TranslationRequest {
  input: string | Landmark3D[];
  direction: TranslationDirection;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  alternatives?: string[];
}

// ─── Speech ─────────────────────────────────────────────────
export interface SpeechTranscription {
  text: string;
  language: string;
  confidence: number;
  segments: SpeechSegment[];
}

export interface SpeechSegment {
  start: number;
  end: number;
  text: string;
}

export interface TTSRequest {
  text: string;
  language: 'ar' | 'en';
  voice?: string;
  speed?: number;
}

// ─── Datasets ───────────────────────────────────────────────
export type DatasetStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'ARCHIVED';
export type SplitType = 'TRAIN' | 'VALIDATION' | 'TEST';

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  language: string;
  version: number;
  status: DatasetStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetVideo {
  id: string;
  datasetId: string;
  storageKey: string;
  durationMs: number;
  signerId: string | null;
  lighting: string | null;
  angle: string | null;
  createdAt: Date;
}

export interface DatasetAnnotation {
  id: string;
  videoId: string;
  frameNumber: number;
  landmarksJson: string;
  gestureLabel: string;
  sentenceLabel: string | null;
  annotatedBy: string;
  createdAt: Date;
}

// ─── ML Models ──────────────────────────────────────────────
export type ModelType = 'GESTURE_CLASSIFIER' | 'SEQUENCE_RECOGNIZER' | 'TRANSLATOR' | 'FACE_MESH';
export type ModelStatus = 'TRAINING' | 'READY' | 'DEPLOYED' | 'ARCHIVED' | 'FAILED';

export interface MLModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  architecture: string;
  metricsJson: Record<string, unknown>;
  storageKey: string;
  status: ModelStatus;
  createdBy: string;
  createdAt: Date;
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  environment: 'staging' | 'production';
  status: 'ACTIVE' | 'INACTIVE' | 'CANARY';
  trafficPercentage: number;
  deployedAt: Date;
  rolledBackAt: Date | null;
}

// ─── Analytics ──────────────────────────────────────────────
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId: string | null;
  sessionId: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
}

// ─── Feedback ───────────────────────────────────────────────
export type FeedbackCategory = 'ACCURACY' | 'LATENCY' | 'UX' | 'BUG' | 'OTHER';

export interface Feedback {
  id: string;
  userId: string;
  conversationId: string | null;
  rating: number;
  comment: string | null;
  category: FeedbackCategory;
  createdAt: Date;
}

// ─── API Responses ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── WebSocket Events ───────────────────────────────────────
export type WSEventType =
  | 'vision:detection'
  | 'vision:gesture'
  | 'translation:result'
  | 'speech:transcription'
  | 'avatar:state'
  | 'error';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: number;
}
