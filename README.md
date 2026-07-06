# EmirSign AI — Engineering Blueprint

**Version:** 1.0.0
**Region:** United Arab Emirates
**Organization:** Xenolink
**Status:** MVP Development

---

## Executive Summary

EmirSign AI is an enterprise-grade AI platform that translates Emirati Sign Language (ESL) into Arabic and English in real time, and converts speech back into animated sign language via a 3D avatar.

### Mission

Bridge communication between Deaf and hearing communities in the UAE through AI-powered real-time sign language translation.

### Primary Platforms

- **Web** — Next.js 14+ (App Router)
- **Mobile** — React Native (Expo)
- **Admin Portal** — Next.js (embedded in web app)
- **Desktop** — Electron (future)

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Web | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Frontend Mobile | React Native, Expo, TypeScript |
| Backend API | NestJS, TypeScript |
| AI Services | FastAPI, Python 3.11+ |
| Database | PostgreSQL 16, Redis 7 |
| Object Storage | Cloudflare R2 / MinIO (local) |
| Vision AI | MediaPipe, OpenCV, YOLO |
| ML Framework | PyTorch, ONNX Runtime |
| Speech Recognition | OpenAI Whisper |
| Text-to-Speech | Piper TTS |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (production) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana |

### What We Are Building (MVP)

1. Real-time hand/face/body landmark detection via webcam
2. Gesture classification from landmarks
3. Basic ESL to Arabic/English translation
4. Speech-to-text (Arabic + English)
5. Text-to-speech output
6. User authentication with JWT + RBAC
7. Conversation history storage
8. Admin dashboard for analytics
9. Dataset upload and management interface

### What We Are NOT Building (Yet)

- 3D avatar sign generation (Phase 3+)
- Offline on-device models
- AR/Smart glasses integration
- Hospital/Airport EMR integrations
- Government API integrations
- Multi-region deployment

### Final Goal

A production-ready platform serving 10M+ users across UAE with <300ms end-to-end latency, 95%+ recognition accuracy, and 99.9% availability.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Web App  │  │ Mobile   │  │ Admin    │  │ Kiosk/TV (future)│   │
│  │ Next.js  │  │ React    │  │ Portal   │  │                  │   │
│  │          │  │ Native   │  │          │  │                  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │             │
└───────┼──────────────┼──────────────┼──────────────────┼─────────────┘
        │              │              │                  │
        └──────────────┼──────────────┼──────────────────┘
                       │   HTTPS/WSS  │
                       ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    NGINX / Traefik                            │   │
│  │              Rate Limiting / SSL / Load Balancing             │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
┌───────────────────┐ ┌────────────┐ ┌────────────────┐
│   NestJS API      │ │  FastAPI   │ │  FastAPI       │
│   (Business)      │ │  (Vision)  │ │  (NLP/Speech)  │
│                   │ │            │ │                │
│  - Auth           │ │  - MediaPipe│ │  - Whisper     │
│  - Users          │ │  - OpenCV  │ │  - Piper TTS   │
│  - Sessions       │ │  - YOLO    │ │  - Translation │
│  - History        │ │  - Pose    │ │  - LLM Agent   │
│  - Analytics      │ │  - Hands   │ │                │
│  - Notifications  │ │  - Face    │ │                │
└────────┬──────────┘ └─────┬──────┘ └───────┬────────┘
         │                  │                │
         │         ┌────────┘                │
         │         │                         │
         ▼         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │
│  │PostgreSQL │  │   Redis   │  │  R2/MinIO │  │  Model Store   │  │
│  │ (Primary) │  │  (Cache)  │  │ (Storage) │  │  (ONNX/PyTorch)│  │
│  └───────────┘  └───────────┘  └───────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ML OPS LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Model Registry│  │ Training     │  │ Dataset Manager          │  │
│  │              │  │ Pipelines    │  │ - Upload/Annotate        │  │
│  │ - Versioning │  │              │  │ - Validation             │  │
│  │ - A/B Test   │  │ - PyTorch    │  │ - Versioning             │  │
│  │ - Rollback   │  │ - ONNX       │  │ - Statistics             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow — Sign Language Translation

