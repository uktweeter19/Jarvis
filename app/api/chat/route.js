import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { messages, user, context } = await req.json()

    // Transform messages — if a message has an image, split it into
    // an image block + text block as required by the Anthropic API.
    const formattedMessages = messages.map(m => {
      if (m.image && m.role === 'user') {
        // m.image is a data URL like "data:image/jpeg;base64,/9j/4AAQ..."
        // We need to split off the media type and the raw base64 data.
        const match = m.image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/)
        if (match) {
          const mediaType = match[1]
          const base64Data = match[2]
          return {
            role: m.role,
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data
                }
              },
              {
                type: 'text',
                text: m.content || 'Please help me solve this math problem step by step.'
              }
            ]
          }
        }
      }
      // Normal text-only message
      return { role: m.role, content: m.content }
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
        system: context + ' Current user: ' + user,
        messages: formattedMessages
      })
    })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ reply: 'API Error: ' + JSON.stringify(data) })
    }
    return NextResponse.json({ reply: data.content[0].text })
  } catch(e) {
    return NextResponse.json({ reply: 'Error: ' + e.message })
  }
}
