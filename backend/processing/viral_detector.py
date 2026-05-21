"""
Viral Moment Detection Module
Uses OpenAI GPT-4 / Google Gemini to analyze transcripts
and identify the highest-potential clips for short-form content.
"""

import os
import json
from typing import List, Optional

def detect_viral_moments(transcript: dict, max_moments: int = 10) -> List[dict]:
    """
    Analyze a video transcript to find the best viral moments.
    Returns scored, timestamped segments ready for clipping.
    """
    text = transcript.get("text", "")
    segments = transcript.get("segments", [])

    # Build segment summary with timestamps
    seg_text = "\n".join(
        f"[{s['start']:.1f}s - {s['end']:.1f}s]: {s['text']}"
        for s in segments[:200]  # limit tokens
    )

    prompt = f"""You are a viral short-form video strategist. Analyze this video transcript and find the {max_moments} best moments for YouTube Shorts / TikTok content.

Transcript with timestamps:
{seg_text}

For each moment, evaluate:
- Hook strength (does it grab attention in the first 3 seconds?)
- Emotional impact (does it evoke strong emotion?)
- Information density (valuable insight delivered concisely?)
- Shareability (would viewers share this?)
- Trending relevance (matches current trends?)

Return a JSON object:
{{
  "moments": [
    {{
      "rank": 1,
      "start_time": number,
      "end_time": number,
      "title": "Short descriptive title",
      "type": "hook|insight|emotional|story|cta|controversy",
      "viral_score": number (0-100),
      "hook_line": "The first line that hooks viewers",
      "reason": "Why this moment will go viral",
      "suggested_caption_style": "bold_impact|yellow_gold|clean_white",
      "emoji": "2-3 relevant emojis"
    }}
  ],
  "overall_video_score": number,
  "content_type": "podcast|interview|talk|vlog|news|tutorial",
  "best_platforms": ["youtube_shorts","tiktok","instagram_reels"]
}}"""

    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=2000,
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("moments", [])
    except Exception as e:
        # Fallback: simple heuristic detection
        return _heuristic_detection(segments, max_moments)


def _heuristic_detection(segments: List[dict], max_moments: int) -> List[dict]:
    """
    Fallback viral moment detection using simple heuristics:
    - Segments with many words (high information density)
    - Segments with exclamation marks or question marks (emotional cues)
    - Every N seconds for consistent coverage
    """
    EMOTIONAL_KEYWORDS = [
        "never", "always", "secret", "amazing", "shocking", "mistake",
        "truth", "changed", "success", "fail", "money", "life", "love",
        "hate", "fear", "dream", "goal", "win", "lose"
    ]
    scored = []
    for i, seg in enumerate(segments):
        score = 50  # base score
        text = seg.get("text", "").lower()
        word_count = len(text.split())
        score += min(word_count * 2, 20)
        if "!" in text or "?" in text:
            score += 10
        for kw in EMOTIONAL_KEYWORDS:
            if kw in text:
                score += 5
        scored.append({
            "rank": i + 1,
            "start_time": seg["start"],
            "end_time": min(seg["end"] + 45, seg["start"] + 59),  # aim for ~60s clips
            "title": f"Key Moment {i+1}",
            "type": "insight",
            "viral_score": min(score, 95),
            "hook_line": seg.get("text", "")[:80],
            "reason": "High information density segment",
            "suggested_caption_style": "bold_impact",
            "emoji": "🔥"
        })

    scored.sort(key=lambda x: x["viral_score"], reverse=True)
    return scored[:max_moments]
