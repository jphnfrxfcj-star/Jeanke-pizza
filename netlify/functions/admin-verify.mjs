export default async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  if (!ADMIN_PASSWORD) return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  try {
    const { password } = await req.json()
    if (password !== ADMIN_PASSWORD) return Response.json({ ok: false }, { status: 401 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export const config = { path: '/api/admin-verify' }
