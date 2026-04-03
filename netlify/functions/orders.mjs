import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

export default async (req) => {
  try {
    const store = getStore({ name: "booked-slots", consistency: "strong" })

    if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const all = await store.get("slots", { type: "json" }).catch(() => null) || []

    if (req.method === "GET") {
      // Return one entry per order (primary slot only, or first if no primary flag)
      const seen = new Set()
      const orders = all.filter(s => {
        if (seen.has(s.cancelToken)) return false
        seen.add(s.cancelToken)
        return s.primary !== false // show primary slots (or legacy entries without flag)
      })
      return Response.json(orders)
    }

    if (req.method === "DELETE") {
      const { key } = await req.json()
      // Find the cancelToken for this key, then remove all slots with that token
      const entry = all.find(s => s.key === key)
      if (!entry) return Response.json({ success: true })
      const token = entry.cancelToken
      await store.set("slots", JSON.stringify(all.filter(s => s.cancelToken !== token)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("orders function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/orders" }
