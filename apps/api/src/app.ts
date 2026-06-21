import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import { propiedadesRouter } from './routes/propiedades.js'
import { agentesRouter } from './routes/agentes.js'
import { testimoniosRouter } from './routes/testimonios.js'
import { authRouter } from './routes/auth.js'
import { adminRouter } from './routes/admin.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://elitenuvia.bo']
      : ['http://localhost:3000', 'http://localhost:4200'],
    credentials: true,
  }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() })
  })

  app.use('/api/v1/propiedades', propiedadesRouter)
  app.use('/api/v1/agentes', agentesRouter)
  app.use('/api/v1/testimonios', testimoniosRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/admin', adminRouter)

  app.use(errorHandler)
  return app
}
