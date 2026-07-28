import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const SERVICE_KEYS = ["box", "catering", "workshops", "ovens"]
const MODES = ["live", "concept", "off"]
const MAX_BYTES = 256 * 1024

function checkAuth(req) {
  return !!ADMIN_PASSWORD && req.headers.get("x-admin-password") === ADMIN_PASSWORD
}

export default async (req) => {
  try {
    const store = getStore({ name: "services", consistency: "strong" })

    if (req.method === "GET") {
      // Leeg object = nog niets bewaard; de frontend valt terug op services.json
      const data = await store.get("config", { type: "json" }).catch(() => null)
      return Response.json(data || {})
    }

    if (!checkAuth(req)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "PUT") {
      const body = await req.json()
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.json({ error: "Invalid body" }, { status: 400 })
      }

      // Alleen bekende diensten bewaren, en de modus moet geldig zijn — een
      // onbekende modus zou een dienst onzichtbaar maken zonder dat iemand
      // het merkt.
      const clean = {}
      for (const key of SERVICE_KEYS) {
        const service = body[key]
        if (!service || typeof service !== "object") continue
        if (service.mode !== undefined && !MODES.includes(service.mode)) {
          return Response.json({ error: `Invalid mode for ${key}` }, { status: 400 })
        }
        clean[key] = service
      }

      if (!Object.keys(clean).length) {
        return Response.json({ error: "No known services in body" }, { status: 400 })
      }

      // Deze data wordt bij elke paginaweergave opgehaald. Een grens voorkomt
      // dat één verkeerde plakactie de site voor iedereen traag maakt.
      const serialized = JSON.stringify(clean)
      if (serialized.length > MAX_BYTES) {
        return Response.json(
          { error: `Dienstendata te groot (${Math.round(serialized.length / 1024)} kB, max ${MAX_BYTES / 1024} kB)` },
          { status: 413 }
        )
      }

      await store.set("config", serialized)
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    // Interne foutteksten niet doorgeven aan de client
    console.error("services function error:", err)
    return Response.json({ error: "Serverfout" }, { status: 500 })
  }
}

export const config = { path: "/api/services" }
