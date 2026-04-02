import { getStore } from "@netlify/blobs"

export default async (req) => {
  try {
    const store = getStore({ name: "booked-slots", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("slots", { type: "json" }).catch(() => null)
      const keys = (data || []).map(s => s.key)
      return Response.json(keys)
    }

    if (req.method === "POST") {
      const body = await req.json()
      const { date, timeslot, name, email, order, total } = body
      const key = `${date}_${timeslot}`

      const existing = await store.get("slots", { type: "json" }).catch(() => []) || []

      if (existing.some(s => s.key === key)) {
        return Response.json({ error: "Slot already booked" }, { status: 409 })
      }

      const cancelToken = crypto.randomUUID()
      const entry = { key, date, time: timeslot, name, email, order, total, cancelToken, bookedAt: new Date().toISOString() }
      await store.set("slots", JSON.stringify([...existing, entry]))
      return Response.json({ success: true, cancelToken })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("slots function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/slots" }
