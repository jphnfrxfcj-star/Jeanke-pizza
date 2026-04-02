import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'
const DEFAULT_THRESHOLD = 20

export default async (req) => {
  try {
    const store = getStore({ name: "registrations", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      const cfg  = await store.get("config", { type: "json" }).catch(() => null)
      const list = data || []
      const threshold = cfg?.threshold ?? DEFAULT_THRESHOLD
      return Response.json({ count: list.length, threshold })
    }

    if (req.method === "POST") {
      const { name, email } = await req.json()
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      if (existing.some(r => r.email.toLowerCase() === email.toLowerCase())) {
        return Response.json({ error: "already_registered" }, { status: 409 })
      }
      const updated = [...existing, { name, email, registeredAt: new Date().toISOString() }]
      await store.set("list", JSON.stringify(updated))
      const cfg = await store.get("config", { type: "json" }).catch(() => null)
      const threshold = cfg?.threshold ?? DEFAULT_THRESHOLD
      return Response.json({ success: true, count: updated.length, threshold, reached: updated.length >= threshold })
    }

    // Admin: GET all registrations
    if (req.method === "GET" && req.headers.get("x-admin-password") === ADMIN_PASSWORD) {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      return Response.json(data || [])
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/register" }
