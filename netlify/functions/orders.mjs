import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

export default async (req) => {
  try {
    const store = getStore({ name: "booked-slots", consistency: "strong" })

    if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "GET") {
      const data = await store.get("slots", { type: "json" }).catch(() => null)
      return Response.json(data || [])
    }

    if (req.method === "DELETE") {
      const { key } = await req.json()
      const existing = await store.get("slots", { type: "json" }).catch(() => []) || []
      await store.set("slots", JSON.stringify(existing.filter(s => s.key !== key)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("orders function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/orders" }
