import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanke2024'

function checkAuth(req) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD
}

export default async (req) => {
  const store = getStore("pizzas")

  if (req.method === "GET") {
    const data = await store.get("list", { type: "json" }).catch(() => null)
    // Return empty array if nothing stored yet — app falls back to static JSON
    return Response.json(data || [])
  }

  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (req.method === "PUT") {
    // Full replace of pizza list
    const pizzas = await req.json()
    await store.set("list", JSON.stringify(pizzas))
    return Response.json({ success: true })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/pizzas" }
