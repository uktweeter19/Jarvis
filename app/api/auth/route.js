import { NextResponse } from 'next/server'

const RATE = new Map()

function checkRate(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const entry = RATE.get(ip) || { count: 0, start: now }
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now }
  entry.count++
  RATE.set(ip, entry)
  return entry.count <= limit
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRate(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  const { password, type } = await req.json().catch(() => ({}))
  if (!password || !type) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const token = process.env.JARVIS_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (type === 'main') {
    const valid = password === process.env.APP_PASSWORD
    if (!valid) return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    return NextResponse.json({ token, role: 'main' })
  }

  if (type === 'parent') {
    const valid = password === process.env.PARENT_PASSWORD
    if (!valid) return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    return NextResponse.json({ token, role: 'parent' })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
