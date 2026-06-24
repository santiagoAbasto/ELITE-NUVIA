import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import { verifyJWT } from './middleware/auth.js'
import { propiedadesRouter } from './routes/propiedades.js'
import { agentesRouter } from './routes/agentes.js'
import { testimoniosRouter } from './routes/testimonios.js'
import { authRouter } from './routes/auth.js'
import { adminRouter } from './routes/admin.js'
import { leadsRouter } from './routes/leads.js'
import { newsletterRouter } from './routes/newsletter.js'
import { sitemapRouter } from './routes/sitemap.js'
import { cmsRouter } from './routes/cms.js'
import { adminAgentesRouter } from './routes/adminAgentes.js'
import { adminCaptacionesRouter } from './routes/adminCaptaciones.js'
import { adminPropiedadesRouter } from './routes/adminPropiedades.js'
import { adminLeadsRouter } from './routes/adminLeads.js'
import { adminEventosRouter } from './routes/adminEventos.js'
import { adminNotificacionesRouter } from './routes/adminNotificaciones.js'
import { adminUploadRouter } from './routes/adminUpload.js'

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

  // Public routes
  app.use('/api/v1/propiedades', propiedadesRouter)
  app.use('/api/v1/agentes', agentesRouter)
  app.use('/api/v1/testimonios', testimoniosRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/leads', leadsRouter)
  app.use('/api/v1/newsletter', newsletterRouter)
  app.use('/', sitemapRouter)

  // CMS — GET public, PUT protected (handled inside router)
  app.use('/api/v1/cms', cmsRouter)

  // Admin — all protected with verifyJWT
  app.use('/api/v1/admin/pdf', verifyJWT, adminRouter)
  app.use('/api/v1/admin/upload', verifyJWT, adminUploadRouter)
  app.use('/api/v1/admin/agentes', verifyJWT, adminAgentesRouter)
  app.use('/api/v1/admin/captaciones', verifyJWT, adminCaptacionesRouter)
  app.use('/api/v1/admin/propiedades', verifyJWT, adminPropiedadesRouter)
  app.use('/api/v1/admin/leads', verifyJWT, adminLeadsRouter)
  app.use('/api/v1/admin/eventos', verifyJWT, adminEventosRouter)
  app.use('/api/v1/admin/notificaciones', verifyJWT, adminNotificacionesRouter)

  app.use(errorHandler)
  return app
}
