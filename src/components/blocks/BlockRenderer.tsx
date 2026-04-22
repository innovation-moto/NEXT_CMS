import Image from 'next/image'
import type { Block } from '@/types/blocks'

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  )
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.data.level}` as 'h2' | 'h3' | 'h4'
      const cls = block.data.level === 2
        ? 'text-3xl font-bold text-white'
        : block.data.level === 3
        ? 'text-2xl font-bold text-white'
        : 'text-xl font-semibold text-white'
      return <Tag className={cls}>{block.data.text}</Tag>
    }

    case 'paragraph':
      return (
        <p className="text-base leading-relaxed text-[#cccccc] whitespace-pre-wrap">
          {block.data.text}
        </p>
      )

    case 'image':
      return block.data.url ? (
        <figure className="overflow-hidden rounded-xl">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={block.data.url}
              alt={block.data.alt || ''}
              fill
              className="object-cover"
            />
          </div>
          {block.data.caption && (
            <figcaption className="mt-2 text-center text-xs text-[#888]">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      ) : null

    case 'gallery':
      return block.data.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.data.images.filter((img) => img.url).map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null

    case 'list':
      return block.data.ordered ? (
        <ol className="list-decimal space-y-1 pl-6 text-[#cccccc]">
          {block.data.items.filter(Boolean).map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 pl-6 text-[#cccccc]">
          {block.data.items.filter(Boolean).map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-accent pl-6 py-2">
          <p className="text-lg italic text-white">{block.data.text}</p>
          {block.data.cite && (
            <cite className="mt-2 block text-sm text-[#888] not-italic">— {block.data.cite}</cite>
          )}
        </blockquote>
      )

    default:
      return null
  }
}