```
Camera Frame (30fps)
    │
    ▼
[Preprocessing] → Resize, Normalize, BGR→RGB
    │
    ▼
[MediaPipe Holistic] → Hands (21 landmarks × 2)
                       → Face (468 landmarks)
                       → Pose (33 landmarks)
    │
    ▼
[Feature Extraction] → Flatten landmarks → Temporal window (30 frames)
    │
    ▼
[Gesture Classifier] → Transformer + TCN → Predicted gesture ID
    │
    ▼
[Sequence Builder] → Accumulate gestures → Apply attention → Build sentence
    │
    ▼
[Translation Engine] → ESL → Arabic text
                     → ESL → English text
    │
    ▼
[Output] → Display text on screen
         → (Future) Drive avatar
         → (Future) Generate speech
```

---

## Data Flow — Speech Translation

```
Audio Input (Microphone)
    │
    ▼
[Whisper ASR] → Audio → Arabic text
               → Audio → English text
    │
    ▼
[Translation Engine] → Arabic → ESL notation
                     → English → ESL notation
    │
    ▼
[Avatar Engine (Future)] → Drive 3D avatar signing
    │
    ▼
[Output] → Display text
         → Play avatar animation
```

---

## Monorepo Structure

```
emirsign-ai/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml              # Main CI pipeline
│       ├── cd.yml              # Deployment pipeline
│       ├── ai-tests.yml        # AI model tests
│       └── release.yml         # Release automation
│
├── apps/                       # Application packages
│   ├── web/                    # Next.js 14 Web Application
│   ├── mobile/                 # React Native (Expo) Mobile App
│   ├── admin/                  # Next.js Admin Portal (separate route)
│   └── api/                    # NestJS Backend API
│
├── services/                   # AI Microservices
│   ├── vision/                 # FastAPI — Computer Vision Service
│   ├── nlp/                    # FastAPI — NLP & Translation Service
│   ├── speech/                 # FastAPI — Speech Recognition & TTS
│   ├── avatar/                 # FastAPI — Avatar Animation Engine
│   └── agents/                 # FastAPI — AI Agent Framework
│
├── packages/                   # Shared packages
│   ├── ui/                     # Shared UI components (React)
│   ├── ui-native/              # Shared UI components (React Native)
│   ├── config/                 # Shared configuration
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   ├── validators/             # Zod validation schemas
│   ├── database/               # Prisma schema + client
│   ├── redis/                  # Redis client wrapper
│   ├── storage/                # Object storage client (R2/S3)
│   ├── auth/                   # Auth utilities (JWT, sessions)
│   ├── logger/                 # Structured logging
│   ├── analytics/              # Analytics client
│   └── notifications/          # Notification service client
│
├── ml/                         # Machine Learning assets
│   ├── models/                 # Pre-trained model files (.onnx, .pt)
│   ├── datasets/               # Dataset management
│   │   ├── raw/                # Raw video/image data
│   │   ├── processed/          # Processed & augmented data
│   │   ├── annotations/        # Landmark annotations
│   │   └── splits/             # Train/val/test splits
│   ├── training/               # Training scripts
│   │   ├── gesture/            # Gesture classification training
│   │   ├── sequence/           # Sequence recognition training
│   │   ├── translation/        # Translation model training
│   │   └── evaluation/         # Evaluation scripts
│   ├── pipelines/              # Training pipelines
│   ├── configs/                # Model configs (YAML)
│   ├── notebooks/              # Jupyter notebooks (exploration)
│   └── exports/                # Exported models (ONNX)
│
├── infrastructure/             # Infrastructure as Code
│   ├── docker/                 # Dockerfiles
│   │   ├── api/
│   │   ├── vision/
│   │   ├── nlp/
│   │   ├── speech/
│   │   └── nginx/
│   ├── kubernetes/             # Kubernetes manifests
│   │   ├── base/
│   │   ├── overlays/
│   │   └── helm/
│   ├── terraform/              # Terraform configs (cloud)
│   └── scripts/                # Infrastructure scripts
│
├── docs/                       # Documentation
│   ├── architecture/           # Architecture decision records
│   ├── api/                    # API documentation (OpenAPI)
│   ├── ai/                     # AI model documentation
│   ├── deployment/             # Deployment guides
│   └── guides/                 # Developer guides
│
├── tools/                      # Development tools
│   ├── eslint-config/          # Shared ESLint config
│   ├── tsconfig/               # Shared TypeScript configs
│   ├── scripts/                # Build/dev scripts
│   └── generators/             # Code generators
│
├── docker-compose.yml          # Local development stack
├── docker-compose.prod.yml     # Production stack
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root package.json
├── .env.example                # Environment variables template
├── .gitignore
├── .nvmrc                      # Node version
├── .python-version             # Python version
├── Makefile                    # Common commands
└── README.md                   # This file
```

