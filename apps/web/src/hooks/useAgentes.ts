import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { AgentePublico } from '@elite/types'

export function useAgentes() {
  const [data, setData] = useState<AgentePublico[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.agentes.list().then(setData).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}
