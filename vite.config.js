import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import { blankBots, mergeStatus } from './src/status-model.js'

function loadSeed() {
  try {
    const file = path.resolve('public/status.json')
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return mergeStatus(blankBots(), parsed).bots
  } catch {
    return blankBots()
  }
}

function statusApi() {
  let bots = loadSeed()

  function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Cache-Control', 'no-store')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ source: 'memory', bots }))
      return
    }

    if (req.method === 'POST') {
      const chunks = []
      let size = 0
      req.on('data', (chunk) => {
        size += chunk.length
        if (size > 32_000) {
          res.statusCode = 413
          res.end()
          req.destroy()
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => {
        if (res.writableEnded) return
        let payload = {}
        const raw = Buffer.concat(chunks).toString('utf8')
        if (raw) {
          try {
            payload = JSON.parse(raw)
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Body must be JSON.' }))
            return
          }
        }
        const result = mergeStatus(bots, payload)
        const changed = JSON.stringify(result.bots) !== JSON.stringify(bots)
        if (result.errors.length && !changed) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: result.errors[0], errors: result.errors }))
          return
        }
        bots = result.bots
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true, errors: result.errors, bots }))
      })
      return
    }

    res.statusCode = 405
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    res.end()
  }

  const attach = (server) => {
    server.middlewares.use('/api/status', handler)
  }

  return {
    name: 'status-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

export default defineConfig({
  server: { host: '0.0.0.0', port: 4317, strictPort: true },
  preview: { host: '0.0.0.0', port: 4318, strictPort: true },
  plugins: [statusApi()],
})