---

## Module Breakdown

### Module 1: Authentication

**Goal:** Secure user access with JWT and RBAC.

**Features:**
- Email/password registration
- Email/password login
- OAuth (Google, Apple — future)
- JWT access + refresh tokens
- Role-based access control (Admin, User, Interpreter)
- Password reset flow
- Email verification
- Rate limiting on auth endpoints

**Dependencies:** PostgreSQL, Redis (token blacklist)

**Outputs:** Authenticated user session, user profile

---

### Module 2: Vision Engine

**Goal:** Extract skeletal landmarks from camera frames in real time.

**Features:**
- Camera frame capture (30fps)
- MediaPipe Holistic integration
- Hand landmark detection (21 points × 2 hands)
- Face mesh detection (468 points)
- Body pose detection (33 points)
- Landmark normalization
- Temporal windowing (sliding window of N frames)
- Confidence scoring

**Dependencies:** GPU (optional), MediaPipe, OpenCV

**Outputs:** JSON landmark sequences, confidence scores

---

### Module 3: Gesture Recognition

**Goal:** Classify individual gestures from landmark sequences.

**Features:**
- Gesture classifier (Transformer + TCN)
- Real-time inference via ONNX Runtime
- Top-K predictions with confidence
- Unknown gesture detection (threshold)
- Gesture vocabulary management
- Batch inference for training

**Dependencies:** Vision Engine, ONNX Runtime, PyTorch

**Outputs:** Gesture ID, confidence score, timestamp

---

### Module 4: Sequence Recognition

**Goal:** Combine individual gestures into meaningful sentences.

**Features:**
- Temporal aggregation (sliding window)
- Attention mechanism for context
- LSTM/Transformer sequence model
- Sentence boundary detection
- Punctuation prediction
- Grammar correction (ESL-specific)

**Dependencies:** Gesture Recognition, Translation Engine

**Outputs:** Structured sentence (token sequence)

---

### Module 5: Translation Engine

**Goal:** Translate between ESL notation and spoken languages.

**Features:**
- ESL → Arabic text
- ESL → English text
- Arabic text → ESL notation (for avatar)
- English text → ESL notation
- Dialect-aware Arabic (Gulf Arabic)
- Confidence scoring
- Fallback handling (unknown phrases)

**Dependencies:** Sequence Recognition, NLP models

**Outputs:** Translated text in target language

---

### Module 6: Speech Recognition

**Goal:** Convert spoken Arabic/English to text.

**Features:**
- Real-time audio streaming
- Whisper model integration
- Arabic speech recognition
- English speech recognition
- Language auto-detection
- Punctuation restoration
- Speaker diarization (future)

**Dependencies:** Whisper, audio preprocessing

**Outputs:** Transcribed text, language tag, timestamps

---

### Module 7: Text-to-Speech

**Goal:** Convert text to natural-sounding voice.

