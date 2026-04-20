import { getStore } from "@netlify/blobs"

export default async (req) => {
  const store = getStore({ name: "newsletter-subscribers", consistency: "strong" })
  const url = new URL(req.url)
  let token = url.searchParams.get("token")

  // Support List-Unsubscribe-Post one-click (POST with form body)
  if (req.method === "POST" && !token) {
    try {
      const body = await req.text()
      token = new URLSearchParams(body).get("token") || url.searchParams.get("token")
    } catch {}
  }

  if (!token) return Response.json({ error: "Token vereist" }, { status: 400 })

  const subscribers = await store.get("subscribers", { type: "json" }).catch(() => null) || []
  const sub = subscribers.find(s => s.unsubscribe_token === token)
  if (!sub) return Response.json({ error: "Token niet gevonden" }, { status: 404 })

  sub.status = "unsubscribed"
  await store.set("subscribers", JSON.stringify(subscribers))

  return Response.json({ success: true, name: sub.name || sub.email })
}

export const config = { path: "/api/unsubscribe" }
