const http = require('http')
const fs = require('fs')
const path = require('path')

const root = __dirname
const envFile = path.join(root, '.env.development.local')
try {
  const envText = fs.readFileSync(envFile, 'utf8')
  envText.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
  })
} catch (_error) {}
const port = Number(process.env.PORT || 3000)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

async function readJsonBody(request) {
  let body = ''
  for await (const chunk of request) body += chunk
  return JSON.parse(body || '{}')
}

let modelCatalogPromise
function getModelCatalog() {
  if (!modelCatalogPromise) {
    modelCatalogPromise = fetch('https://ai-gateway.vercel.sh/v1/models')
      .then((result) => result.ok ? result.json() : { data: [] })
      .then((payload) => Array.isArray(payload.data) ? payload.data.map((model) => model.id).filter(Boolean) : [])
      .catch(() => [])
  }
  return modelCatalogPromise
}

function chooseGatewayModel(modelKey, catalog) {
  if (!catalog.length) return null
  const provider = {
    claudeopus45: 'anthropic/',
    claudesonnet45: 'anthropic/',
    gpt5: 'openai/',
    gpt5mini: 'openai/',
    o3: 'openai/',
    gemini3pro: 'google/',
    gemini3flash: 'google/',
    grok4: 'xai/',
    deepseekv32: 'deepseek/',
    llama4: 'meta/'
  }[modelKey]
  const candidates = provider ? catalog.filter((id) => id.startsWith(provider)) : catalog
  return (candidates.length ? candidates : catalog).sort().at(-1)
}

async function handleAgentRequest(request, response) {
  try {
    const payload = await readJsonBody(request)
    const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : []
    const catalog = await getModelCatalog()
    const model = chooseGatewayModel(payload.model, catalog)
    if (!model) throw new Error('No AI Gateway models are available')

    const gatewayResponse = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.AI_GATEWAY_API_KEY ? { Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}` } : {}) },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are the Legendzx 3D AI Assistant. You are a practical research and project agent. Give accurate, actionable answers. You may propose code, architecture, budgets, timelines, and research plans, but never claim to have executed a side effect. Ask for confirmation before any external or destructive action. If the user asks for current facts and browsing is unavailable, say that clearly.' },
          ...messages.filter((message) => ['user', 'assistant'].includes(message.role)).map((message) => ({ role: message.role, content: String(message.content).slice(0, 12000) }))
        ],
        temperature: 0.3
      })
    })
    const result = await gatewayResponse.json()
    if (!gatewayResponse.ok) throw new Error(result.error?.message || 'AI Gateway request failed')
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify({ message: result.choices?.[0]?.message?.content || 'The agent returned an empty response.', model }))
  } catch (error) {
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: 'The live agent is unavailable right now.', detail: error.message }))
  }
}

http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  if (request.method === 'POST' && requestUrl.pathname === '/api/agent') {
    handleAgentRequest(request, response)
    return
  }
  if (requestUrl.pathname === '/config') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify({ url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '', redirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || '' }))
    return
  }
  const requested = decodeURIComponent(requestUrl.pathname)
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '')
  const filePath = path.resolve(root, relative)

  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500)
      response.end(error.code === 'ENOENT' ? 'Not Found' : 'Server Error')
      return
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' })
    response.end(data)
  })
}).listen(port, '0.0.0.0', () => {
  console.log(`Legendzx AI preview running on port ${port}`)
})
