# EmirSign AI — Text-to-Sign Language Translator

A web application that translates English text into **Emirati Sign Language (ESL)** using a **3D animated avatar**.

Type any English sentence and watch a realistic 3D character perform the corresponding sign language gestures in real time.

**Live Demo:** [emirsign.vercel.app](https://emirsign.vercel.app) (deploy on Vercel)

---

## How It Works

```
English Text → AI Translation → ESL Tokens → 3D Avatar Animation
```

1. **You type** an English sentence (e.g., "Thank you very much")
2. **HuggingFace Qwen3-8B** translates it to ESL gloss tokens (e.g., `THANK_YOU`)
3. **3D Avatar** performs the sign language animation with hand gestures, facial expressions, and body movement

---

## Features

- **3D Sign Language Avatar** — Mixamo-rigged humanoid with 65+ bones, finger tracking, and facial expressions
- **AI-Powered Translation** — HuggingFace Qwen3-8B model converts English to ESL tokens
- **26 ESL Signs** — HELLO, THANK_YOU, PLEASE, YES, NO, HELP, GOOD, I, YOU, WHAT, WHERE, HOW, SCHOOL, GO, COME, NAME, GOODBYE, LOVE, SORRY, FRIEND, FAMILY, WORK, WATER, FOOD, EAT, DRINK
- **Facial Expressions** — ARKit 52 blendshapes for smiles, frowns, eyebrow raises
- **Idle Animations** — Automatic blinking, breathing, head turns, shoulder shifts
- **Multiple Avatars** — X Bot, Ready Player Me, Soldier (Mixamo-compatible)
- **Instant Fallback** — Local grammar rules when AI API is unavailable

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| 3D Engine | Three.js, React Three Fiber, Drei |
| Avatar | Mixamo-rigged GLB, ARKit blendshapes |
| AI Translation | HuggingFace Inference API (Qwen3-8B) |
| Sign Database | ESL gloss tokens with BML notation |
| Deployment | Vercel (serverless) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A HuggingFace API key (free tier works)

### Setup

```bash
# Clone the repo
git clone https://github.com/Ismaventures/emiratisignlanguage.git
cd emiratisignlanguage

# Install dependencies
cd apps/web
pnpm install

# Add your HuggingFace API key
echo "NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_your_key_here" > .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

| Email | Password |
|-------|----------|
| `demo@emirsign.ae` | `demo` |
| `ahmed@emirsign.ae` | `ahmed123` |
| `admin@emirsign.ae` | `admin123` |

---

## Deploy on Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Set the **Root Directory** to `apps/web`
5. Add environment variable: `NEXT_PUBLIC_HUGGINGFACE_API_KEY` = your HuggingFace API key
6. Deploy

Your app will be live at `https://your-project.vercel.app` and accessible worldwide.

---

## Project Structure

```
apps/web/
├── public/models/              # 3D avatar GLB files
│   ├── xbot.glb               # Mixamo X Bot (2.79 MB)
│   ├── readyplayer-me.glb      # Ready Player Me (1.75 MB)
│   └── soldier.glb             # Mixamo Soldier (2.06 MB)
├── src/
│   ├── app/
│   │   ├── api/hf/route.ts     # HuggingFace API proxy
│   │   ├── (auth)/login/       # Login page
│   │   └── (dashboard)/
│   │       ├── translate/      # Main translator page
│   │       ├── avatar-lab/     # Avatar testing lab
│   │       └── dashboard/      # Dashboard
│   ├── components/avatar/      # 3D avatar system
│   │   ├── glb-avatar-scene.tsx    # R3F scene + animation
│   │   ├── glb-avatar-viewer.tsx   # Full translator UI
│   │   └── text-to-sign-viewer.tsx # Text input + pipeline
│   └── lib/avatar/             # Core avatar logic
│       ├── rpm-avatar.ts           # GLB loader + bone mapping
│       ├── text-to-sign.ts         # Translation pipeline
│       ├── animation-database.ts   # Sign keyframes
│       ├── animics-skeleton.ts     # Mixamo bone mapping
│       ├── animics-ik.ts           # IK solver
│       ├── animics-blendshapes.ts  # Facial expressions
│       └── esl-sign-database.ts    # ESL sign definitions
```

---

## API

The app uses a Next.js API route (`/api/hf`) as a proxy to HuggingFace. This keeps the API key server-side and avoids CORS issues.

**Request:**
```bash
POST /api/hf
Content-Type: application/json

{"text": "Hello my friend"}
```

**Response:**
```json
{"tokens": ["HELLO", "FRIEND"]}
```

---

## ESL Sign Language Tokens

| Token | English | Handshape | Movement |
|-------|---------|-----------|----------|
| HELLO | Hello | flat_hand | wave |
| THANK_YOU | Thank you | flat_hand | chin_to_forward |
| PLEASE | Please | flat_hand | chest_circle |
| YES | Yes | fist | nod |
| NO | No | flat_hand | side_to_side |
| HELP | Help | flat_hand | upward |
| GOOD | Good | thumbs_up | forward |
| I | I/Me | point | self |
| YOU | You | point | forward |
| WHAT | What | open_palm | shake |
| LOVE | Love | open_palm | cross_chest |
| SORRY | Sorry | fist | chest_circle |
| FRIEND | Friend | interlock | hook |
| FAMILY | Family | open_palm | circle |
| WORK | Work | fist | tap |
| WATER | Water | w_shape | forward |
| FOOD | Food | flat_hand | mouth |

---

## License

Private — Xenolink
