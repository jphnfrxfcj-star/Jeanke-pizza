import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

const DEFAULT_INGREDIENTS = [
  "tomatensaus", "BBQ-tomatensaus", "mozzarella", "burrata",
  "salami", "kip", "parmaham", "ansjovis",
  "tomaat", "kerstomaatjes", "mix van tomaten", "paprika", "courgette",
  "rucola", "ajuin", "look", "olijven", "kappers",
  "koude feta", "warme feta"
]

export default async (req) => {
  try {
    const store = getStore({ name: "ingredients", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      return Response.json(data || DEFAULT_INGREDIENTS)
    }

    const pw = req.headers.get("x-admin-password")
    if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })

    if (req.method === "PUT") {
      const list = await req.json()
      await store.set("list", JSON.stringify([...new Set(list)].sort()))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/ingredients" }
