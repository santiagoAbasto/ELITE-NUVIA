import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { TestimonioPublico } from '@elite/types'

export function useTestimonios() {
  const [data, setData] = useState<TestimonioPublico[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.testimonios.list().then(setData).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}
