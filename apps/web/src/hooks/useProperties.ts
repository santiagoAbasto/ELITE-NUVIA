import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { PropiedadPublica, PropiedadesCount } from '@elite/types'

export function usePropiedadesDestacadas() {
  const [data, setData] = useState<PropiedadPublica[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.propiedades.destacadas().then(setData).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}

export function usePropiedadesCount() {
  const [data, setData] = useState<PropiedadesCount>({ venta: 0, alquiler: 0, anticretico: 0, total: 0 })
  useEffect(() => {
    api.propiedades.count().then(setData).catch(() => {})
  }, [])
  return data
}
