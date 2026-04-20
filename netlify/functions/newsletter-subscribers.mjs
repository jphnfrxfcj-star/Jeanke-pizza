import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

async function getSubscribers(store) {
  return await store.get("subscribers", { type: "json" }).catch(() => null) || []
}

export default async (req) => {
  const store = getStore({ name: "newsletter-subscribers", consistency: "strong" })

  if (req.method === "POST") {
    try {
      const { email, name } = await req.json()
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: "Ongeldig e-mailadres" }, { status: 400 })
      }
      const normalizedEmail = email.toLowerCase().trim()
      const subscribers = await getSubscribers(store)
      const existing = subscribers.find(s => s.email === normalizedEmail)
      if (existing) {
        if (existing.status === "unsubscribed") {
          existing.status = "active"
          existing.opted_in_at = new Date().toISOString()
          existing.unsubscribe_token = randomUUID()
          if (name) existing.name = name.trim()
          await store.set("subscribers", JSON.stringify(subscribers))
        }
        return Response.json({ success: true })
      }
      subscribers.push({
        id: randomUUID(),
        email: normalizedEmail,
        name: name?.trim() || null,
        opted_in_at: new Date().toISOString(),
        unsubscribe_token: randomUUID(),
        status: "active",
        last_order_at: new Date().toISOString(),
      })
      await store.set("subscribers", JSON.stringify(subscribers))
      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 })
    }
  }

  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (req.method === "GET") {
    const subscribers = await getSubscribers(store)
    return Response.json(subscribers)
  }

  if (req.method === "DELETE") {
    const { email } = await req.json()
    const subscribers = await getSubscribers(store)
    await store.set("subscribers", JSON.stringify(
      subscribers.filter(s => s.email !== email.toLowerCase().trim())
    ))
    return Response.json({ success: true })
  }

  if (req.method === "PUT") {
    const { email, status } = await req.json()
    const subscribers = await getSubscribers(store)
    const sub = subscribers.find(s => s.email === email.toLowerCase().trim())
    if (!sub) return Response.json({ error: "Not found" }, { status: 404 })
    sub.status = status
    await store.set("subscribers", JSON.stringify(subscribers))
    return Response.json({ success: true })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/newsletter-subscribers" }
