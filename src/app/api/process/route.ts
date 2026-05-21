import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { video_url, title, user_id, project_id } = body

    // Proxy the request to the Python backend
    const processingApiUrl = process.env.PROCESSING_API_URL || 'http://localhost:8000'
    const res = await fetch(`${processingApiUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: project_id,
        video_url,
        language: 'en'
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: 'Backend error: ' + errorText }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, ...data })

  } catch (error: any) {
    console.error('Failed to trigger processing', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
