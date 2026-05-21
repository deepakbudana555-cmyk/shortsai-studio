import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { title, niche, language, tone } = await req.json()
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const prompt = `You are a viral YouTube Shorts / TikTok content expert. Generate content tools for a creator:

Title/Topic: "${title}"
Niche: "${niche || 'General'}"
Language: "${language || 'English'}"
Tone: "${tone || 'Energetic'}"

Generate in JSON:
{
  "titles": [5 viral title options with emojis],
  "hooks": [5 powerful 1-sentence viral hooks],
  "hashtags": [20 trending hashtags mix of popular and niche],
  "description": "SEO optimized description 150-200 words",
  "hindiTitle": "Hindi version of best title",
  "callToAction": "Powerful CTA line"
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
