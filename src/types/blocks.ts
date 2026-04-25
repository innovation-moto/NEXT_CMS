// ─── ブロックタイプ定義 ───

export type BlockType = 'heading' | 'paragraph' | 'image' | 'list' | 'quote' | 'gallery' | 'html'

export interface HeadingBlock {
  id: string
  type: 'heading'
  data: { level: 2 | 3 | 4; text: string }
}
export interface ParagraphBlock {
  id: string
  type: 'paragraph'
  data: { text: string }
}
export interface ImageBlock {
  id: string
  type: 'image'
  data: { url: string; alt: string; caption?: string }
}
export interface ListBlock {
  id: string
  type: 'list'
  data: { items: string[]; ordered: boolean }
}
export interface QuoteBlock {
  id: string
  type: 'quote'
  data: { text: string; cite?: string }
}
export interface GalleryBlock {
  id: string
  type: 'gallery'
  data: { images: { url: string; alt: string }[] }
}
export interface HtmlBlock {
  id: string
  type: 'html'
  data: { code: string }
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | GalleryBlock
  | HtmlBlock
