import { getStore } from "@netlify/blobs"

export default async (req) => {
  const store = getStore("booked-slots")

  if (req.method === "GET") {
    const data = await store.get("slots", { type: "json" }).catch(() => null)
    return Response.json(data || [])
  }

  if (req.method === "POST") {
    const { date, timeslot } = await req.json()
    const key = `${date}_${timeslot}`

    const existing = await store.get("slots", { type: "json" }).catch(() => []) || []

    if (existing.includes(key)) {
      return Response.json({ error: "Slot already booked" }, { status: 409 })
    }

    await store.set("slots", JSON.stringify([...existing, key]))
    return Response.json({ success: true })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/slots" }
