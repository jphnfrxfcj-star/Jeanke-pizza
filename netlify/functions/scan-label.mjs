import Anthropic from '@anthropic-ai/sdk'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { image, mediaType } = await req.json()
    // image = base64 string, mediaType = 'image/jpeg' | 'image/png' | ...

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: 'Dit is een prijsetiket of kassabon van een voedingsingrediënt. Geef enkel het bedrag terug als decimaal getal (bv. 2.49). Geen tekst, geen euroteken, enkel het getal. Als er meerdere prijzen zijn, kies de prijs van het product zelf (niet een korting). Als je geen prijs ziet, antwoord dan met 0.' },
        ],
      }],
    })

    const raw = msg.content[0]?.text?.trim() ?? '0'
    const price = parseFloat(raw.replace(',', '.'))
    return Response.json({ price: isNaN(price) ? 0 : price })
  } catch (err) {
    console.error('scan-label error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: '/api/scan-label' }