**Features:**
- Arabic TTS (Gulf dialect)
- English TTS
- Voice selection
- Speed control
- Streaming audio output
- Offline TTS (Piper)

**Dependencies:** Piper TTS, audio processing

**Outputs:** Audio stream (WAV/MP3)

---

### Module 8: Avatar Engine (Phase 3+)

**Goal:** Generate animated sign language from text.

**Features:**
- 3D avatar rendering
- Sign language animation
- Facial expression mapping
- Body movement generation
- Real-time streaming
- Multiple avatar models

**Dependencies:** Translation Engine, 3D models, WebGL/Three.js

**Outputs:** Video stream of avatar signing

---

### Module 9: AI Agent Framework

**Goal:** Orchestrate multi-step AI workflows.

**Features:**
- Agent definition (system prompt + tools)
- Tool execution (vision, translation, speech)
- Conversation memory
- Context management
- Multi-agent orchestration
- Human-in-the-loop validation
- Feedback collection

**Dependencies:** All AI services

**Outputs:** Agent responses, tool call results

---

### Module 10: Dataset Management

**Goal:** Manage training data for model improvement.

**Features:**
- Video upload (chunked)
- Image upload
- Automatic landmark extraction
- Manual annotation interface
- Annotation validation
- Dataset versioning
- Train/val/test splitting
- Statistics dashboard
- Export formats (COCO, custom)

**Dependencies:** Vision Engine, Object Storage, PostgreSQL

**Outputs:** Annotated datasets, dataset metadata

---

### Module 11: Model Registry

**Goal:** Version and manage AI models.

**Features:**
- Model upload and storage
- Version management (semantic versioning)
- Model metadata (accuracy, latency, size)
- A/B testing support
- Canary deployments
- Rollback capability
- Model comparison dashboard
- ONNX export/import

**Dependencies:** Object Storage, PostgreSQL

**Outputs:** Model versions, deployment configs

---

### Module 12: Admin Dashboard

**Goal:** Monitor and manage the platform.

**Features:**
- User management (CRUD, roles)
- Analytics dashboard
- Dataset management UI
- Model deployment UI
- System health monitoring
- Feedback review
- Conversation history review
- System configuration

**Dependencies:** All backend services

**Outputs:** Admin actions, reports

---

### Module 13: Conversation History

**Goal:** Store and retrieve conversation records.

**Features:**
- Conversation session creation
- Message logging (sign/text/speech)
- Translation history
- Video reference storage
- Timestamp tracking
- Search and filter
- Export functionality
- Retention policies

**Dependencies:** PostgreSQL, Object Storage

**Outputs:** Conversation records

---

### Module 14: Analytics

**Goal:** Track platform usage and performance.

**Features:**
- Usage metrics (DAU, MAU)
- Translation accuracy tracking
- Latency monitoring
- Error rate tracking
- Feature adoption metrics
- Custom event tracking
- Dashboard visualization
- Export reports

**Dependencies:** PostgreSQL, Redis, Prometheus

**Outputs:** Analytics dashboards, reports

---

### Module 15: Notifications

**Goal:** Send real-time and push notifications.

**Features:**
- In-app notifications
- Push notifications (FCM/APNs)
- Email notifications
- Notification preferences
- Notification history
- Templates management

**Dependencies:** Redis (pub/sub), FCM, APNs

**Outputs:** Delivered notifications

---

## Database Schema (Core Tables)

