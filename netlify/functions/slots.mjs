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
      const { date, name, email, order, total } = body
      // Support both single timeslot (legacy) and array
      const timeslots = Array.isArray(body.timeslots)
        ? body.timeslots
        : [body.timeslot]

      const existing = await store.get("slots", { type: "json" }).catch(() => []) || []

      // Check all required slots are free
      for (const ts of timeslots) {
        const key = `${date}_${ts}`
        if (existing.some(s => s.key === key)) {
          return Response.json({ error: "Slot already booked" }, { status: 409 })
        }
      }

      const cancelToken = crypto.randomUUID()
      const newEntries = timeslots.map((ts, i) => ({
        key: `${date}_${ts}`,
        date,
        time: ts,
        primary: i === 0,
        name, email, order, total, cancelToken,
        bookedAt: new Date().toISOString(),
      }))

      await store.set("slots", JSON.stringify([...existing, ...newEntries]))
      return Response.json({ success: true, cancelToken })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("slots function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/slots" }
