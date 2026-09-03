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

http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
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
