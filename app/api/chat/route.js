import { NextResponse } from 'next/server'

const RATE = new Map()

function checkRate(ip, limit = 30, windowMs = 60_000) {
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
  if (!checkToken(req)) return NextResponse.json({ reply: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRate(ip)) return NextResponse.json({ reply: 'Too many requests. Please wait.' }, { status: 429 })

  try {
    const { messages, user, context } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: 'Invalid request' }, { status: 400 })
    }

    const formattedMessages = messages.map(m => {
      if (m.image && m.role === 'user') {
        const match = m.image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/)
        if (match) {
          return {
            role: m.role,
            content: [
              { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
              { type: 'text', text: (m.content || 'Please help me solve this math problem step by step.').slice(0, 4000) }
            ]
          }
        }
      }
      return { role: m.role, content: String(m.content || '').slice(0, 4000) }
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: String(context || '').slice(0, 8000) + ' Current user: ' + String(user || '').slice(0, 50),
        messages: formattedMessages
      })
    })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ reply: 'API Error: ' + (data.error?.message || 'unknown') })
    }
    return NextResponse.json({ reply: data.content[0].text })
  } catch (e) {
    return NextResponse.json({ reply: 'Error: ' + e.message })
  }
}
