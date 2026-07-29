import rateLimit from 'express-rate-limit'

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos', message: 'Vuelve a intentar en unos minutos.', statusCode: 429 },
  keyGenerator: (req) => req.ip ?? 'unknown',
})

// Baseline limiter applied to every request — blunts scraping/enumeration and
// generic bot/DoS traffic without affecting normal browsing or CRM usage.
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes', message: 'Espera un momento antes de continuar.', statusCode: 429 },
  keyGenerator: (req) => req.ip ?? 'unknown',
})

// Tighter limiter for unauthenticated write endpoints exposed to the public
// site (lead forms, newsletter signup) — the main target for spam bots.
export const publicWriteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados envios',
    message: 'Alcanzaste el limite de envios. Intenta nuevamente mas tarde.',
    statusCode: 429,
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
})
