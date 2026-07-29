import type { Request, Response, NextFunction } from 'express'

interface PublicError {
  error: string
  message: string
  statusCode: number
}

type ErrorLike = Error & {
  code?: string
  expose?: boolean
  status?: number
  statusCode?: number
}

const GENERIC_ERROR: PublicError = {
  error: 'Error interno',
  message: 'No pudimos completar la solicitud. Intenta nuevamente en unos minutos.',
  statusCode: 500,
}

const DATABASE_UNAVAILABLE: PublicError = {
  error: 'Servicio no disponible',
  message: 'No pudimos conectar con el servicio en este momento. Intenta nuevamente en unos minutos.',
  statusCode: 503,
}

function isDatabaseUnavailable(err: ErrorLike): boolean {
  return (
    err.name === 'PrismaClientInitializationError' ||
    err.code === 'P1001' ||
    /can't reach database server|connect econnrefused|p1001/i.test(err.message)
  )
}

function isInvalidJson(err: ErrorLike): boolean {
  return err instanceof SyntaxError && 'body' in err
}

function labelForStatus(statusCode: number): string {
  if (statusCode === 400) return 'Solicitud invalida'
  if (statusCode === 401) return 'Sesion requerida'
  if (statusCode === 403) return 'Sin permisos'
  if (statusCode === 404) return 'No encontrado'
  if (statusCode === 429) return 'Demasiados intentos'
  return 'No pudimos completar la solicitud'
}

function messageForStatus(statusCode: number): string {
  if (statusCode === 400) return 'Revisa los datos enviados e intenta nuevamente.'
  if (statusCode === 401) return 'Inicia sesion nuevamente para continuar.'
  if (statusCode === 403) return 'No tienes permisos para realizar esta accion.'
  if (statusCode === 404) return 'El recurso solicitado no esta disponible.'
  if (statusCode === 429) return 'Espera unos minutos antes de volver a intentar.'
  return GENERIC_ERROR.message
}

function publicErrorFor(err: ErrorLike): PublicError {
  if (isDatabaseUnavailable(err)) return DATABASE_UNAVAILABLE

  if (isInvalidJson(err)) {
    return {
      error: 'Solicitud invalida',
      message: 'La solicitud no tiene un formato valido.',
      statusCode: 400,
    }
  }

  const statusCode = err.statusCode ?? err.status
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return {
      error: labelForStatus(statusCode),
      message: err.expose && err.message ? err.message : messageForStatus(statusCode),
      statusCode,
    }
  }

  return GENERIC_ERROR
}

export function errorHandler(err: ErrorLike, _req: Request, res: Response, _next: NextFunction): void {
  const publicError = publicErrorFor(err)

  if (process.env.NODE_ENV === 'production') {
    console.error(`[${publicError.statusCode}] ${err.name}: ${err.message}`)
  } else {
    console.error(err)
  }

  res.status(publicError.statusCode).json(publicError)
}
