import { NextResponse } from 'next/server'

const CALENDARS = [
  'uktweeter19@gmail.com',
  'family021430976716499641216@group.calendar.google.com'
]

export async function GET() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_CALENDAR_API_KEY not set', events: [] })
  }

  try {
    const now = new Date()
    const tz = 'America/New_York'
    const startOfDay = new Date(now.toLocaleDateString('en-US', { timeZone: tz }))
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const allEvents = []

    await Promise.all(CALENDARS.map(async calId => {
      const params = new URLSearchParams({
        key: apiKey,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '25'
      })
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${params}`
      )
      if (!res.ok) return
      const data = await res.json()
      for (const item of (data.items || [])) {
        const allDay = !item.start?.dateTime
        let timeStr = ''
        if (item.start?.dateTime) {
          timeStr = new Date(item.start.dateTime).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', timeZone: tz
          })
        }
        allEvents.push({ summary: item.summary || 'Untitled', time: timeStr, allDay })
      }
    }))

    // All-day events first, then by time
    allEvents.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return (a.time || '').localeCompare(b.time || '')
    })

    return NextResponse.json({ events: allEvents })
  } catch (e) {
    return NextResponse.json({ error: e.message, events: [] })
  }
}
