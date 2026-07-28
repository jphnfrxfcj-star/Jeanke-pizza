import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const SERVICE_KEYS = ["box", "catering", "workshops", "ovens"]
const MODES = ["live", "concept", "off"]

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

      await store.set("config", JSON.stringify(clean))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("services function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/services" }
