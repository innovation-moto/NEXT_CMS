'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface Props {
  content?: string
  onChange?: (html: string) => void
}

const TOOLBAR_BUTTONS = [
  { command: 'bold', label: 'B', title: '太字' },
  { command: 'italic', label: 'I', title: '斜体' },
  { command: 'h2', label: 'H2', title: '見出し2' },
  { command: 'h3', label: 'H3', title: '見出し3' },
  { command: 'bulletList', label: '•', title: '箇条書き' },
  { command: 'orderedList', label: '1.', title: '番号付きリスト' },
  { command: 'blockquote', label: '❝', title: '引用' },
  { command: 'hr', label: '―', title: '区切り線' },
  { command: 'undo', label: '↩', title: '元に戻す' },
  { command: 'redo', label: '↪', title: 'やり直す' },
]

export default function RichTextEditor({ content = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose min-h-[300px] max-w-none p-4 focus:outline-none text-[#e8e8e8]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) return null

  function execCommand(command: string) {
    if (!editor) return
    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'hr':
        editor.chain().focus().setHorizontalRule().run()
        break
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
    }
  }

  function isActive(command: string): boolean {
    if (!editor) return false
    switch (command) {
      case 'bold': return editor.isActive('bold')
      case 'italic': return editor.isActive('italic')
      case 'h2': return editor.isActive('heading', { level: 2 })
      case 'h3': return editor.isActive('heading', { level: 3 })
      case 'bulletList': return editor.isActive('bulletList')
      case 'orderedList': return editor.isActive('orderedList')
      case 'blockquote': return editor.isActive('blockquote')
      default: return false
    }
  }

  function handleInsertImage() {
    const url = prompt('画像URLを入力してください:')
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run()
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-[#2a2a2a] bg-[#111118] px-3 py-2">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => execCommand(btn.command)}
            title={btn.title}
            className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium transition-colors ${
              isActive(btn.command)
                ? 'bg-accent text-white'
                : 'text-[#888888] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
        {/* Image insert */}
        <button
          type="button"
          onClick={handleInsertImage}
          title="画像を挿入"
          className="flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium text-[#888888] transition-colors hover:bg-[#2a2a2a] hover:text-white"
        >
          🖼
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
