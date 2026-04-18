import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

function checkAuth(req) {
  return !!ADMIN_PASSWORD && req.headers.get("x-admin-password") === ADMIN_PASSWORD
}

export default async (req) => {
  try {
    const store = getStore({ name: "wines", consistency: "strong" })

    if (req.method === "GET") {
      const data = await store.get("list", { type: "json" }).catch(() => null)
      return Response.json(data || [])
    }

    if (!checkAuth(req)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (req.method === "PUT") {
      const wines = await req.json()
      await store.set("list", JSON.stringify(wines))
      return Response.json({ success: true })
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 })
  } catch (err) {
    console.error("wines function error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/wines" }
