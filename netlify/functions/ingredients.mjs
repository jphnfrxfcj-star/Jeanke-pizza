import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

const DEFAULT_INGREDIENTS = [
  "tomatensaus", "BBQ-tomatensaus", "mozzarella", "burrata",
  "salami", "kip", "parmaham", "ansjovis",
  "tomaat", "kerstomaatjes", "mix van tomaten", "paprika", "courgette",
  "rucola", "ajuin", "look", "olijven", "kappers",
  "koude feta", "warme feta"
]

// Migrate old string[] to { name, cost }[]
function normalize(data) {
  if (!Array.isArray(data)) return DEFAULT_INGREDIENTS.map(name => ({ name, cost: 0 }))
  return data.map(i => typeof i === 'string' ? { name: i, cost: 0 } : i)
}

export default async (req) => {
  try {
    const store = getStore({ name: "ingredients", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      return Response.json(normalize(data))
    }

    const pw = req.headers.get("x-admin-password")
    if (pw !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })

    if (req.method === "PUT") {
      const list = await req.json()
      const normalized = normalize(list)
      // Dedup by name, sort alphabetically
      const deduped = [...new Map(normalized.map(i => [i.name, i])).values()]
        .sort((a, b) => a.name.localeCompare(b.name))
      await store.set("list", JSON.stringify(deduped))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/ingredients" }
