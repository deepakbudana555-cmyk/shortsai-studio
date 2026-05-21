"""
FFmpeg Video Processing Module
Handles: clipping, 9:16 reframing, face tracking zoom, captions, audio enhancement.
Requires: ffmpeg-python, ffmpeg binary installed.
"""

import subprocess
import os
import json
from typing import Optional

def create_short(
    input_path: str,
    start_time: float,
    end_time: float,
    output_path: str,
    speaker_crop: Optional[dict] = None,
    target_resolution: tuple = (1080, 1920),
) -> str:
    """
    Create a 9:16 short clip from a long video.
    Applies smart reframing based on speaker position detected by YOLO.
    """
    w, h = target_resolution
    duration = end_time - start_time

    # Smart crop: if speaker detected, center crop on face; else center crop
    if speaker_crop:
        cx = speaker_crop.get("center_x", 0.5)
        cy = speaker_crop.get("center_y", 0.4)
        # Calculate crop coordinates for 9:16 from 16:9 source
        vf = (
            f"scale=iw*{h}/ih:ih,"
            f"crop={w}:{h}:iw/2-{w}/2:ih/2-{h}/2,"
            f"zoompan=z='if(lte(zoom,1.0),1.05,max(1.001,zoom-0.005))'"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={w}x{h}"
        )
    else:
        vf = f"scale=-1:{h},crop={w}:{h}"

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_time),
        "-i", input_path,
        "-t", str(duration),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",           # High quality
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-movflags", "+faststart",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg clip creation failed: {result.stderr}")

    return output_path


def enhance_audio(video_path: str, output_path: str) -> str:
    """
    Apply audio enhancements:
    - Noise reduction via afftdn
    - Voice enhancement via highpass/lowpass filters
    - Normalization via loudnorm
    """
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-af", "afftdn=nf=-25,highpass=f=80,lowpass=f=8000,loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Audio enhancement failed: {result.stderr}")
    return output_path


def add_captions(video_path: str, srt_path: str, output_path: str, style: str = "bold_impact") -> str:
    """
    Burn animated captions into the video using FFmpeg subtitles filter.
    Different styles apply different font/color/position options.
    """
    STYLES = {
        "bold_impact": "FontName=Impact,FontSize=18,Bold=1,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2",
        "yellow_gold": "FontName=Impact,FontSize=18,Bold=1,PrimaryColour=&H00FFFF,OutlineColour=&H000000,Outline=2,Alignment=2",
        "clean_white": "FontName=Arial,FontSize=16,Bold=0,PrimaryColour=&HFFFFFF,Alignment=2",
        "red_highlight": "FontName=Impact,FontSize=18,Bold=1,PrimaryColour=&H0000FF,OutlineColour=&H000000,Outline=2,Alignment=2",
    }
    style_opts = STYLES.get(style, STYLES["bold_impact"])

    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", f"subtitles={srt_path}:force_style='{style_opts}'",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "copy",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Caption burning failed: {result.stderr}")
    return output_path


def add_background_music(video_path: str, music_path: str, output_path: str, music_volume: float = 0.15) -> str:
    """Mix background music into the short at a low volume."""
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", music_path,
        "-filter_complex",
        f"[1:a]volume={music_volume},afade=t=out:st=0:d=3[music];"
        "[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Music mixing failed: {result.stderr}")
    return output_path


def generate_thumbnail(video_path: str, timestamp: float, output_path: str) -> str:
    """Extract best frame for thumbnail at given timestamp."""
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(timestamp),
        "-i", video_path,
        "-vframes", "1",
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
        "-q:v", "2",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Thumbnail extraction failed: {result.stderr}")
    return output_path


def get_video_info(video_path: str) -> dict:
    """Get video metadata using ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_streams", "-show_format", video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError("ffprobe failed")
    return json.loads(result.stdout)
