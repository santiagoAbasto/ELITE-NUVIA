import { useEffect, useState } from 'react'
import type { PropiedadesListResponse } from '@elite/types'
import { api } from '../../lib/api'

interface MapPanelProps {
  ciudad: string
}

// City-level coordinates for Bolivia
const CITY_COORDS: Record<string, [number, number]> = {
  'Cochabamba': [-17.3935, -66.157],
  'Santa Cruz': [-17.7833, -63.1821],
  'La Paz': [-16.4955, -68.1336],
  'Oruro': [-17.9686, -67.1103],
}

const DEFAULT_CENTER: [number, number] = [-17.3935, -66.157] // Cochabamba

interface CityInfo {
  coords: [number, number]
  nombre: string
  count: number
}

type MapComponents = {
  MapContainer: typeof import('react-leaflet')['MapContainer']
  TileLayer: typeof import('react-leaflet')['TileLayer']
  Marker: typeof import('react-leaflet')['Marker']
  Popup: typeof import('react-leaflet')['Popup']
}

export function MapPanel({ ciudad }: MapPanelProps) {
  const [cityInfos, setCityInfos] = useState<CityInfo[]>([])
  const [MapComps, setMapComps] = useState<MapComponents | null>(null)

  // Lazy-load react-leaflet to avoid SSR issues
  useEffect(() => {
    import('react-leaflet').then(({ MapContainer, TileLayer, Marker, Popup }) => {
      setMapComps({ MapContainer, TileLayer, Marker, Popup })
    })
  }, [])

  // Fetch property counts per city (or for selected city)
  useEffect(() => {
    const citiesToFetch = ciudad ? [ciudad] : Object.keys(CITY_COORDS)

    Promise.all(
      citiesToFetch.map(c =>
        api.propiedades
          .list({ ciudad: c, pageSize: 1 })
          .then((r: PropiedadesListResponse) => ({
            coords: CITY_COORDS[c] ?? DEFAULT_CENTER,
            nombre: c,
            count: r.total,
          }))
          .catch(() => ({
            coords: CITY_COORDS[c] ?? DEFAULT_CENTER,
            nombre: c,
            count: 0,
          }))
      )
    ).then(setCityInfos)
  }, [ciudad])

  if (!MapComps) {
    return (
      <div className="h-[200px] rounded-xl bg-[#f5f0e6] flex items-center justify-center text-[#8a9080] text-sm">
        Cargando mapa…
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComps

  const center: [number, number] = ciudad
    ? (CITY_COORDS[ciudad] ?? DEFAULT_CENTER)
    : DEFAULT_CENTER

  const zoom = ciudad ? 13 : 7

  return (
    <div className="h-[200px] rounded-xl overflow-hidden border border-[#e8e3d8]">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {cityInfos.map(info => (
          <Marker key={info.nombre} position={info.coords}>
            <Popup>
              <div style={{ minWidth: '140px' }}>
                <div
                  style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: '#0D3B27' }}
                >
                  {info.nombre}
                </div>
                <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px' }}>
                  {info.count} propiedad{info.count !== 1 ? 'es' : ''}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