```sql
-- Users & Authentication
users                   (id, email, password_hash, name, role, avatar_url, email_verified, created_at, updated_at)
user_sessions           (id, user_id, refresh_token, device_info, expires_at, created_at)
email_verifications     (id, user_id, token, expires_at, created_at)
password_resets         (id, user_id, token, expires_at, created_at)

-- Conversations
conversations           (id, user_id, title, language_pair, status, created_at, updated_at)
conversation_messages   (id, conversation_id, sender_type, content_type, content, translation_ar, translation_en, confidence, created_at)
conversation_video_refs (id, message_id, storage_key, duration_ms, thumbnail_key)

-- Datasets
datasets                (id, name, description, language, version, status, created_by, created_at, updated_at)
dataset_videos          (id, dataset_id, storage_key, duration_ms, signer_id, lighting, angle, created_at)
dataset_annotations     (id, video_id, frame_number, landmarks_json, gesture_label, sentence_label, annotated_by, created_at)
dataset_splits          (id, dataset_id, split_type, percentage, video_ids, created_at)

-- Models
ml_models               (id, name, type, version, architecture, metrics_json, storage_key, status, created_by, created_at)
ml_model_deployments    (id, model_id, environment, status, traffic_percentage, deployed_at, rolled_back_at)
ml_model_experiments    (id, model_id, name, config_json, metrics_json, status, created_at)

-- Analytics
analytics_events        (id, event_type, user_id, session_id, metadata_json, created_at)
system_metrics          (id, metric_name, metric_value, tags_json, recorded_at)

-- Feedback
feedback                (id, user_id, conversation_id, rating, comment, category, created_at)
```

---

## API Design (Core Endpoints)

### Authentication

```
POST   /api/v1/auth/register          — Register new user
POST   /api/v1/auth/login             — Login
POST   /api/v1/auth/refresh           — Refresh access token
POST   /api/v1/auth/logout            — Logout (invalidate refresh)
POST   /api/v1/auth/forgot-password   — Request password reset
POST   /api/v1/auth/reset-password    — Reset password
POST   /api/v1/auth/verify-email      — Verify email address
GET    /api/v1/auth/me                — Get current user profile
PATCH  /api/v1/auth/me                — Update profile
```

### Conversations

```
POST   /api/v1/conversations                    — Create conversation
GET    /api/v1/conversations                    — List conversations
GET    /api/v1/conversations/:id                — Get conversation
DELETE /api/v1/conversations/:id                — Delete conversation
POST   /api/v1/conversations/:id/messages       — Add message
GET    /api/v1/conversations/:id/messages       — List messages
```

### Vision (AI Service)

```
POST   /api/v1/vision/detect                    — Detect landmarks from image
POST   /api/v1/vision/detect-stream             — WebSocket stream detection
POST   /api/v1/vision/classify                  — Classify gesture from landmarks
```

### Translation (AI Service)

```
POST   /api/v1/translation/esl-to-arabic        — ESL → Arabic
POST   /api/v1/translation/esl-to-english       — ESL → English
POST   /api/v1/translation/text-to-esl          — Text → ESL notation
```

### Speech (AI Service)

```
POST   /api/v1/speech/transcribe                — Audio → Text
POST   /api/v1/speech/synthesize                — Text → Audio
GET    /api/v1/speech/voices                    — List available voices
```

### Datasets

```
POST   /api/v1/datasets                         — Create dataset
GET    /api/v1/datasets                         — List datasets
GET    /api/v1/datasets/:id                     — Get dataset
POST   /api/v1/datasets/:id/videos              — Upload video
POST   /api/v1/datasets/:id/annotate            — Submit annotations
GET    /api/v1/datasets/:id/statistics          — Dataset statistics
```

### Models

```
POST   /api/v1/models                           — Register model
GET    /api/v1/models                           — List models
GET    /api/v1/models/:id                       — Get model details
POST   /api/v1/models/:id/deploy                — Deploy model
POST   /api/v1/models/:id/rollback              — Rollback deployment
```

### Admin

```
GET    /api/v1/admin/dashboard                  — Dashboard stats
GET    /api/v1/admin/users                      — List all users
PATCH  /api/v1/admin/users/:id                  — Update user role
GET    /api/v1/admin/analytics                  — Analytics data
GET    /api/v1/admin/system/health              — System health
```

---

## Phase-by-Phase Execution

### Phase 0 — Project Infrastructure

**Goal:** Create a working monorepo with all services runnable locally.

