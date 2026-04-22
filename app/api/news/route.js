import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://feeds.foxnews.com/foxnews/latest', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JARVIS/1.0)' },
      next: { revalidate: 300 }
    })
    if (!res.ok) throw new Error(`Feed returned ${res.status}`)
    const xml = await res.text()

    const headlines = []
    const re = /<item[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g
    let m
    while ((m = re.exec(xml)) !== null && headlines.length < 8) {
      const title = m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
      if (title && title.length > 8) headlines.push(title)
    }

    return NextResponse.json({ headlines })
  } catch (e) {
    return NextResponse.json({ error: e.message, headlines: [] })
  }
}
