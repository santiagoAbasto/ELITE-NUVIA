import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import { verifyJWT, requireModule } from './middleware/auth.js'
import { apiRateLimiter } from './middleware/rateLimiter.js'
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
import { adminReportesRouter } from './routes/adminReportes.js'
import { adminUsuariosRouter } from './routes/adminUsuarios.js'

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']

function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(name => !process.env[name] || process.env[name]!.length < 16)
  if (missing.length > 0) {
    throw new Error(
      `Configuracion invalida: faltan variables de entorno (o son demasiado cortas): ${missing.join(', ')}`,
    )
  }
}

export function createApp() {
  assertRequiredEnv()

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.basemaps.cartocdn.com'],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'https://res.cloudinary.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    } : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://elitenuvia.bo']
      : ['http://localhost:3000', 'http://localhost:4200'],
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(apiRateLimiter)

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

  // Admin — all protected with verifyJWT. Routes tied to a sidebar module are
  // additionally gated by requireModule so a COORDINADOR without that module
  // in their permisos gets a 403 straight from the API, not just a hidden
  // link in the UI.
  app.use('/api/v1/admin/pdf', verifyJWT, adminRouter)
  app.use('/api/v1/admin/upload', verifyJWT, adminUploadRouter)
  app.use('/api/v1/admin/usuarios', verifyJWT, adminUsuariosRouter)
  app.use('/api/v1/admin/agentes', verifyJWT, adminAgentesRouter)
  app.use('/api/v1/admin/captaciones', verifyJWT, requireModule('captaciones'), adminCaptacionesRouter)
  app.use('/api/v1/admin/propiedades', verifyJWT, requireModule('propiedades'), adminPropiedadesRouter)
  app.use('/api/v1/admin/leads', verifyJWT, requireModule('leads'), adminLeadsRouter)
  app.use('/api/v1/admin/eventos', verifyJWT, requireModule('agenda'), adminEventosRouter)
  app.use('/api/v1/admin/notificaciones', verifyJWT, adminNotificacionesRouter)
  app.use('/api/v1/admin/reportes', verifyJWT, requireModule('reportes'), adminReportesRouter)

  app.use(errorHandler)
  return app
}
