import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

export default async (req) => {
  const pw = req.headers.get("x-admin-password")
  if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const store = getStore({ name: "expenses", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      return Response.json(data || [])
    }

    if (req.method === "POST") {
      const { date, description, amount } = await req.json()
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      const entry = { id: crypto.randomUUID(), date, description, amount: parseFloat(amount) }
      await store.set("list", JSON.stringify([...existing, entry]))
      return Response.json(entry)
    }

    if (req.method === "DELETE") {
      const { id } = await req.json()
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      await store.set("list", JSON.stringify(existing.filter(e => e.id !== id)))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/expenses" }
