/**
 * Vercel Edge: forwards same-origin /api/* to Azure (or any backend).
 * Set LIBRA_BACKEND_URL on Vercel (no VITE_ prefix) — server-only, not exposed to the browser.
 * Rewritten URL: /api/proxy?path=auth/login → upstream …/auth/login
 */
export const config = { runtime: 'edge' }

const HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
])

/** @param {Request} req */
export default async function handler(req) {
  const u = new URL(req.url)
  let path = u.searchParams.get('path') ?? ''
  path = String(path).replace(/^\/+/, '')

  const backend = process.env.LIBRA_BACKEND_URL?.replace(/\/+$/, '')
  if (!backend) {
    return Response.json(
      {
        detail:
          'LIBRA_BACKEND_URL is not set. In Vercel → Settings → Environment Variables, add LIBRA_BACKEND_URL = your API base (https://….azurewebsites.net, no trailing slash).',
      },
      { status: 503 },
    )
  }

  const rest = new URLSearchParams(u.searchParams)
  rest.delete('path')
  const qs = rest.toString()
  const target = `${backend}/${path}${qs ? `?${qs}` : ''}`

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === 'host' || HOP.has(k)) return
    headers.set(key, value)
  })

  /** @type {RequestInit} */
  const init = {
    method: req.method,
    headers,
    redirect: 'manual',
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
  }

  const upstream = await fetch(target, init)

  const out = new Headers(upstream.headers)
  for (const name of [...out.keys()]) {
    if (name.toLowerCase().startsWith('access-control-')) {
      out.delete(name)
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  })
}
