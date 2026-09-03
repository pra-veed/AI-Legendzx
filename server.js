const http = require('http')
const fs = require('fs')
const path = require('path')

const root = __dirname
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
  const requested = decodeURIComponent(request.url.split('?')[0])
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
