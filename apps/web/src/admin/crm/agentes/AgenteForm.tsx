import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'
import ImageUploader from '../../cms/shared/ImageUploader'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  email: z.string().email('Correo inválido'),
  telefono: z.string().min(7, 'Mínimo 7 dígitos'),
  whatsapp: z.string().min(7, 'Mínimo 7 dígitos'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  contratoInicio: z.string().optional(),
  contratoFin: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/[0.28] outline-none transition-colors focus:border-gold/[0.50] focus:bg-white/[0.06]'
const labelClass = 'block text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.42] mb-1.5'
const errorClass = 'mt-1 text-[11px] text-red-400'

export default function AgenteForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const [foto, setFoto] = useState('')
  const [contratoUrl, setContratoUrl] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [edad, setEdad] = useState<number | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fechaNac = watch('fechaNacimiento')
  useEffect(() => {
    if (fechaNac) {
      const años = Math.floor((Date.now() - new Date(fechaNac).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      setEdad(años)
    } else setEdad(null)
  }, [fechaNac])

  useEffect(() => {
    if (!isEdit) return
    adminApi.get<Record<string, unknown>>(`/admin/agentes/${id}`)
      .then(data => {
        reset({
          nombre: data.nombre as string,
          apellido: data.apellido as string,
          primerApellido: data.primerApellido as string ?? '',
          segundoApellido: data.segundoApellido as string ?? '',
          fechaNacimiento: data.fechaNacimiento ? (data.fechaNacimiento as string).split('T')[0] : '',
          email: data.email as string,
          telefono: data.telefono as string,
          whatsapp: data.whatsapp as string,
          contratoInicio: data.contratoInicio ? (data.contratoInicio as string).split('T')[0] : '',
          contratoFin: data.contratoFin ? (data.contratoFin as string).split('T')[0] : '',
        })
        setFoto(data.foto as string ?? '')
        setContratoUrl(data.contratoUrl as string ?? '')
      })
      .finally(() => setLoading(false))
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { ...data, foto, contratoUrl }
      if (isEdit) {
        await adminApi.put(`/admin/agentes/${id}`, payload)
        toast.success('Agente actualizado')
      } else {
        await adminApi.post('/admin/agentes', payload)
        toast.success('Agente creado correctamente')
      }
      navigate('/admin/agentes')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          {isEdit ? 'Editar agente' : 'Nuevo agente'}
        </span>
        <h1 className="mt-3 text-[28px] font-black tracking-[-0.04em] text-white">
          {isEdit ? 'Actualizar datos del agente' : 'Registrar nuevo agente'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Foto */}
        <div className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
          <p className="mb-4 text-[13px] font-bold text-white">Foto de perfil</p>
          <ImageUploader value={foto} onChange={setFoto} label="Foto del agente" />
        </div>

        {/* Datos personales */}
        <div className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
          <p className="text-[13px] font-bold text-white">Datos personales</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primer nombre *</label>
              <input {...register('nombre')} placeholder="María" className={inputClass} />
              {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Apellido *</label>
              <input {...register('apellido')} placeholder="García" className={inputClass} />
              {errors.apellido && <p className={errorClass}>{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primer apellido</label>
              <input {...register('primerApellido')} placeholder="López" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Segundo apellido</label>
              <input {...register('segundoApellido')} placeholder="Mamani" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Fecha de nacimiento
              {edad !== null && <span className="ml-2 text-gold normal-case tracking-normal">{edad} años</span>}
            </label>
            <input type="date" {...register('fechaNacimiento')} className={inputClass} />
          </div>
        </div>

        {/* Contacto */}
        <div className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
          <p className="text-[13px] font-bold text-white">Datos de contacto</p>

          <div>
            <label className={labelClass}>Correo corporativo *</label>
            <input type="email" {...register('email')} placeholder="nombre@elitenuvia.bo" className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono *</label>
              <input {...register('telefono')} placeholder="+591 7xxx xxxx" className={inputClass} />
              {errors.telefono && <p className={errorClass}>{errors.telefono.message}</p>}
            </div>
            <div>
              <label className={labelClass}>WhatsApp *</label>
              <input {...register('whatsapp')} placeholder="+591 7xxx xxxx" className={inputClass} />
              {errors.whatsapp && <p className={errorClass}>{errors.whatsapp.message}</p>}
            </div>
          </div>
        </div>

        {/* Contrato */}
        <div className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
          <p className="text-[13px] font-bold text-white">Contrato</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Inicio del contrato</label>
              <input type="date" {...register('contratoInicio')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fin del contrato</label>
              <input type="date" {...register('contratoFin')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Documento de contrato (PDF)</label>
            <ImageUploader
              value={contratoUrl}
              onChange={setContratoUrl}
              accept=".pdf,application/pdf"
              tip="PDF hasta 20 MB"
            />
            {contratoUrl && (
              <a href={contratoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[12px] text-gold hover:underline">
                Ver contrato actual
              </a>
            )}
          </div>
        </div>

        {/* Acceso */}
        {!isEdit && (
          <div className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
            <p className="text-[13px] font-bold text-white">Credenciales de acceso</p>
            <div>
              <label className={labelClass}>Contraseña temporal *</label>
              <input type="password" {...register('password')} placeholder="Mínimo 8 caracteres" className={inputClass} />
              {errors.password && <p className={errorClass}>{errors.password.message}</p>}
              <p className="mt-1.5 text-[11px] text-white/[0.36]">El agente deberá cambiarla en su primer acceso.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/agentes')}
            className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.035] py-3 text-[14px] font-semibold text-white/[0.62] transition-colors hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl border border-gold/[0.26] bg-gold/[0.12] py-3 text-[14px] font-bold text-gold transition-colors hover:bg-gold/[0.20] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEdit ? 'Actualizar agente' : 'Crear agente'}
          </button>
        </div>
      </form>
    </div>
  )
}
