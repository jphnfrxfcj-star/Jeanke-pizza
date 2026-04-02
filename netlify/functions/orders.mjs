import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export default async (req) => {
  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const store = getStore("booked-slots")

  if (req.method === "GET") {
    const data = await store.get("slots", { type: "json" }).catch(() => null)
    return Response.json(data || [])
  }

  if (req.method === "DELETE") {
    // Cancel a specific slot
    const { key } = await req.json()
    const existing = await store.get("slots", { type: "json" }).catch(() => []) || []
    await store.set("slots", JSON.stringify(existing.filter(s => s.key !== key)))
    return Response.json({ success: true })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/orders" }
