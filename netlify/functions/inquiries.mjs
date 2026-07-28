import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SITE_URL = process.env.URL || "https://jeanke-pizza.netlify.app"

// Aanvraagsoorten die de site mag insturen
const TYPES = ["box", "catering", "workshop", "oven"]
const STATUSES = ["nieuw", "opgevolgd", "afgerond"]

// Grove floodgrens: dit endpoint is publiek, dus zonder rem kan een script de
// opslag volschrijven en de mailbox laten overlopen. Geen IP-adressen nodig —
// we kijken alleen naar hoeveel aanvragen er net binnenkwamen.
const FLOOD_WINDOW_MS = 5 * 60 * 1000
const FLOOD_MAX = 10

const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  option: 80,
  location: 120,
  message: 2000,
}

async function getList(store) {
  return await store.get("list", { type: "json" }).catch(() => null) || []
}

// Welke itemlijst bij welke aanvraagsoort hoort
const OPTION_LISTS = {
  box:      ["box", "packages"],
  catering: ["catering", "formulas"],
  workshop: ["workshops", "types"],
  oven:     ["ovens", "models"],
}

/**
 * Zet een option-id om in een leesbare naam voor de mail. We zoeken die
 * server-side op in de dienstendata en vertrouwen niet op wat de browser
 * meestuurt. Lukt dat niet, dan valt hij terug op het label uit het formulier
 * en anders op het id zelf — een minder mooie mail is beter dan geen mail.
 */
async function resolveOptionLabel(type, optionId, clientLabel) {
  if (!optionId) return null
  try {
    const [serviceKey, listKey] = OPTION_LISTS[type] || []
    if (serviceKey) {
      const store = getStore({ name: "services", consistency: "strong" })
      const config = await store.get("config", { type: "json" }).catch(() => null)
      const item = config?.[serviceKey]?.[listKey]?.find(i => i.id === optionId)
      if (item?.name) return item.name
    }
  } catch { /* opzoeken is optioneel */ }
  return clientLabel || optionId
}

async function sendInquiryMail(inquiry, optionLabel) {
  if (!ADMIN_PASSWORD) {
    console.error("inquiry mail skipped: ADMIN_PASSWORD ontbreekt")
    return
  }
  const res = await fetch(`${SITE_URL}/api/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": ADMIN_PASSWORD,
    },
    body: JSON.stringify({
      type: "inquiry",
      inquiryType: inquiry.type,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      option: optionLabel,
      date: inquiry.date,
      guests: inquiry.guests,
      location: inquiry.location,
      message: inquiry.message,
    }),
  })
  if (!res.ok) throw new Error(`send-email gaf ${res.status}`)
}

function str(value, max) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > max ? null : trimmed
}

export default async (req) => {
  try {
    const store = getStore({ name: "inquiries", consistency: "strong" })

    if (req.method === "POST") {
      const body = await req.json().catch(() => null)
      if (!body) return Response.json({ error: "Invalid body" }, { status: 400 })

      // Honeypot — bots vullen dit verborgen veld in, mensen niet.
      if (body.website) return Response.json({ success: true })

      const type = TYPES.includes(body.type) ? body.type : null
      if (!type) return Response.json({ error: "Invalid type" }, { status: 400 })

      const name = str(body.name, LIMITS.name)
      if (!name) return Response.json({ error: "Invalid name" }, { status: 400 })

      const email = str(body.email, LIMITS.email)
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return Response.json({ error: "Invalid email" }, { status: 400 })

      const phone       = str(body.phone, LIMITS.phone)
      const option      = str(body.option, LIMITS.option)
      const optionLabel = str(body.optionLabel, LIMITS.option)
      const location    = str(body.location, LIMITS.location)
      const message     = str(body.message, LIMITS.message)
      if (phone === null || option === null || optionLabel === null || location === null || message === null)
        return Response.json({ error: "Field too long" }, { status: 400 })

      let date = str(body.date, 10)
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
        return Response.json({ error: "Invalid date" }, { status: 400 })

      let guests = null
      if (body.guests !== undefined && body.guests !== null && body.guests !== '') {
        guests = Number(body.guests)
        if (!Number.isInteger(guests) || guests < 1 || guests > 1000)
          return Response.json({ error: "Invalid guests" }, { status: 400 })
      }

      const list = await getList(store)
      const now = Date.now()

      // Dubbele inzending binnen 2 minuten (dubbelklik of refresh) negeren
      const twoMinutesAgo = now - 2 * 60 * 1000
      const duplicate = list.some(i =>
        i.email === email.toLowerCase() &&
        i.type === type &&
        new Date(i.createdAt).getTime() > twoMinutesAgo
      )
      if (duplicate) return Response.json({ success: true, duplicate: true })

      const recent = list.filter(i => new Date(i.createdAt).getTime() > now - FLOOD_WINDOW_MS).length
      if (recent >= FLOOD_MAX) {
        return Response.json({ error: "Te veel aanvragen. Probeer het straks opnieuw." }, { status: 429 })
      }

      const inquiry = {
        id: randomUUID(),
        type,
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        option: option || null,
        date: date || null,
        guests,
        location: location || null,
        message: message || null,
        status: "nieuw",
        createdAt: new Date().toISOString(),
      }

      await store.set("list", JSON.stringify([...list, inquiry]))

      // De mail gaat hiervandaan, niet uit de browser. Zo hoeft
      // /api/send-email het type 'inquiry' niet van buitenaf te aanvaarden.
      // Mislukt de mail, dan is de aanvraag toch bewaard en zichtbaar in
      // /beheer — de bezoeker mag daar niet op stranden.
      const label = await resolveOptionLabel(type, inquiry.option, optionLabel)
      await sendInquiryMail(inquiry, label).catch(err =>
        console.error("inquiry mail failed:", err.message)
      )

      return Response.json({ success: true, id: inquiry.id })
    }

    // Expliciete !!ADMIN_PASSWORD: zonder ingestelde variabele mag niets door,
    // ook niet als de vergelijking ooit losser zou worden.
    if (!ADMIN_PASSWORD || req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "GET") {
      const list = await getList(store)
      // Nieuwste eerst. String(...) zodat een record zonder createdAt de hele
      // lijst niet onderuit haalt.
      return Response.json(
        [...list].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      )
    }

    if (req.method === "PUT") {
      const { id, status } = await req.json()
      if (!STATUSES.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 })
      const list = await getList(store)
      const item = list.find(i => i.id === id)
      if (!item) return Response.json({ error: "Not found" }, { status: 404 })
      item.status = status
      await store.set("list", JSON.stringify(list))
      return Response.json({ success: true })
    }

    if (req.method === "DELETE") {
      const { id } = await req.json()
      const list = await getList(store)
      await store.set("list", JSON.stringify(list.filter(i => i.id !== id)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    // Interne foutteksten niet doorgeven aan de client
    console.error("inquiries function error:", err)
    return Response.json({ error: "Serverfout" }, { status: 500 })
  }
}

export const config = { path: "/api/inquiries" }
