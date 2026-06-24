import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import RichTextEditor from '../shared/RichTextEditor'
import ImageUploader from '../shared/ImageUploader'

interface Servicio { id: string; titulo: string; descripcion: string; imagenUrl?: string }
interface DatosServicios { titulo?: string; servicios?: Servicio[] }
interface Props { datos: DatosServicios; onChange: (d: DatosServicios) => void }

function ServicioItem({
  servicio, onUpdate, onRemove,
}: {
  servicio: Servicio
  onUpdate: (s: Servicio) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: servicio.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-zinc-600 hover:text-zinc-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <input
          value={servicio.titulo}
          onChange={e => onUpdate({ ...servicio, titulo: e.target.value })}
          placeholder="Nombre del servicio"
          className="flex-1 bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-amber-500"
        />
        <button onClick={onRemove} className="text-zinc-600 hover:text-red-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <RichTextEditor
        value={servicio.descripcion}
        onChange={val => onUpdate({ ...servicio, descripcion: val })}
        minHeight="80px"
      />
      <ImageUploader
        value={servicio.imagenUrl}
        onChange={url => onUpdate({ ...servicio, imagenUrl: url })}
        label="Imagen del servicio"
      />
    </div>
  )
}

export default function ServiciosEditor({ datos, onChange }: Props) {
  const servicios = datos.servicios ?? []

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = servicios.findIndex(s => s.id === active.id)
    const newIdx = servicios.findIndex(s => s.id === over.id)
    onChange({ ...datos, servicios: arrayMove(servicios, oldIdx, newIdx) })
  }

  const addServicio = () => onChange({
    ...datos,
    servicios: [...servicios, { id: `s-${Date.now()}`, titulo: '', descripcion: '', imagenUrl: '' }],
  })

  const updateServicio = (idx: number, s: Servicio) => {
    const next = [...servicios]
    next[idx] = s
    onChange({ ...datos, servicios: next })
  }

  const removeServicio = (idx: number) => onChange({
    ...datos,
    servicios: servicios.filter((_, i) => i !== idx),
  })

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Título de sección</label>
        <input
          value={datos.titulo ?? ''}
          onChange={e => onChange({ ...datos, titulo: e.target.value })}
          placeholder="Nuestros Servicios"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={servicios.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {servicios.map((s, i) => (
              <ServicioItem
                key={s.id}
                servicio={s}
                onUpdate={updated => updateServicio(i, updated)}
                onRemove={() => removeServicio(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addServicio}
        className="w-full py-2.5 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-colors"
      >
        + Agregar servicio
      </button>
    </div>
  )
}
