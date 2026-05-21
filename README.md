# ShortsAI Studio 🎬⚡

> AI-powered platform that automatically converts long videos into viral YouTube Shorts, Instagram Reels, TikToks and Facebook Reels.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase)](https://supabase.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Viral Detection | GPT-4 + Gemini detects viral moments, emotional peaks, hooks |
| ✂️ Auto Clipping | Create 10+ shorts from one long video automatically |
| 📐 9:16 Reframing | YOLO face tracking + smart crop for vertical format |
| 💬 AI Captions | Whisper AI — Hindi & English, animated styles |
| 🖼️ Thumbnail Generator | AI high-CTR thumbnails with facial expression detection |
| 🔥 Viral Score | Per-clip AI viral potential prediction (0–100%) |
| 📊 SEO Tools | AI titles, descriptions, hashtags, hooks (Hindi + EN) |
| 🎬 Studio Editor | Drag-drop timeline, trim, captions, stickers, overlays |
| 🚀 One-Click Export | Direct upload to YouTube, Instagram, TikTok, Facebook |
| 🎵 Audio AI | Noise reduction, voice enhancement, background music sync |

---

## 🏗️ Architecture

```
f:/MY APP/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Design system CSS
│   │   ├── dashboard/          # Protected dashboard
│   │   │   ├── layout.tsx      # Sidebar layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   └── studio/         # Video studio editor
│   │   └── api/                # Next.js API routes
│   │       ├── upload/         # Video upload handler
│   │       ├── analyze/        # GPT-4 viral analysis
│   │       ├── transcribe/     # Whisper transcription
│   │       └── generate/       # Title/hashtag generation
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── sections/           # Hero, Features, Pricing, etc.
│   │   └── ui/                 # Animations, AuthModal
│   └── lib/
│       ├── supabase/           # Supabase client + types
│       └── utils.ts            # Utility functions
├── backend/                    # Python AI processing server
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   └── processing/
│       ├── whisper_transcribe.py   # Whisper AI transcription
│       ├── yolo_tracker.py         # YOLOv8 face tracking
│       ├── ffmpeg_editor.py        # FFmpeg video processing
│       └── viral_detector.py       # GPT-4 viral detection
└── supabase/
    └── schema.sql              # Database schema + RLS
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org))
- **Python** 3.10+ ([download](https://python.org))
- **FFmpeg** ([download](https://ffmpeg.org/download.html)) — add to PATH
- **Supabase** account ([free tier](https://supabase.com))
- **OpenAI** API key ([get one](https://platform.openai.com))

### 1. Install Frontend Dependencies

```bash
cd "f:/MY APP"
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual keys
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** and create 3 buckets:
   - `videos` — private, 8GB max file size
   - `shorts` — public
   - `thumbnails` — public

### 4. Start the Frontend

```bash
npm run dev
# App runs at http://localhost:3000
```

### 5. Start the Python Processing Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python main.py
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

## 🌐 Deployment

### Frontend — Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in Vercel Dashboard > Settings > Environment Variables.

### Python Backend — Railway / Render / AWS EC2

**Railway (easiest):**
```bash
railway init
railway up
```

**Docker:**
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**For GPU acceleration (YOLO):** Use AWS EC2 G4dn or RunPod with CUDA.

---

## 🔑 API Reference

### `POST /api/upload`
Upload a video file for processing.
- Body: `multipart/form-data` with `video` field
- Returns: `{ projectId, status, estimatedTime }`

### `POST /api/analyze`
Analyze a transcript for viral moments.
- Body: `{ transcript: string, language: string }`
- Returns: `{ viralScore, moments[], hooks[], suggestedTitles[], hashtags[] }`

### `POST /api/transcribe`
Transcribe video audio to text.
- Body: `{ audioUrl: string, language: string }`
- Returns: `{ transcript: { text, segments[], language } }`

### `POST /api/generate`
Generate AI content tools.
- Body: `{ title, niche, language, tone }`
- Returns: `{ titles[], hooks[], hashtags[], description, hindiTitle }`

---

## 🎨 Design System

The app uses a premium **Black + Red cinematic theme**:

- **Primary Red:** `#E5192A`
- **Dark Background:** `#050507` → `#111118`
- **Glassmorphism cards** with `backdrop-blur-xl`
- **Font:** Inter (body) + Outfit (display/headings)
- **Animations:** Framer Motion — floating, glow pulse, stagger children

All design tokens are in `tailwind.config.ts` and `globals.css`.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Made with ❤️ for creators · <a href="https://shortsai.studio">shortsai.studio</a></p>
