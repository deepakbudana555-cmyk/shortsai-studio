import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { transcript, language, style } = await req.json()
    if (!transcript) return NextResponse.json({ error: 'Transcript required' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })

    const prompt = `You are an expert short-form video content analyzer. Given this transcript, identify:
1. The TOP 5 viral moments (timestamp range, reason why it's viral)
2. The overall viral potential score (0-100)
3. Trending hooks detected
4. Emotional peaks
5. Best audience retention segments

Transcript:
"""${transcript.slice(0, 4000)}"""

Respond in JSON format:
{
  "viralScore": number,
  "moments": [{ "start": "MM:SS", "end": "MM:SS", "label": string, "score": number, "reason": string, "type": "hook"|"emotional"|"insight"|"cta" }],
  "hooks": [string],
  "suggestedTitles": [string],
  "suggestedHashtags": [string],
  "seoDescription": string
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[ANALYZE ERROR]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
