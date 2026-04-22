import { NextResponse } from 'next/server'

export async function POST(req) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    // No key configured — tell client to fall back to browser TTS
    return NextResponse.json({ fallback: true })
  }

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
          voice: {
            languageCode: 'en-GB',
            name: 'en-GB-Neural2-B',  // natural British male
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.92,
            pitch: -2.0,       // slightly lower = more authoritative
            volumeGainDb: 1.0
          }
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
