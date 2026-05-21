"""
YOLO Face & Speaker Tracking Module
Uses YOLOv8 for real-time face detection and speaker tracking.
Outputs per-frame crop coordinates for smart 9:16 reframing.
Requires: ultralytics, opencv-python
"""

import os
from typing import List, Optional

def detect_speakers(video_path: str, sample_rate: int = 5) -> List[dict]:
    """
    Detect speaker/face positions throughout the video.
    Returns list of {timestamp, center_x, center_y, confidence, bbox} dicts.
    sample_rate: analyze every Nth frame (5 = 1 per second at 5fps sampling)
    """
    try:
        import cv2
        from ultralytics import YOLO
    except ImportError:
        raise RuntimeError("Install deps: pip install ultralytics opencv-python")

    model = YOLO("yolov8n-face.pt")  # Download from: https://github.com/akanametov/yolov8-face
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)

    tracks = []
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_rate == 0:
            results = model(frame, conf=0.4, verbose=False)
            timestamp = frame_idx / fps

            if results and results[0].boxes:
                # Use the largest (primary) face detected
                boxes = results[0].boxes.xyxy.cpu().numpy()
                if len(boxes) > 0:
                    # Pick largest box by area
                    areas = [(b[2]-b[0]) * (b[3]-b[1]) for b in boxes]
                    best = boxes[areas.index(max(areas))]
                    cx = ((best[0] + best[2]) / 2) / width
                    cy = ((best[1] + best[3]) / 2) / height
                    tracks.append({
                        "timestamp": timestamp,
                        "center_x": float(cx),
                        "center_y": float(cy),
                        "confidence": float(results[0].boxes.conf[areas.index(max(areas))]),
                        "bbox": best.tolist(),
                    })
        frame_idx += 1

    cap.release()
    return tracks


def smooth_tracks(tracks: List[dict], window: int = 10) -> List[dict]:
    """Apply moving average smoothing to eliminate jitter in tracking."""
    if len(tracks) < window:
        return tracks

    smoothed = []
    for i, t in enumerate(tracks):
        start = max(0, i - window // 2)
        end = min(len(tracks), i + window // 2)
        window_tracks = tracks[start:end]
        smoothed.append({
            **t,
            "center_x": sum(w["center_x"] for w in window_tracks) / len(window_tracks),
            "center_y": sum(w["center_y"] for w in window_tracks) / len(window_tracks),
        })
    return smoothed


def get_crop_for_timestamp(tracks: List[dict], timestamp: float) -> Optional[dict]:
    """Find the closest tracking data for a given timestamp."""
    if not tracks:
        return None
    closest = min(tracks, key=lambda t: abs(t["timestamp"] - timestamp))
    return closest if abs(closest["timestamp"] - timestamp) < 2.0 else None
