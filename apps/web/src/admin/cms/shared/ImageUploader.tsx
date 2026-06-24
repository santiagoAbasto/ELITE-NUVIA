import { useRef, useState } from 'react'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: string
  tip?: string
}

export default function ImageUploader({ value, onChange, label, accept = 'image/*', tip }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const tipo = accept.includes('video') || file.type.startsWith('video') ? 'media' : 'cms'
      const r = await fetch(`/api/v1/admin/upload?tipo=${tipo}`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!r.ok) throw new Error('Error al subir archivo')
      const { url } = await r.json() as { url: string }
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('video'))

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>}

      {value && (
        <div className="relative group">
          {isVideo ? (
            <video src={value} className="h-28 w-full rounded-lg object-cover bg-zinc-800" muted />
          ) : (
            <img src={value} className="h-28 w-auto rounded-lg object-cover bg-zinc-800" alt="" />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Quitar
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <span className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {value ? 'Cambiar archivo' : 'Subir archivo'}
          </>
        )}
      </button>

      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {tip && <p className="text-[11px] text-zinc-600">{tip}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
