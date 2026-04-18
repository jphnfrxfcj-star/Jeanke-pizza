import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const DEFAULT_MAX = 20
const DEFAULT_OPEN_FROM = 16

export default async (req) => {
  try {
    const store = getStore({ name: "registrations", consistency: "strong" })
    const url = new URL(req.url)

    if (req.method === "GET") {
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

      return Response.json({
        count: totalPizzas,
        max,
        openFrom,
        registrations: list.length,
        registrationDate: cfg?.registrationDate || null,
        registrationOpen: cfg?.registrationOpen ?? false,
      })
    }

    if (req.method === "POST") {
      const { name, email, pizzas = 1 } = await req.json()
      if (!name || typeof name !== 'string' || name.trim().length < 1 || name.length > 100)
        return Response.json({ error: 'Invalid name' }, { status: 400 })
      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
        return Response.json({ error: 'Invalid email' }, { status: 400 })
      const pizzaCount = Number(pizzas)
      if (!Number.isInteger(pizzaCount) || pizzaCount < 1 || pizzaCount > 20)
        return Response.json({ error: 'Invalid pizza count' }, { status: 400 })
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      if (existing.some(r => r.email.toLowerCase() === email.toLowerCase())) {
        return Response.json({ error: "already_registered" }, { status: 409 })
      }
      const updated = [...existing, { name: name.trim(), email: email.trim().toLowerCase(), pizzas: pizzaCount, registeredAt: new Date().toISOString() }]
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
      const body = await req.json()
      const existing = await store.get("config", { type: "json" }).catch(() => null) || {}
      await store.set("config", JSON.stringify({ ...existing, ...body }))
      return Response.json({ success: true })
    }

    if (req.method === "DELETE") {
      const pw = req.headers.get("x-admin-password")
      if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })
      const { email } = await req.json()
      const existing = await store.get("list", { type: "json" }).catch(() => []) || []
      const updated = existing.filter(r => r.email.toLowerCase() !== email.toLowerCase())
      await store.set("list", JSON.stringify(updated))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: ["/api/register", "/api/register/list"] }
