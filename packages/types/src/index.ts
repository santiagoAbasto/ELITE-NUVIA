export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETICO'
export type TipoInmueble = 'CASA' | 'DEPARTAMENTO' | 'GARZONIER' | 'TERRENO' | 'LOCAL' | 'OTRO'
export type Rol = 'SUPER_ADMIN' | 'AGENTE' | 'COORDINADOR'
export type LeadEstado = 'NUEVO' | 'EN_CONTACTO' | 'INTERESADO' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO'

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
}
