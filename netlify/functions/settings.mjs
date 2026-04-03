import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

const DEFAULTS = { openingHour: 17, closingHour: 22, pizzasPerSlot: 3 }

export default async (req) => {
  try {
    const store = getStore({ name: "settings", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("config", { type: "json" }).catch(() => null)
      return Response.json({ ...DEFAULTS, ...data })
    }

    if (req.method === "PUT") {
      if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD)
        return Response.json({ error: "Unauthorized" }, { status: 401 })
      const body = await req.json()
      const existing = await store.get("config", { type: "json" }).catch(() => null) || {}
      await store.set("config", JSON.stringify({ ...existing, ...body }))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/settings" }
