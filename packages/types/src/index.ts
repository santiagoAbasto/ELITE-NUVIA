export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETICO'
export type TipoInmueble = 'CASA' | 'DEPARTAMENTO' | 'GARZONIER' | 'TERRENO' | 'LOCAL' | 'OTRO'
export type Rol = 'SUPER_ADMIN' | 'AGENTE' | 'COORDINADOR'
export type LeadEstado = 'NUEVO' | 'EN_CONTACTO' | 'INTERESADO' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO'

// Admin modules that can be granted/revoked per COORDINADOR user. SUPER_ADMIN
// always has every module; AGENTE has its own fixed, scoped access.
export const ADMIN_MODULES = ['cms', 'propiedades', 'captaciones', 'leads', 'agenda', 'reportes'] as const
export type AdminModulo = typeof ADMIN_MODULES[number]

export const ADMIN_MODULE_LABELS: Record<AdminModulo, string> = {
  cms: 'Contenido del sitio (CMS)',
  propiedades: 'Propiedades',
  captaciones: 'Captaciones',
  leads: 'Leads',
  agenda: 'Agenda',
  reportes: 'Reportes',
}

export interface Foto {
  id: string
  url: string
  urlThumb: string
  orden: number
  propiedadId: string
}

export interface AgentePublico {
  id: string
  slug: string
  nombre: string
  apellido: string
  telefono: string
  whatsapp: string
  foto: string | null
  bio: string | null
  propiedadesCount?: number
}

export interface PropiedadPublica {
  id: string
  slug: string
  titulo: string
  descripcion: string
  tipo: TipoOperacion
  tipoInmueble: TipoInmueble
  precio: number
  moneda: string
  ciudad: string
  zona: string | null
  direccion: string | null
  dormitorios: number | null
  banos: number | null
  superficieM2: number | null
  garage: boolean
  amueblado: boolean
  piscina: boolean
  destacada: boolean
  fotos: Foto[]
  agente: AgentePublico
  createdAt: string
}

export interface TestimonioPublico {
  id: string
  nombre: string
  ciudad: string
  texto: string
  rating: number
  tipo: TipoOperacion
  foto: string | null
}

export interface PropiedadesCount {
  venta: number
  alquiler: number
  anticretico: number
  total: number
}

export interface PropiedadesListResponse {
  data: PropiedadPublica[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PropiedadesFilter {
  tipo?: TipoOperacion
  tipoInmueble?: TipoInmueble
  ciudad?: string
  precioMin?: number
  precioMax?: number
  dormitorios?: number
  banos?: number
  garage?: boolean
  amueblado?: boolean
  piscina?: boolean
  page?: number
  pageSize?: number
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface AuthPayload {
  userId: string
  rol: Rol
  nombre: string
  permisos: AdminModulo[]
}

// CRM types
export type TipoEvento = 'VISITA' | 'LLAMADA' | 'CIERRE' | 'REUNION'
export type EstadoCaptacion = 'EN_NEGOCIACION' | 'CAPTADA' | 'PUBLICADA' | 'EN_CIERRE' | 'CERRADA' | 'EXPIRADA'
export type Temperatura = 'FRIO' | 'TIBIO' | 'CALIENTE'

export interface AdminAgente {
  id: string
  nombre: string
  apellido: string
  primerApellido?: string
  segundoApellido?: string
  email: string
  telefono: string
  whatsapp: string
  foto?: string | null
  activo: boolean
  contratoFin?: string | null
  _count?: { propiedades: number; captaciones: number; leads: number }
}

export interface Captacion {
  id: string
  estado: EstadoCaptacion
  agenteId: string
  propietarioNombre: string
  propietarioTelefono: string
  tipoInmueble: TipoInmueble
  tipo: TipoOperacion
  ciudad: string
  precioSolicitado: number
  moneda: string
  createdAt: string
  updatedAt: string
}

export interface Evento {
  id: string
  titulo: string
  tipo: TipoEvento
  inicio: string
  fin: string
  agenteId: string
  leadId?: string | null
  propiedadId?: string | null
  notas?: string | null
}

export interface SiteContent {
  seccion: string
  datos: Record<string, unknown>
  updatedAt?: string
}
