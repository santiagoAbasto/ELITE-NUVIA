import rateLimit from 'express-rate-limit'

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Demasiados intentos de login. Espera 15 minutos.', statusCode: 429 },
  keyGenerator: (req) => req.ip ?? 'unknown',
})
