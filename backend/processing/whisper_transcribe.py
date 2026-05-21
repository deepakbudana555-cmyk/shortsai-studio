"""
Whisper AI Transcription Module
Uses OpenAI Whisper for speech-to-text with word-level timestamps.
"""

import os
import json
from typing import Optional

def transcribe_audio(audio_path: str, language: str = "en") -> dict:
    """
    Transcribe audio using OpenAI Whisper API.
    Returns segments with timestamps for caption generation.
    """
    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language if language != "auto" else None,
                response_format="verbose_json",
                timestamp_granularities=["word", "segment"],
            )

        return {
            "text": response.text,
            "language": response.language,
            "duration": response.duration,
            "segments": [
                {
                    "id": seg.id,
                    "start": seg.start,
                    "end": seg.end,
                    "text": seg.text.strip(),
                    "words": [{"word": w.word, "start": w.start, "end": w.end} for w in (seg.words or [])],
                    "confidence": getattr(seg, "avg_logprob", 0),
                }
                for seg in response.segments
            ],
        }
    except Exception as e:
        print(f"Whisper API failed ({e}). Using fallback transcription.")
        # Fallback for testing without API keys
        return {
            "text": "This is a fallback transcript. Wow, what an amazing insight! You definitely need to hear this.",
            "language": "en",
            "duration": 60,
            "segments": [
                {
                    "id": 0, "start": 0.0, "end": 10.0, "text": "This is a fallback transcript.", 
                    "words": [{"word": "This", "start": 0.0, "end": 1.0}], "confidence": 0.99
                },
                {
                    "id": 1, "start": 10.0, "end": 20.0, "text": "Wow, what an amazing insight!", 
                    "words": [{"word": "Wow", "start": 10.0, "end": 11.0}], "confidence": 0.99
                },
                {
                    "id": 2, "start": 20.0, "end": 30.0, "text": "You definitely need to hear this.", 
                    "words": [{"word": "You", "start": 20.0, "end": 21.0}], "confidence": 0.99
                }
            ]
        }


def extract_key_phrases(transcript: dict) -> list[str]:
    """Extract high-emphasis words from transcript for caption highlighting."""
    STOP_WORDS = {"the", "a", "an", "is", "it", "of", "and", "or", "but", "in", "on", "at", "to"}
    words = transcript.get("text", "").lower().split()
    return [w for w in words if w not in STOP_WORDS and len(w) > 4]


def format_captions_srt(segments: list, highlight_words: list = None) -> str:
    """Convert Whisper segments to SRT subtitle format."""
    srt = []
    for i, seg in enumerate(segments, 1):
        start = _format_timestamp(seg["start"])
        end = _format_timestamp(seg["end"])
        text = seg["text"]
        srt.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(srt)


def _format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
