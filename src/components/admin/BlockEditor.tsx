'use client'

import { useState, useRef } from 'react'
import type { Block, BlockType } from '@/types/blocks'

// ─── ブロック追加メニュー ───
const BLOCK_MENU: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'heading',   label: '見出し',   icon: 'H',  desc: 'セクションのタイトル' },
  { type: 'paragraph', label: '段落',     icon: '¶',  desc: 'テキストブロック' },
  { type: 'image',     label: '画像',     icon: '🖼', desc: '画像を1枚挿入' },
  { type: 'gallery',   label: 'ギャラリー', icon: '⊞', desc: '複数画像をグリッド表示' },
  { type: 'list',      label: 'リスト',   icon: '☰',  desc: '箇条書き・番号付きリスト' },
  { type: 'quote',     label: '引用',     icon: '❝',  desc: '引用ブロック' },
]

function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID()
  switch (type) {
    case 'heading':   return { id, type, data: { level: 2, text: '' } }
    case 'paragraph': return { id, type, data: { text: '' } }
    case 'image':     return { id, type, data: { url: '', alt: '', caption: '' } }
    case 'gallery':   return { id, type, data: { images: [] } }
    case 'list':      return { id, type, data: { items: [''], ordered: false } }
    case 'quote':     return { id, type, data: { text: '', cite: '' } }
  }
}

// ─── ブロック追加ボタン ───
function AddBlockButton({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative flex justify-center my-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1a1a2e] text-accent transition-all hover:border-accent hover:bg-accent/10"
        title="ブロックを追加"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-10 z-20 w-72 rounded-xl border border-[#2a2a2a] bg-[#111118] p-3 shadow-2xl">
            <p className="mb-2 px-1 text-xs font-medium text-[#555]">ブロックを選択</p>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_MENU.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => { onAdd(item.type); setOpen(false) }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3 transition-all hover:border-accent/40 hover:bg-accent/5"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── 各ブロックの編集UI ───
function HeadingBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'heading' }>; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={block.data.level}
          onChange={(e) => onChange({ ...block, data: { ...block.data, level: Number(e.target.value) as 2|3|4 } })}
          className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-xs text-white"
        >
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
      </div>
      <input
        type="text"
        value={block.data.text}
        onChange={(e) => onChange({ ...block, data: { ...block.data, text: e.target.value } })}
        placeholder="見出しテキストを入力..."
        className={`w-full bg-transparent outline-none text-white placeholder-[#444] ${
          block.data.level === 2 ? 'text-2xl font-bold' : block.data.level === 3 ? 'text-xl font-bold' : 'text-lg font-semibold'
        }`}
      />
    </div>
  )
}

function ParagraphBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'paragraph' }>; onChange: (b: Block) => void }) {
  return (
    <textarea
      value={block.data.text}
      onChange={(e) => onChange({ ...block, data: { text: e.target.value } })}
      placeholder="テキストを入力..."
      rows={4}
      className="w-full resize-none bg-transparent text-sm leading-relaxed text-white placeholder-[#444] outline-none"
    />
  )
}

function ImageBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'image' }>; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <input
        type="url"
        value={block.data.url}
        onChange={(e) => onChange({ ...block, data: { ...block.data, url: e.target.value } })}
        placeholder="画像URL (https://...)"
        className="w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-[#444] focus:border-accent focus:outline-none"
      />
      {block.data.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.data.url} alt={block.data.alt} className="max-h-48 rounded object-cover" />
      )}
      <input
        type="text"
        value={block.data.alt}
        onChange={(e) => onChange({ ...block, data: { ...block.data, alt: e.target.value } })}
        placeholder="alt テキスト"
        className="w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-[#444] focus:border-accent focus:outline-none"
      />
      <input
        type="text"
        value={block.data.caption ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...block.data, caption: e.target.value } })}
        placeholder="キャプション (任意)"
        className="w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-[#444] focus:border-accent focus:outline-none"
      />
    </div>
  )
}

function GalleryBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'gallery' }>; onChange: (b: Block) => void }) {
  function addImage() {
    onChange({ ...block, data: { images: [...block.data.images, { url: '', alt: '' }] } })
  }
  function updateImage(i: number, field: 'url' | 'alt', value: string) {
    const imgs = block.data.images.map((img, idx) => idx === i ? { ...img, [field]: value } : img)
    onChange({ ...block, data: { images: imgs } })
  }
  function removeImage(i: number) {
    onChange({ ...block, data: { images: block.data.images.filter((_, idx) => idx !== i) } })
  }
  return (
    <div className="space-y-2">
      {block.data.images.map((img, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="url"
            value={img.url}
            onChange={(e) => updateImage(i, 'url', e.target.value)}
            placeholder="画像URL"
            className="flex-1 rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-[#444] focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            value={img.alt}
            onChange={(e) => updateImage(i, 'alt', e.target.value)}
            placeholder="alt"
            className="w-24 rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-[#444] focus:border-accent focus:outline-none"
          />
          <button type="button" onClick={() => removeImage(i)} className="text-[#555] hover:text-red-400">✕</button>
        </div>
      ))}
      {block.data.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {block.data.images.filter(img => img.url).map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img.url} alt={img.alt} className="aspect-square rounded object-cover" />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addImage}
        className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
      >
        + 画像を追加
      </button>
    </div>
  )
}

function ListBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'list' }>; onChange: (b: Block) => void }) {
  function updateItem(i: number, value: string) {
    const items = block.data.items.map((it, idx) => idx === i ? value : it)
    onChange({ ...block, data: { ...block.data, items } })
  }
  function addItem() {
    onChange({ ...block, data: { ...block.data, items: [...block.data.items, ''] } })
  }
  function removeItem(i: number) {
    const items = block.data.items.filter((_, idx) => idx !== i)
    onChange({ ...block, data: { ...block.data, items: items.length ? items : [''] } })
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-3 mb-2">
        {(['unordered', 'ordered'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...block, data: { ...block.data, ordered: t === 'ordered' } })}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              (t === 'ordered') === block.data.ordered
                ? 'border-accent text-accent'
                : 'border-[#2a2a2a] text-[#888]'
            }`}
          >
            {t === 'ordered' ? '番号付き' : '箇条書き'}
          </button>
        ))}
      </div>
      {block.data.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-[#555] w-5 text-right">
            {block.data.ordered ? `${i + 1}.` : '•'}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
            placeholder={`項目 ${i + 1}`}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#444] outline-none"
          />
          <button type="button" onClick={() => removeItem(i)} className="text-[#2a2a2a] hover:text-red-400 text-xs">✕</button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-accent hover:text-accent/80">+ 項目を追加</button>
    </div>
  )
}

function QuoteBlockEditor({ block, onChange }: { block: Extract<Block, { type: 'quote' }>; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2 border-l-2 border-accent pl-4">
      <textarea
        value={block.data.text}
        onChange={(e) => onChange({ ...block, data: { ...block.data, text: e.target.value } })}
        placeholder="引用テキストを入力..."
        rows={3}
        className="w-full resize-none bg-transparent text-sm italic text-white placeholder-[#444] outline-none"
      />
      <input
        type="text"
        value={block.data.cite ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...block.data, cite: e.target.value } })}
        placeholder="出典 (任意)"
        className="w-full bg-transparent text-xs text-[#888] placeholder-[#444] outline-none"
      />
    </div>
  )
}

// ─── ブロックラッパー ───
function BlockItem({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  block: Block
  index: number
  total: number
  onChange: (b: Block) => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const label = BLOCK_MENU.find((m) => m.type === block.type)?.label ?? block.type

  return (
    <div className="group relative rounded-xl border border-[#2a2a2a] bg-[#111118] p-4 transition-all hover:border-[#3a3a4a]">
      {/* ブロックタイプラベル */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#555]">{label}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onMove('up')} disabled={index === 0}
            className="p-1 text-[#555] hover:text-white disabled:opacity-20" title="上へ">
            ↑
          </button>
          <button type="button" onClick={() => onMove('down')} disabled={index === total - 1}
            className="p-1 text-[#555] hover:text-white disabled:opacity-20" title="下へ">
            ↓
          </button>
          <button type="button" onClick={onDelete}
            className="p-1 text-[#555] hover:text-red-400" title="削除">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ブロック編集UI */}
      {block.type === 'heading'   && <HeadingBlockEditor   block={block} onChange={onChange} />}
      {block.type === 'paragraph' && <ParagraphBlockEditor block={block} onChange={onChange} />}
      {block.type === 'image'     && <ImageBlockEditor     block={block} onChange={onChange} />}
      {block.type === 'gallery'   && <GalleryBlockEditor   block={block} onChange={onChange} />}
      {block.type === 'list'      && <ListBlockEditor      block={block} onChange={onChange} />}
      {block.type === 'quote'     && <QuoteBlockEditor     block={block} onChange={onChange} />}
    </div>
  )
}

// ─── メインエディタ ───
interface Props {
  initialBlocks?: Block[]
  onChange?: (blocks: Block[]) => void
}

export default function BlockEditor({ initialBlocks = [], onChange }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

  function update(newBlocks: Block[]) {
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }

  function addBlock(type: BlockType, afterIndex?: number) {
    const nb = createBlock(type)
    const newBlocks = [...blocks]
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, nb)
    } else {
      newBlocks.push(nb)
    }
    update(newBlocks)
  }

  function changeBlock(index: number, block: Block) {
    const newBlocks = blocks.map((b, i) => i === index ? block : b)
    update(newBlocks)
  }

  function deleteBlock(index: number) {
    update(blocks.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, dir: 'up' | 'down') {
    const newBlocks = [...blocks]
    const target = dir === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]]
    update(newBlocks)
  }

  return (
    <div className="space-y-1">
      {blocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
          <p className="mb-3 text-sm text-[#555]">ブロックがありません</p>
          <p className="text-xs text-[#333]">下の「＋」ボタンからブロックを追加してください</p>
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={block.id}>
          <BlockItem
            block={block}
            index={i}
            total={blocks.length}
            onChange={(b) => changeBlock(i, b)}
            onDelete={() => deleteBlock(i)}
            onMove={(dir) => moveBlock(i, dir)}
          />
          <AddBlockButton onAdd={(type) => addBlock(type, i)} />
        </div>
      ))}

      {blocks.length === 0 && (
        <AddBlockButton onAdd={(type) => addBlock(type)} />
      )}

      {blocks.length > 0 && (
        <div className="pt-2">
          <AddBlockButton onAdd={(type) => addBlock(type)} />
        </div>
      )}
    </div>
  )
}
