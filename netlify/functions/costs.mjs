import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

const DEFAULTS = {
  hout: 0.50,
  bloem: 0.30,
  saus: 0.40,
  kaas: 1.20,
}

export default async (req) => {
  const store = getStore("costs")

  if (req.method === "GET") {
    const data = await store.get("base", { type: "json" }).catch(() => null)
    return Response.json(data || DEFAULTS)
  }

  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (req.method === "PUT") {
    const body = await req.json()
    await store.set("base", JSON.stringify(body))
    return Response.json({ success: true })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/costs" }
