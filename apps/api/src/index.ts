import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createApp } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../..')

const PORT = Number(process.env.PORT ?? 8080)
const app = createApp()

// Serve Angular CRM — must be before React catch-all
const crmDist = path.join(ROOT, 'apps/crm/dist/crm/browser')
if (fs.existsSync(crmDist)) {
  app.use('/ELITE-CRM/ADMIN', express.static(crmDist))
  app.get('/ELITE-CRM/ADMIN/*splat', (_req, res) => {
    res.sendFile(path.join(crmDist, 'index.html'))
  })
  console.log('Serving Angular CRM from', crmDist)
}

// Serve React public site — catch-all (must be last)
const webDist = path.join(ROOT, 'apps/web/dist')
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist))
  app.get('*splat', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'))
  })
  console.log('Serving React web from', webDist)
}

app.listen(PORT, () => {
  console.log(`ELITE Nuvia API running on http://localhost:${PORT}`)
})