**Deliverables:**
- Turborepo monorepo with pnpm workspaces
- Docker Compose with PostgreSQL, Redis, MinIO
- Next.js web app (empty shell)
- NestJS API (empty shell with health check)
- FastAPI vision service (empty shell with health check)
- Shared TypeScript types package
- Shared config package (ESLint, TypeScript, Prettier)
- Database schema (Prisma)
- GitHub Actions CI pipeline
- README with setup instructions

**Definition of Done:**
- `pnpm install` works
- `pnpm dev` starts all services
- Docker Compose starts all infrastructure
- All health checks pass
- CI pipeline runs on push

---

### Phase 1 — Authentication

**Goal:** Secure user access with JWT + RBAC.

**Deliverables:**
- User registration (email + password)
- User login (email + password)
- JWT access + refresh tokens
- Password reset flow
- Email verification (stub)
- Role-based access control
- Auth middleware (NestJS guards)
- Auth API endpoints
- Login/Register screens (Web + Mobile)
- Auth integration tests

**Definition of Done:**
- User can register, login, logout
- JWT tokens work correctly
- Protected routes require authentication
- Roles are enforced
- Tests pass

---

### Phase 2 — Camera Pipeline

**Goal:** Capture camera frames and extract landmarks.

**Deliverables:**
- Camera component (Web: getUserMedia, Mobile: expo-camera)
- Frame capture at 30fps
- MediaPipe Holistic integration (Python)
- Landmark extraction endpoint (FastAPI)
- Landmark visualization (debug view)
- WebSocket streaming for real-time detection
- Landmark normalization pipeline
- Unit tests for preprocessing

**Definition of Done:**
- Camera renders in browser and mobile
- Landmarks are detected and visualized
- WebSocket streams landmarks at 30fps
- Latency < 100ms per frame

---

### Phase 3 — Gesture Recognition

**Goal:** Classify individual gestures from landmarks.

**Deliverables:**
- Gesture classifier model (Transformer)
- ONNX export and inference
- Gesture vocabulary (initial: 50 signs)
- Real-time classification endpoint
- Confidence scoring
- Unknown gesture handling
- Training pipeline (initial)
- Model evaluation metrics

**Definition of Done:**
- Gesture classifier runs in <50ms
- Accuracy >80% on test set (initial)
- Unknown gestures are flagged
- Real-time feedback works

---

### Phase 4 — Basic Translation

**Goal:** Translate recognized gestures to text.

**Deliverables:**
- Sequence builder (accumulate gestures)
- Simple dictionary-based translation (ESL → Arabic/English)
- Sentence construction logic
- Translation display UI
- Conversation mode (basic)
- History storage

**Definition of Done:**
- User can sign → see Arabic/English text
- Basic sentences are translated
- History is saved and viewable

---

### Phase 5 — Speech Integration

**Goal:** Add speech recognition and synthesis.

**Deliverables:**
- Whisper integration (ASR)
- Arabic + English transcription
- Piper TTS integration
- Text-to-speech output
- Speech input UI
- Audio streaming pipeline

**Definition of Done:**
- User can speak → see text
- User can hear translated text
- Both Arabic and English work

---

### Phase 6 — Dataset & Training

**Goal:** Enable dataset management and model retraining.

**Deliverables:**
- Dataset upload interface
- Video processing pipeline
- Annotation tool (basic)
- Dataset versioning
- Training pipeline automation
- Model registry
- A/B testing framework

**Definition of Done:**
- Admin can upload videos
- Annotations can be added
- Models can be retrained
- New models can be deployed

---

### Phase 7 — Admin Dashboard

**Goal:** Complete admin interface.

**Deliverables:**
- User management
- Analytics dashboard
- System health monitoring
- Feedback management
- Dataset management UI
- Model management UI

**Definition of Done:**
- All admin features functional
- Dashboard shows real-time data
- System health is visible

---

### Phase 8 — Polish & Launch

**Goal:** Production readiness.

