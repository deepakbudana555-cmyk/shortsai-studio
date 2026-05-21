"""
ShortsAI Studio — Python AI Processing Backend
FastAPI server that handles heavy video processing tasks:
  - Whisper AI transcription
  - YOLO face/speaker tracking
  - FFmpeg video clipping & reframing
  - Audio enhancement
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import httpx
import uuid
from supabase import create_client, Client

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
supabase_client: Client | None = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

from processing.whisper_transcribe import transcribe_audio
from processing.yolo_tracker import detect_speakers
from processing.ffmpeg_editor import create_short, enhance_audio, add_captions, generate_thumbnail
from processing.viral_detector import detect_viral_moments

app = FastAPI(
    title="ShortsAI Studio Processing API",
    version="1.0.0",
    description="AI-powered video processing backend for ShortsAI Studio"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────────────────────────

class ProcessRequest(BaseModel):
    project_id: str
    video_url: str
    language: str = "en"
    target_platforms: List[str] = ["youtube_shorts", "instagram_reels", "tiktok"]
    max_shorts: int = 10
    caption_style: str = "bold_impact"
    enhance_audio: bool = True

class ProcessStatus(BaseModel):
    project_id: str
    status: str
    progress: int
    message: str
    shorts: Optional[List[dict]] = None
    error: Optional[str] = None

# ── In-memory job store (use Redis/DB in production) ─────────────────────

jobs: dict[str, ProcessStatus] = {}

# ── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/process", response_model=dict)
async def start_processing(request: ProcessRequest, background_tasks: BackgroundTasks):
    """Start async video processing pipeline."""
    jobs[request.project_id] = ProcessStatus(
        project_id=request.project_id,
        status="queued",
        progress=0,
        message="Job queued. Processing will start shortly."
    )
    background_tasks.add_task(run_pipeline, request)
    return {"success": True, "project_id": request.project_id, "message": "Processing started"}


@app.get("/status/{project_id}", response_model=ProcessStatus)
async def get_status(project_id: str):
    """Poll processing status for a project."""
    if project_id not in jobs:
        raise HTTPException(status_code=404, detail="Project not found")
    return jobs[project_id]


@app.post("/transcribe")
async def transcribe_endpoint(
    audio: UploadFile = File(...),
    language: str = Form("en")
):
    """Transcribe audio using Whisper AI."""
    try:
        content = await audio.read()
        tmp_path = f"/tmp/{audio.filename}"
        with open(tmp_path, "wb") as f:
            f.write(content)
        result = transcribe_audio(tmp_path, language)
        os.remove(tmp_path)
        return {"success": True, "transcript": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Pipeline ─────────────────────────────────────────────────────────────────

async def run_pipeline(request: ProcessRequest):
    """Main AI video processing pipeline."""
    pid = request.project_id

    def update(progress: int, message: str, status: str = "processing"):
        jobs[pid] = ProcessStatus(project_id=pid, status=status, progress=progress, message=message)

    try:
        update(5, "Downloading video from storage...")
        video_filename = f"{pid}_input.mp4"
        video_path = f"/tmp/{video_filename}"
        
        # Download the file
        async with httpx.AsyncClient() as client:
            resp = await client.get(request.video_url, timeout=300.0)
            with open(video_path, "wb") as f:
                f.write(resp.content)

        update(15, "Transcribing audio with Whisper AI...")
        transcript = transcribe_audio(video_path, request.language)

        update(30, "Detecting viral moments with GPT-4...")
        viral_moments = detect_viral_moments(transcript)

        update(45, "Running YOLO face & speaker tracking...")
        speaker_tracks = {}
        try:
            speaker_tracks = detect_speakers(video_path)
        except Exception as e:
            print("YOLO tracking failed, using center crop fallback:", e)

        update(60, "Creating 9:16 short clips with FFmpeg...")
        shorts_data = []
        for i, moment in enumerate(viral_moments[:request.max_shorts]):
            short_id = str(uuid.uuid4())
            short_path = f"/tmp/{short_id}.mp4"
            thumb_path = f"/tmp/{short_id}_thumb.jpg"
            
            # 1. Create short
            create_short(video_path, moment["start_time"], moment["end_time"], short_path, None)
            
            # 2. Enhance audio
            if request.enhance_audio:
                enhanced_path = f"/tmp/{short_id}_enhanced.mp4"
                enhance_audio(short_path, enhanced_path)
                os.replace(enhanced_path, short_path)
                
            # 2.5 Generate SRT and Add Captions
            srt_path = f"/tmp/{short_id}.srt"
            from processing.whisper_transcribe import format_captions_srt
            
            # Extract transcript segments that fall within this moment
            moment_segments = [
                s for s in transcript.get("segments", [])
                if s["end"] >= moment["start_time"] and s["start"] <= moment["end_time"]
            ]
            
            with open(srt_path, "w", encoding="utf-8") as f:
                f.write(format_captions_srt(moment_segments))
                
            captioned_path = f"/tmp/{short_id}_captioned.mp4"
            add_captions(short_path, srt_path, captioned_path, request.caption_style)
            os.replace(captioned_path, short_path)
            
            # 3. Generate thumbnail
            generate_thumbnail(short_path, 1.0, thumb_path)
            
            # 4. Upload to Supabase Storage
            short_url = ""
            thumb_url = ""
            if supabase_client:
                with open(short_path, "rb") as f:
                    supabase_client.storage.from_("shorts").upload(f"{short_id}.mp4", f)
                    short_url = supabase_client.storage.from_("shorts").get_public_url(f"{short_id}.mp4")
                
                with open(thumb_path, "rb") as f:
                    supabase_client.storage.from_("thumbnails").upload(f"{short_id}.jpg", f)
                    thumb_url = supabase_client.storage.from_("thumbnails").get_public_url(f"{short_id}.jpg")
                    
                # Insert to shorts table
                supabase_client.table("shorts").insert({
                    "id": short_id,
                    "project_id": pid,
                    "user_id": request.project_id, # In a real app we'd fetch the user_id from project
                    "title": moment.get("title", f"Short {i+1}"),
                    "video_url": short_url,
                    "thumbnail_url": thumb_url,
                    "viral_score": moment.get("viral_score", 85),
                    "duration": moment["end_time"] - moment["start_time"]
                }).execute()
                
            shorts_data.append({
                "id": short_id,
                "url": short_url,
                "thumbnail": thumb_url,
                "viral_score": moment.get("viral_score", 85),
                "duration": moment["end_time"] - moment["start_time"]
            })
            
            # Cleanup
            if os.path.exists(short_path): os.remove(short_path)
            if os.path.exists(thumb_path): os.remove(thumb_path)
            if os.path.exists(srt_path): os.remove(srt_path)

        update(95, "Cleaning up and finalizing...")
        if os.path.exists(video_path): os.remove(video_path)

        if supabase_client:
            supabase_client.table("projects").update({
                "status": "ready",
                "shorts_count": len(shorts_data)
            }).eq("id", pid).execute()

        jobs[pid] = ProcessStatus(
            project_id=pid,
            status="completed",
            progress=100,
            message="All shorts created successfully!",
            shorts=shorts_data
        )
    except Exception as e:
        print(f"Pipeline error: {e}")
        if supabase_client:
            supabase_client.table("projects").update({"status": "failed"}).eq("id", pid).execute()
            
        jobs[pid] = ProcessStatus(
            project_id=pid, status="failed", progress=0,
            message="Processing failed", error=str(e)
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
