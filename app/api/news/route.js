import { NextResponse } from 'next/server'

function checkToken(req) {
  const token = req.headers.get('x-jarvis-token')
  return token && token === process.env.JARVIS_API_TOKEN
}

const FEEDS = [
  'https://moxie.foxnews.com/google-publisher/latest.xml',
  'https://feeds.foxnews.com/foxnews/latest',
  'https://feeds.foxnews.com/foxnews/world',
]

function parseHeadlines(xml) {
  const headlines = []
  const itemRe = /<item[\s\S]*?<\/item>/gi
  const titleRe = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i
  let item
  while ((item = itemRe.exec(xml)) !== null && headlines.length < 8) {
    const m = titleRe.exec(item[0])
    if (m) {
      const title = m[1]
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
      if (title && title.length > 10) headlines.push(title)
    }
  }
  return headlines
}

export async function GET(req) {
  if (!checkToken(req)) return NextResponse.json({ headlines: [], error: 'Unauthorized' }, { status: 401 })

  for (const url of FEEDS) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        next: { revalidate: 300 }
      })
      if (!res.ok) continue
      const xml = await res.text()
      const headlines = parseHeadlines(xml)
      if (headlines.length > 0) return NextResponse.json({ headlines, source: url })
    } catch (_) {
      continue
    }
  }
  return NextResponse.json({ headlines: [], error: 'All feeds unavailable' })
}
