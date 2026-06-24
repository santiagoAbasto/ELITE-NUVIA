# 06 — CMS Editor + Properties Module

## Files to create

- `apps/web/src/admin/cms/CmsShell.tsx`
- `apps/web/src/admin/cms/sections/HeroEditor.tsx`
- `apps/web/src/admin/cms/sections/ServiciosEditor.tsx`
- `apps/web/src/admin/cms/sections/NosotrosEditor.tsx`
- `apps/web/src/admin/cms/sections/ContactoEditor.tsx`
- `apps/web/src/admin/cms/sections/FooterEditor.tsx`
- `apps/web/src/admin/cms/shared/RichTextEditor.tsx`
- `apps/web/src/admin/cms/shared/ImageUploader.tsx`
- `apps/web/src/admin/crm/propiedades/PropiedadesPage.tsx`
- `apps/web/src/admin/crm/propiedades/PropiedadDetail.tsx`

---

## Task 1 — TipTap RichTextEditor component

- [ ] Create `apps/web/src/admin/cms/shared/RichTextEditor.tsx`

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Props { value: string; onChange: (html: string) => void }

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })
  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      <div className="bg-zinc-800 border-b border-zinc-700 flex gap-1 p-2">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 text-sm text-white rounded hover:bg-zinc-700 font-bold">B</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 text-sm text-white rounded hover:bg-zinc-700 italic">I</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-2 py-1 text-sm text-white rounded hover:bg-zinc-700">•</button>
      </div>
      <EditorContent editor={editor} className="prose prose-invert max-w-none p-3 min-h-[120px] text-white" />
    </div>
  )
}
```

---

## Task 2 — ImageUploader (Cloudinary via API)

- [ ] Create `apps/web/src/admin/cms/shared/ImageUploader.tsx`

```tsx
interface Props { value: string; onChange: (url: string) => void; label?: string }

export default function ImageUploader({ value, onChange, label }: Props) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/v1/admin/upload', { method: 'POST', credentials: 'include', body: fd })
    const { url } = await r.json()
    onChange(url)
  }
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-zinc-400">{label}</p>}
      {value && <img src={value} className="h-24 rounded-lg object-cover" />}
      <input type="file" accept="image/*,video/*" onChange={handleFile} className="text-sm text-zinc-400" />
    </div>
  )
}
```

Add `POST /api/v1/admin/upload` to API (multipart, sends to Cloudinary, returns `{ url }`).

---

## Task 3 — CMS Shell

- [ ] Create `apps/web/src/admin/cms/CmsShell.tsx`
  - Routes: `/admin/cms/:seccion`
  - Loads `GET /api/v1/cms/:seccion` on mount
  - Renders matching section editor component
  - Save button → `PUT /api/v1/cms/:seccion` with form state
  - Toast on success/error

---

## Task 4 — Section editors

Each editor receives `{ datos: Record<string, unknown>; onChange: (datos) => void }` props.

- [ ] `HeroEditor.tsx` — fields: videoUrl (ImageUploader), titulo (input), subtitulo (input), ctaTexto (input), ctaUrl (input)
- [ ] `ServiciosEditor.tsx` — array of services, each: titulo, descripcion (RichTextEditor), imagenUrl (ImageUploader). Add/remove/reorder with @dnd-kit
- [ ] `NosotrosEditor.tsx` — mision (RichTextEditor), array of timeline entries (año, texto), stats array (numero, etiqueta)
- [ ] `ContactoEditor.tsx` — direccion, telefono, email, mapUrl, horario (RichTextEditor)
- [ ] `FooterEditor.tsx` — logoUrl (ImageUploader), links array, socialLinks (instagram, facebook, whatsapp), textoLegal

---

## Task 5 — Properties CRM module (view + conditional edit)

- [ ] Create `apps/web/src/admin/crm/propiedades/PropiedadesPage.tsx`
  - Fetches `GET /api/v1/admin/propiedades` (paginated)
  - Filters: tipo, tipoInmueble, ciudad, estado, agente (SUPER_ADMIN only)
  - Table/grid view with: foto thumb, titulo, precio, ciudad, agente, estado, actions
  - Action "Ver" → detail; "Editar" shown only if `canEdit` flag returned by API

- [ ] Create `apps/web/src/admin/crm/propiedades/PropiedadDetail.tsx`
  - Photo gallery (drag-and-drop reorder with @dnd-kit if canEdit)
  - Full property data
  - Activity timeline (leads, visitas, cambios de estado)
  - "Generar PDF" button → `GET /api/v1/admin/pdf/:propiedadId` → download
  - Edit form shown conditionally

- [ ] Commit: `feat(admin): CMS editor + properties module`
