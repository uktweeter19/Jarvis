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

function getTodayStr(tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()).replace(/-/g, '')
}

function getTodayDow(tz) {
  const map = { Sun: 'SU', Mon: 'MO', Tue: 'TU', Wed: 'WE', Thu: 'TH', Fri: 'FR', Sat: 'SA' }
  const short = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date())
  return map[short] || 'MO'
}

function occursToday(parsed, rrule, today, todayDow) {
  if (!parsed) return false
  if (!rrule) return parsed.dateStr === today
  if (parsed.dateStr > today) return false

  const untilMatch = rrule.match(/UNTIL=(\d{8})/)
  if (untilMatch && untilMatch[1] < today) return false

  const freq = rrule.match(/FREQ=(\w+)/)?.[1] || ''
  if (freq === 'DAILY') return true
  if (freq === 'WEEKLY') {
    const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/)
    if (!bydayMatch) return true
    return bydayMatch[1].split(',').includes(todayDow)
  }
  if (freq === 'MONTHLY') return parsed.dateStr.slice(6, 8) === today.slice(6, 8)
  if (freq === 'YEARLY') return parsed.dateStr.slice(4, 8) === today.slice(4, 8)
  return false
}

export async function GET() {
  const tz = 'America/New_York'
  const urls = [
    process.env.ICAL_URL_PERSONAL,
    process.env.ICAL_URL_FAMILY,
    'https://calendar.google.com/calendar/ical/98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com/public/basic.ics'
  ].filter(Boolean)

  if (!urls.length) {
    return NextResponse.json({
      error: 'Add ICAL_URL_PERSONAL and ICAL_URL_FAMILY to Vercel environment variables',
      events: []
    })
  }

  const today = getTodayStr(tz)
  const todayDow = getTodayDow(tz)
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
        if (!occursToday(parsed, rrule, today, todayDow)) continue

        // Skip excluded dates
        const excluded = getAllProps(ev, 'EXDATE').some(ex => {
          const ep = parseICalDate(ex)
          return ep?.dateStr === today
        })
        if (excluded) continue

        let timeStr = ''
        if (!parsed.allDay && parsed.hour !== null) {
          if (parsed.isUTC) {
            const d = new Date(`${today.slice(0,4)}-${today.slice(4,6)}-${today.slice(6,8)}T${parsed.hour}:${parsed.min}:00Z`)
            timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
          } else {
            const h = parseInt(parsed.hour)
            timeStr = `${h % 12 || 12}:${parsed.min} ${h >= 12 ? 'PM' : 'AM'}`
          }
        }

        allEvents.push({ summary, time: timeStr, allDay: parsed.allDay })
      }
    } catch (e) {
      errors.push(e.message)
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
}
