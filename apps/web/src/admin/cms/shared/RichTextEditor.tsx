import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

interface Props { value: string; onChange: (html: string) => void; minHeight?: string }

export default function RichTextEditor({ value, onChange, minHeight = '120px' }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const btn = (active: boolean) =>
    `px-2.5 py-1 text-xs rounded transition-colors ${active ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'}`

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      <div className="bg-zinc-800 border-b border-zinc-700 flex gap-0.5 p-1.5 flex-wrap">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
          className={btn(editor?.isActive('bold') ?? false)}>
          <strong>N</strong>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={btn(editor?.isActive('italic') ?? false)}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={btn(editor?.isActive('strike') ?? false)}>
          <s>S</s>
        </button>
        <div className="w-px bg-zinc-700 mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(editor?.isActive('heading', { level: 2 }) ?? false)}>
          H2
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor?.isActive('heading', { level: 3 }) ?? false)}>
          H3
        </button>
        <div className="w-px bg-zinc-700 mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={btn(editor?.isActive('bulletList') ?? false)}>
          Lista
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={btn(editor?.isActive('orderedList') ?? false)}>
          1.2.3
        </button>
        <div className="w-px bg-zinc-700 mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className={btn(false)}>
          —
        </button>
        <button type="button" onClick={() => editor?.chain().focus().undo().run()}
          className={btn(false)}>
          ↩
        </button>
        <button type="button" onClick={() => editor?.chain().focus().redo().run()}
          className={btn(false)}>
          ↪
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm max-w-none p-3 text-white focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  )
}
