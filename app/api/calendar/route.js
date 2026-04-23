import { NextResponse } from 'next/server'

function unfold(text) {
  return text.replace(/\r?\n[ \t]/g, '')
}

function getProp(block, key) {
  const re = new RegExp(`^${key}(?:;[^:]+)?:(.+)$`, 'm')
  const m = block.match(re)
  return m ? m[1].trim() : ''
}

function getAllProps(block, key) {
  const re = new RegExp(`^${key}(?:;[^:]+)?:(.+)$`, 'gm')
  const results = []
  let m
  while ((m = re.exec(block)) !== null) results.push(m[1].trim())
  return results
}

function parseICalDate(val) {
  if (!val) return null
  const clean = val.includes(':') ? val.split(':').pop().trim() : val.trim()
  const dateStr = clean.slice(0, 8)
  if (clean.length === 8) return { dateStr, allDay: true, hour: null, min: null, isUTC: false }
  return { dateStr, allDay: false, hour: clean.slice(9, 11), min: clean.slice(11, 13), isUTC: clean.endsWith('Z') }
}

function getDateStr(tz, offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d).replace(/-/g, '')
}

function getDayName(dateStr, tz) {
  const d = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz })
}

function getDow(dateStr) {
  const days = ['SU','MO','TU','WE','TH','FR','SA']
  const d = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T12:00:00`)
  return days[d.getDay()]
}

function occursOnDate(parsed, rrule, targetDate) {
  if (!parsed) return false
  if (!rrule) return parsed.dateStr === targetDate
  if (parsed.dateStr > targetDate) return false

  const untilMatch = rrule.match(/UNTIL=(\d{8})/)
  if (untilMatch && untilMatch[1] < targetDate) return false

  const freq = rrule.match(/FREQ=(\w+)/)?.[1] || ''
  if (freq === 'DAILY') return true
  if (freq === 'WEEKLY') {
    const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/)
    if (!bydayMatch) return true
    return bydayMatch[1].split(',').includes(getDow(targetDate))
  }
  if (freq === 'MONTHLY') return parsed.dateStr.slice(6, 8) === targetDate.slice(6, 8)
  if (freq === 'YEARLY') return parsed.dateStr.slice(4, 8) === targetDate.slice(4, 8)
  return false
}

export async function GET() {
  const tz = 'America/New_York'
  const urls = [
    process.env.ICAL_URL_PERSONAL,
    process.env.ICAL_URL_FAMILY,
    'https://calendar.google.com/calendar/ical/98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com/public/basic.ics'
  ].filter(Boolean)

  if (urls.length < 2) {
    return NextResponse.json({
      error: 'Add ICAL_URL_PERSONAL and ICAL_URL_FAMILY to Vercel environment variables',
      events: []
    })
  }

  // Fetch events for next 7 days
  const targetDates = Array.from({ length: 7 }, (_, i) => getDateStr(tz, i))
  const allEvents = []
  const errors = []

  await Promise.all(urls.map(async url => {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) { errors.push(`Fetch failed: ${res.status}`); return }
      const text = unfold(await res.text())

      for (const block of text.split('BEGIN:VEVENT').slice(1)) {
        const endIdx = block.indexOf('END:VEVENT')
        if (endIdx === -1) continue
        const ev = block.slice(0, endIdx)

        const summary = getProp(ev, 'SUMMARY') || 'Untitled'
        const parsed = parseICalDate(getProp(ev, 'DTSTART'))
        if (!parsed) continue

        const rrule = getProp(ev, 'RRULE')
        const exdates = getAllProps(ev, 'EXDATE')

        for (const dateStr of targetDates) {
          if (!occursOnDate(parsed, rrule, dateStr)) continue

          const excluded = exdates.some(ex => parseICalDate(ex)?.dateStr === dateStr)
          if (excluded) continue

          let timeStr = ''
          if (!parsed.allDay && parsed.hour !== null) {
            if (parsed.isUTC) {
              const d = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T${parsed.hour}:${parsed.min}:00Z`)
              timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
            } else {
              const h = parseInt(parsed.hour)
              timeStr = `${h % 12 || 12}:${parsed.min} ${h >= 12 ? 'PM' : 'AM'}`
            }
          }

          // Avoid duplicates (same summary + date + time)
          const key = `${summary}|${dateStr}|${timeStr}`
          if (!allEvents.find(e => e._key === key)) {
            allEvents.push({
              summary, time: timeStr, allDay: parsed.allDay,
              dateStr, dayName: getDayName(dateStr, tz),
              _key: key
            })
          }
        }
      }
    } catch (e) {
      errors.push(e.message)
    }
  }))

  allEvents.sort((a, b) => {
    if (a.dateStr !== b.dateStr) return a.dateStr.localeCompare(b.dateStr)
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1
    return (a.time || '').localeCompare(b.time || '')
  })

  // Remove internal key before returning
  const events = allEvents.map(({ _key, ...e }) => e)
  const result = { events }
  if (errors.length) result.errors = errors
  return NextResponse.json(result)
}
