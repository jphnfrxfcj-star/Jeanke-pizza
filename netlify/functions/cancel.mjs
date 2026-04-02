import { getStore } from "@netlify/blobs"

export default async (req) => {
  try {
    const store = getStore({ name: "booked-slots", consistency: "strong" })
    const url   = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) return Response.json({ error: "Missing token" }, { status: 400 })

    const slots = await store.get("slots", { type: "json" }).catch(() => []) || []
    const order = slots.find(s => s.cancelToken === token)

    if (!order) return Response.json({ error: "not_found" }, { status: 404 })

    if (req.method === "GET") {
      return Response.json({ name: order.name, date: order.date, time: order.time, order: order.order, total: order.total })
    }

    if (req.method === "DELETE") {
      await store.set("slots", JSON.stringify(slots.filter(s => s.cancelToken !== token)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/cancel" }
