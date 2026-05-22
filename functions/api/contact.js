const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
}

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...init.headers,
    },
    status: init.status ?? 200,
  })

const readJson = async (req) => {
  const contentType = req.headers.get("content-type") || ""
  if (!contentType.toLowerCase().includes("application/json")) return null
  try {
    return await req.json()
  } catch {
    return null
  }
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim())

const newId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function onRequest(context) {
  const { request } = context

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 })
  }

  const payload = await readJson(request)
  if (!payload) return json({ ok: false, error: "INVALID_JSON" }, { status: 400 })

  const name = String(payload.name || "").trim()
  const email = String(payload.email || "").trim()
  const message = String(payload.message || "").trim()

  if (!name || name.length > 80) return json({ ok: false, error: "INVALID_NAME" }, { status: 400 })
  if (!isEmail(email) || email.length > 120) return json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 })
  if (!message || message.length > 2000) return json({ ok: false, error: "INVALID_MESSAGE" }, { status: 400 })

  return json({ ok: true, requestId: newId() })
}

