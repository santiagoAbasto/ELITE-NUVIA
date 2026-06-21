import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://elitenuvia.bo']
      : ['http://localhost:3000'],
    credentials: true,
  }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() })
  })

  app.use(errorHandler)
  return app
}
