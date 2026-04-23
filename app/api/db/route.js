import { NextResponse } from 'next/server'

function checkToken(req) {
  const token = req.headers.get('x-jarvis-token')
  return token && token === process.env.JARVIS_API_TOKEN
}

function firebaseUrl(path) {
  const base = process.env.FIREBASE_DB_URL
  const secret = process.env.FIREBASE_DB_SECRET
  const clean = path.replace(/^\/+/, '')
  return `${base}/${clean}.json${secret ? `?auth=${secret}` : ''}`
}

export async function GET(req) {
  if (!checkToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const path = new URL(req.url).searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  const res = await fetch(firebaseUrl(path))
  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(req) {
  if (!checkToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const path = new URL(req.url).searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  const body = await req.json()
  const res = await fetch(firebaseUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req) {
  if (!checkToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const path = new URL(req.url).searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  const body = await req.json()
  const res = await fetch(firebaseUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(req) {
  if (!checkToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const path = new URL(req.url).searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  const res = await fetch(firebaseUrl(path), { method: 'DELETE' })
  const data = await res.json()
  return NextResponse.json(data)
}
