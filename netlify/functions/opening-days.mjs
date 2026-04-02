import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

export default async (req) => {
  try {
    const store = getStore({ name: "opening-days", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("days", { type: "json" }).catch(() => null)
      return Response.json(data || [])
    }

    if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "POST") {
      const { date, label } = await req.json()
      const existing = await store.get("days", { type: "json" }).catch(() => []) || []
      if (existing.some(d => d.date === date)) return Response.json({ error: "Date exists" }, { status: 409 })
      const updated = [...existing, { date, label: label || '' }].sort((a, b) => a.date.localeCompare(b.date))
      await store.set("days", JSON.stringify(updated))
      return Response.json({ success: true })
    }

    if (req.method === "DELETE") {
      const { date } = await req.json()
      const existing = await store.get("days", { type: "json" }).catch(() => []) || []
      await store.set("days", JSON.stringify(existing.filter(d => d.date !== date)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/opening-days" }
