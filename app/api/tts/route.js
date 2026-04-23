import { NextResponse } from 'next/server'

const RATE = new Map()

function checkRate(ip, limit = 60, windowMs = 60_000) {
  const now = Date.now()
  const entry = RATE.get(ip) || { count: 0, start: now }
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now }
  entry.count++
  RATE.set(ip, entry)
  return entry.count <= limit
}

function checkToken(req) {
  const token = req.headers.get('x-jarvis-token')
  return token && token === process.env.JARVIS_API_TOKEN
}

export async function POST(req) {
  if (!checkToken(req)) return NextResponse.json({ fallback: true }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRate(ip)) return NextResponse.json({ fallback: true }, { status: 429 })

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) return NextResponse.json({ fallback: true })

  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ fallback: true })

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text.slice(0, 5000) },
          voice: { languageCode: 'en-GB', name: 'en-GB-Neural2-B', ssmlGender: 'MALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.92, pitch: -2.0, volumeGainDb: 1.0 }
        })
      }
    )

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'TTS API error')
    return NextResponse.json({ audioContent: data.audioContent })
  } catch (e) {
    return NextResponse.json({ fallback: true, error: e.message })
  }
}
