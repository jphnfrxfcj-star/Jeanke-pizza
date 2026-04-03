import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'
const DEFAULT_MAX = 20
const DEFAULT_OPEN_FROM = 16

export default async (req) => {
  try {
    const store = getStore({ name: "registrations", consistency: "strong" })

    if (req.method === "GET") {
      const url = new URL(req.url)
      const data = await store.get("list", { type: "json" }).catch(() => null)
      const cfg  = await store.get("config", { type: "json" }).catch(() => null)
      const list = data || []
      const max = cfg?.max ?? DEFAULT_MAX
      const openFrom = cfg?.openFrom ?? DEFAULT_OPEN_FROM
      const totalPizzas = list.reduce((sum, r) => sum + (r.pizzas || 1), 0)

      // Admin: return full list
      if (url.pathname === "/api/register/list") {
        const pw = req.headers.get("x-admin-password")
        if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })
        return Response.json(list)
      }

      return Response.json({ count: totalPizzas, max, openFrom, registrations: list.length, registrationDate: cfg?.registrationDate || null })
    }

    if (req.method === "POST") {
      const { name, email, pizzas = 1, date } = await req.json()
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      if (existing.some(r => r.email.toLowerCase() === email.toLowerCase())) {
        return Response.json({ error: "already_registered" }, { status: 409 })
      }
      const updated = [...existing, { name, email, pizzas: Number(pizzas), date: date || null, registeredAt: new Date().toISOString() }]
      await store.set("list", JSON.stringify(updated))
      const cfg = await store.get("config", { type: "json" }).catch(() => null)
      const max = cfg?.max ?? DEFAULT_MAX
      const openFrom = cfg?.openFrom ?? DEFAULT_OPEN_FROM
      const totalPizzas = updated.reduce((sum, r) => sum + (r.pizzas || 1), 0)
      return Response.json({ success: true, count: totalPizzas, max, openFrom, reached: totalPizzas >= openFrom })
    }

    if (req.method === "PUT") {
      const pw = req.headers.get("x-admin-password")
      if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })
      const { registrationDate, max, openFrom } = await req.json()
      const existing = await store.get("config", { type: "json" }).catch(() => null) || {}
      await store.set("config", JSON.stringify({ ...existing, registrationDate, max, openFrom }))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: ["/api/register", "/api/register/list"] }