**Deliverables:**
- Performance optimization
- Security audit
- Accessibility audit (WCAG AA)
- Load testing
- Documentation
- Deployment to production
- Monitoring & alerting

**Definition of Done:**
- All tests pass
- <300ms latency achieved
- 95%+ accuracy on benchmark
- Security audit passed
- Production deployment successful

---

## Coding Standards

### TypeScript

- Strict mode enabled
- No `any` types
- Prefer `interface` over `type` for objects
- Use `readonly` for immutable data
- Prefer `const` over `let`
- Use named exports only
- Max function length: 50 lines
- Max file length: 500 lines

### Naming Conventions

```
Files:          kebab-case (user-service.ts)
Classes:        PascalCase (UserService)
Interfaces:     PascalCase (IUserService) or (UserService)
Functions:      camelCase (getUserById)
Variables:      camelCase (userSession)
Constants:      UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
Database:       snake_case (user_sessions)
API Routes:     kebab-case (/api/v1/user-sessions)
React Components: PascalCase (UserProfile)
React Hooks:    camelCase (useAuth)
```

### Folder Naming

```
Feature folders:  kebab-case (user-management)
Package folders:  kebab-case (shared-utils)
Config files:     camelCase (turbo.json) or kebab-case (docker-compose.yml)
```

### Git Branching

```
main            — Production
develop         — Integration branch
feature/*       — Feature branches
fix/*           — Bug fix branches
release/*       — Release preparation
hotfix/*        — Emergency fixes
ai/*            — AI model changes
```

### Commit Messages

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, ci, perf, ai
Scope: auth, vision, speech, translation, admin, api, web, mobile
```

---

## Design Patterns

| Pattern | Usage |
|---------|-------|
| Repository | Database access abstraction |
| Service | Business logic encapsulation |
| Controller | HTTP request handling |
| Guard | Authentication/authorization |
| Interceptor | Cross-cutting concerns (logging, caching) |
| Pipe | Request validation |
| Factory | Object creation (complex objects) |
| Strategy | Algorithm selection (translation engines) |
| Observer | Event handling |
| Pub/Sub | Async communication |
| CQRS | Read/write separation (analytics) |
| Circuit Breaker | External service resilience |
| Retry | Transient failure handling |
| Rate Limit | API protection |

---

## Scalability Considerations (10M Users)

1. **Horizontal Scaling:** All services are stateless, scale via Kubernetes HPA
2. **Database:** Read replicas, connection pooling (PgBouncer), partitioning
3. **Caching:** Redis for sessions, API responses, model predictions
4. **CDN:** Cloudflare for static assets, video thumbnails
5. **Async Processing:** Redis queues for heavy operations (video processing, training)
6. **GPU Scaling:** Dedicated GPU nodes for AI inference, auto-scaling
7. **Edge Computing:** ONNX models on edge devices for offline mode
8. **Database Sharding:** Shard by user_id for conversations/history

---

## Microservice Migration Strategy

The modular monolith is designed for easy extraction:

1. **Phase 1 (Current):** Modular monolith with clear module boundaries
2. **Phase 2:** Extract AI services (already separate FastAPI services)
3. **Phase 3:** Extract auth service (when scaling requires it)
4. **Phase 4:** Extract conversation/history service
5. **Phase 5:** Extract analytics service
6. **Communication:** Event bus (Redis Streams → Kafka) for inter-service communication

Each module communicates through:
- Direct function calls (monolith)
- Internal API calls (transition)
- Event bus (microservices)

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://emirsign:password@localhost:5432/emirsign
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Storage
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=emirsign-storage
R2_PUBLIC_URL=https://storage.emirsign.ai

# AI Services
VISION_SERVICE_URL=http://localhost:8001
NLP_SERVICE_URL=http://localhost:8002
SPEECH_SERVICE_URL=http://localhost:8003

# Whisper
WHISPER_MODEL_SIZE=base

# Piper TTS
PIPER_VOICE_PATH=./voices/ar_SA-Ahmed-medium.onnx

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```
