import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Aanvraagsoorten die de site mag insturen
const TYPES = ["box", "catering", "workshop", "oven"]
const STATUSES = ["nieuw", "opgevolgd", "afgerond"]

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

      const phone    = str(body.phone, LIMITS.phone)
      const option   = str(body.option, LIMITS.option)
      const location = str(body.location, LIMITS.location)
      const message  = str(body.message, LIMITS.message)
      if (phone === null || option === null || location === null || message === null)
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

      // Dubbele inzending binnen 2 minuten (dubbelklik of refresh) negeren
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      const duplicate = list.some(i =>
        i.email === email.toLowerCase() &&
        i.type === type &&
        new Date(i.createdAt).getTime() > twoMinutesAgo
      )
      if (duplicate) return Response.json({ success: true, duplicate: true })

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
      return Response.json({ success: true, id: inquiry.id })
    }

    if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "GET") {
      const list = await getList(store)
      return Response.json(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
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
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/inquiries" }
