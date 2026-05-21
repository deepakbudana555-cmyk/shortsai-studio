import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shorts = [], sceneImages = {}, platforms = {}, quality = '1080x1920' } = body

    if (!shorts.length) {
      return NextResponse.json({ error: 'No shorts to export' }, { status: 400 })
    }

    // ── Build the export job ──────────────────────────────────────────────
    const jobId = `export_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const steps = [
      { id: 'prepare',  label: 'Preparing export job',           duration: 800  },
      { id: 'images',   label: 'Embedding custom scene images',  duration: 1200 },
      { id: 'captions', label: 'Burning in animated captions',   duration: 1000 },
      { id: 'audio',    label: 'Enhancing audio & noise removal',duration: 900  },
      { id: 'render',   label: 'Rendering 9:16 HD clips',        duration: 1500 },
      { id: 'compress', label: 'Compressing for each platform',  duration: 800  },
      { id: 'upload',   label: 'Uploading to cloud storage',     duration: 700  },
      { id: 'done',     label: 'Export complete!',               duration: 200  },
    ]

    // In production this would queue a real FFmpeg job via the Python backend.
    // Here we return the job metadata so the client can poll/stream progress.
    return NextResponse.json({
      success: true,
      jobId,
      totalShorts: shorts.length,
      customImages: Object.keys(sceneImages).length,
      steps,
      estimatedSeconds: Math.ceil(shorts.length * 12),
      // Demo download links — replace with real Supabase/S3 URLs in production
      downloads: shorts.map((s: any, i: number) => ({
        id: s.id,
        title: s.title || `Short ${i + 1}`,
        platforms: Object.keys(platforms).filter(k => platforms[k]),
        // Use a real public sample video as placeholder
        url: `https://www.w3schools.com/html/mov_bbb.mp4`,
        filename: `shortsai_${(s.title || `short_${i+1}`).replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()}.mp4`,
        thumbnail: s.thumbnail_url || null,
        viral_score: s.viral_score || 85,
        duration: s.duration || 45,
      })),
    })
  } catch (err) {
    console.error('[EXPORT ERROR]', err)
    return NextResponse.json({ error: 'Export failed. Please try again.' }, { status: 500 })
  }
}
