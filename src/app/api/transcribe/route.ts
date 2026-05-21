import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, language } = await req.json()
    if (!audioUrl) return NextResponse.json({ error: 'Audio URL required' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })

    // In production: fetch audio from storage and send to Whisper
    // For demo, we return a mock transcription
    const mockTranscript = {
      text: "Success doesn't happen overnight. It's the result of consistent daily action. Every single morning you have a choice — to build the life you want or to remain comfortable. The most successful people in the world didn't get there by accident.",
      segments: [
        { id: 0, start: 0.0, end: 3.5, text: "Success doesn't happen overnight.", confidence: 0.98, words: ["Success", "doesn't", "happen", "overnight"] },
        { id: 1, start: 3.6, end: 7.2, text: "It's the result of consistent daily action.", confidence: 0.97, words: ["It's", "the", "result", "of", "consistent", "daily", "action"] },
        { id: 2, start: 7.3, end: 13.1, text: "Every single morning you have a choice — to build the life you want or to remain comfortable.", confidence: 0.96 },
        { id: 3, start: 13.2, end: 18.0, text: "The most successful people in the world didn't get there by accident.", confidence: 0.99 },
      ],
      language: language || 'en',
      duration: 18.0,
    }

    return NextResponse.json({ success: true, transcript: mockTranscript })
  } catch (err) {
    console.error('[TRANSCRIBE ERROR]', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
