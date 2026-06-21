import type {
  PropiedadPublica, PropiedadesListResponse, PropiedadesFilter,
  PropiedadesCount, AgentePublico, TestimonioPublico
} from '@elite/types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  propiedades: {
    list: (filter?: PropiedadesFilter) =>
      get<PropiedadesListResponse>('/api/v1/propiedades', filter as Record<string, string | number | boolean>),
    destacadas: () =>
      get<PropiedadPublica[]>('/api/v1/propiedades/destacadas'),
    count: () =>
      get<PropiedadesCount>('/api/v1/propiedades/count'),
    bySlug: (slug: string) =>
      get<PropiedadPublica>(`/api/v1/propiedades/${slug}`),
  },
  agentes: {
    list: () =>
      get<AgentePublico[]>('/api/v1/agentes'),
    bySlug: (slug: string) =>
      get<AgentePublico & { propiedades: PropiedadPublica[] }>(`/api/v1/agentes/${slug}`),
  },
  testimonios: {
    list: () =>
      get<TestimonioPublico[]>('/api/v1/testimonios'),
  },
}
