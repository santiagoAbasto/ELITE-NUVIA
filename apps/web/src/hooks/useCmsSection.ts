import { useEffect, useState } from 'react'
import { withCmsDefaults } from '../lib/cmsDefaults'

interface SiteContentResponse<T> {
  seccion: string
  datos: T
}

export function useCmsSection<T extends object>(seccion: string, fallback: T) {
  const [data, setData] = useState<T>(() => withCmsDefaults(seccion, fallback as Record<string, unknown>) as T)

  useEffect(() => {
    let active = true

    fetch(`/api/v1/cms/${seccion}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`CMS ${res.status}`)
        return res.json() as Promise<SiteContentResponse<Record<string, unknown>>>
      })
      .then(res => {
        if (active) setData(withCmsDefaults(seccion, { ...(fallback as Record<string, unknown>), ...(res.datos ?? {}) }) as T)
      })
      .catch(() => {
        if (active) setData(withCmsDefaults(seccion, fallback as Record<string, unknown>) as T)
      })

    return () => { active = false }
  }, [fallback, seccion])

  return data
}
