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

    // Get today's date in Eastern time (YYYY-MM-DD) using Swedish locale which outputs ISO format
    const dateStr = new Intl.DateTimeFormat('sv', { timeZone: tz }).format(now)

    // Get the UTC offset for Eastern right now — handles DST automatically
    const offsetPart = new Intl.DateTimeFormat('en', {
      timeZone: tz, timeZoneName: 'shortOffset'
    }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'GMT-4'
    const offsetHours = parseInt(offsetPart.replace('GMT', '')) || -4
    const offsetMs = offsetHours * 3600 * 1000

    // Eastern midnight = UTC midnight shifted by offset
    const startOfDay = new Date(new Date(dateStr + 'T00:00:00.000Z').getTime() - offsetMs)
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const allEvents = []
    const errors = []

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
      const data = await res.json()
      if (!res.ok) {
        errors.push(`${calId}: ${res.status} — ${data?.error?.message || res.statusText}`)
        return
      }
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

    allEvents.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return (a.time || '').localeCompare(b.time || '')
    })

    const result = { events: allEvents }
    if (errors.length) result.errors = errors
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e.message, events: [] })
  }
}
