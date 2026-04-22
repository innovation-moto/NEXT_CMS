import { Client, isFullBlock, isFullPage } from '@notionhq/client'
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { adminSupabase } from '@/lib/supabase/admin'

export function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) throw new Error('NOTION_API_KEY is not set')
  return new Client({ auth: apiKey })
}

// ─── Notion画像 → Supabase Storage へ転送 ────────────────────────────────────

async function transferImageToSupabase(notionUrl: string, originalFilename: string): Promise<string | null> {
  try {
    const res = await fetch(notionUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())

    const ext = originalFilename.split('.').pop()?.split('?')[0] ?? 'jpg'
    const filename = `notion/${crypto.randomUUID()}.${ext}`

    const { data, error } = await adminSupabase.storage
      .from('media')
      .upload(filename, buffer, { contentType, upsert: false })

    if (error) return null

    const { data: { publicUrl } } = adminSupabase.storage
      .from('media')
      .getPublicUrl(data.path)

    await adminSupabase.from('media').insert({
      filename: originalFilename,
      url: publicUrl,
      size: buffer.byteLength,
      mime_type: contentType,
      uploaded_by: null,
    })

    return publicUrl
  } catch {
    return null
  }
}

// ─── Rich text → plain text ───────────────────────────────────────────────────

function richTextToPlain(rich: RichTextItemResponse[]): string {
  return rich.map((t) => t.plain_text).join('')
}

// ─── Rich text → HTML ─────────────────────────────────────────────────────────

function richTextToHtml(rich: RichTextItemResponse[]): string {
  return rich
    .map((t) => {
      let text = t.plain_text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      if (t.annotations.bold) text = `<strong>${text}</strong>`
      if (t.annotations.italic) text = `<em>${text}</em>`
      if (t.annotations.strikethrough) text = `<s>${text}</s>`
      if (t.annotations.underline) text = `<u>${text}</u>`
      if (t.annotations.code) text = `<code>${text}</code>`
      if ('href' in t && t.href) text = `<a href="${t.href}">${text}</a>`

      return text
    })
    .join('')
}

// ─── Block → HTML（画像はURLをそのまま埋め込み、後でまとめて転送）──────────

type RawBlock = { type: string; notionImageUrl?: string; notionImageName?: string; html: string }

function blockToRaw(block: BlockObjectResponse): RawBlock {
  const b = block as BlockObjectResponse & Record<string, unknown>

  switch (block.type) {
    case 'paragraph': {
      const rt = (b.paragraph as { rich_text: RichTextItemResponse[] }).rich_text
      const inner = richTextToHtml(rt)
      return { type: 'paragraph', html: inner ? `<p>${inner}</p>` : '<p></p>' }
    }
    case 'heading_1': {
      const rt = (b.heading_1 as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'heading_1', html: `<h1>${richTextToHtml(rt)}</h1>` }
    }
    case 'heading_2': {
      const rt = (b.heading_2 as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'heading_2', html: `<h2>${richTextToHtml(rt)}</h2>` }
    }
    case 'heading_3': {
      const rt = (b.heading_3 as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'heading_3', html: `<h3>${richTextToHtml(rt)}</h3>` }
    }
    case 'bulleted_list_item': {
      const rt = (b.bulleted_list_item as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'bulleted_list_item', html: `<li>${richTextToHtml(rt)}</li>` }
    }
    case 'numbered_list_item': {
      const rt = (b.numbered_list_item as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'numbered_list_item', html: `<li>${richTextToHtml(rt)}</li>` }
    }
    case 'quote': {
      const rt = (b.quote as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'quote', html: `<blockquote>${richTextToHtml(rt)}</blockquote>` }
    }
    case 'code': {
      const rt = (b.code as { rich_text: RichTextItemResponse[]; language: string }).rich_text
      const lang = (b.code as { language: string }).language
      return {
        type: 'code',
        html: `<pre><code class="language-${lang}">${richTextToPlain(rt)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</code></pre>`,
      }
    }
    case 'divider':
      return { type: 'divider', html: '<hr>' }
    case 'image': {
      const img = b.image as {
        type: 'external' | 'file'
        external?: { url: string }
        file?: { url: string; expiry_time: string }
        caption?: RichTextItemResponse[]
      }
      const notionImageUrl = img.type === 'external' ? img.external?.url : img.file?.url
      const alt = img.caption ? richTextToPlain(img.caption) : ''
      // 本文内画像は後でSupabase URLに差し替えるためプレースホルダー
      return {
        type: 'image',
        notionImageUrl,
        notionImageName: notionImageUrl ? notionImageUrl.split('/').pop()?.split('?')[0] ?? 'image.jpg' : 'image.jpg',
        html: notionImageUrl ? `<img src="${notionImageUrl}" alt="${alt}">` : '',
      }
    }
    case 'callout': {
      const rt = (b.callout as { rich_text: RichTextItemResponse[] }).rich_text
      return { type: 'callout', html: `<aside>${richTextToHtml(rt)}</aside>` }
    }
    default:
      return { type: block.type, html: '' }
  }
}

// ─── リスト項目をまとめてラップ ──────────────────────────────────────────────

function wrapListItems(lines: string[]): string[] {
  const result: string[] = []
  let inList = false

  for (const line of lines) {
    if (line.startsWith('<li>')) {
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      result.push(line)
    } else {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      result.push(line)
    }
  }
  if (inList) result.push('</ul>')
  return result
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface NotionPageData {
  title: string
  slug: string
  excerpt: string | null
  type: 'blog' | 'news'
  status: 'draft' | 'published' | 'archived'
  thumbnail: string | null
  published_at: string | null
  body: string
}

export async function fetchNotionPage(pageId: string): Promise<NotionPageData> {
  const notion = getNotionClient()

  const page = await notion.pages.retrieve({ page_id: pageId })
  if (!isFullPage(page)) throw new Error('Not a full page object')

  const props = page.properties as PageObjectResponse['properties']

  function getProp<T>(key: string): T | undefined {
    return props[key] as T | undefined
  }

  // title
  const titleProp =
    getProp<{ title: RichTextItemResponse[] }>('タイトル') ??
    getProp<{ title: RichTextItemResponse[] }>('title') ??
    getProp<{ title: RichTextItemResponse[] }>('Title') ??
    getProp<{ title: RichTextItemResponse[] }>('Name')
  const title = titleProp ? richTextToPlain(titleProp.title) : '（タイトル未設定）'

  // slug
  const slugProp =
    getProp<{ rich_text: RichTextItemResponse[] }>('slug') ??
    getProp<{ rich_text: RichTextItemResponse[] }>('Slug')
  const slug = slugProp ? richTextToPlain(slugProp.rich_text) : ''

  // excerpt
  const excerptProp =
    getProp<{ rich_text: RichTextItemResponse[] }>('excerpt') ??
    getProp<{ rich_text: RichTextItemResponse[] }>('Excerpt') ??
    getProp<{ rich_text: RichTextItemResponse[] }>('抜粋')
  const excerpt = excerptProp ? richTextToPlain(excerptProp.rich_text) || null : null

  // type
  const typeProp =
    getProp<{ select: { name: string } | null }>('type') ??
    getProp<{ select: { name: string } | null }>('Type') ??
    getProp<{ select: { name: string } | null }>('種別')
  const typeRaw = typeProp?.select?.name?.toLowerCase() ?? 'blog'
  const type: 'blog' | 'news' = typeRaw === 'news' ? 'news' : 'blog'

  // status
  const statusProp =
    getProp<{ select: { name: string } | null }>('status') ??
    getProp<{ select: { name: string } | null }>('Status') ??
    getProp<{ select: { name: string } | null }>('ステータス')
  const statusRaw = statusProp?.select?.name?.toLowerCase() ?? 'draft'
  const status: 'draft' | 'published' | 'archived' =
    statusRaw === 'published' ? 'published' : statusRaw === 'archived' ? 'archived' : 'draft'

  // thumbnail — files型（アイキャッチ）または url型に対応
  type FilesProp = {
    files: Array<
      | { type: 'file'; name: string; file: { url: string } }
      | { type: 'external'; name: string; external: { url: string } }
    >
  }
  const thumbnailFilesProp =
    getProp<FilesProp>('アイキャッチ') ??
    getProp<FilesProp>('thumbnail') ??
    getProp<FilesProp>('Thumbnail')
  const thumbnailUrlProp =
    getProp<{ url: string | null }>('thumbnail') ??
    getProp<{ url: string | null }>('Thumbnail') ??
    getProp<{ url: string | null }>('サムネイル')

  let thumbnailNotionUrl: string | null = thumbnailUrlProp?.url ?? null
  let thumbnailFilename = 'thumbnail.jpg'
  if (!thumbnailNotionUrl && thumbnailFilesProp?.files?.length) {
    const first = thumbnailFilesProp.files[0]
    thumbnailNotionUrl = first.type === 'file' ? first.file.url : first.external.url
    thumbnailFilename = first.name || thumbnailFilename
  }

  // Notion S3リンク → Supabase Storage へ転送
  let thumbnail: string | null = null
  if (thumbnailNotionUrl) {
    thumbnail = await transferImageToSupabase(thumbnailNotionUrl, thumbnailFilename)
  }

  // published_at
  const publishedAtProp =
    getProp<{ date: { start: string } | null }>('published_at') ??
    getProp<{ date: { start: string } | null }>('PublishedAt') ??
    getProp<{ date: { start: string } | null }>('公開日') ??
    getProp<{ date: { start: string } | null }>('日付')
  const published_at = publishedAtProp?.date?.start
    ? new Date(publishedAtProp.date.start).toISOString()
    : null

  // 本文ブロック取得
  const blocksResp = await notion.blocks.children.list({ block_id: pageId, page_size: 100 })
  const rawBlocks: RawBlock[] = []
  for (const block of blocksResp.results) {
    if (!isFullBlock(block)) continue
    rawBlocks.push(blockToRaw(block as BlockObjectResponse))
  }

  // 本文内の画像も Supabase へ転送
  const htmlParts: string[] = []
  for (const raw of rawBlocks) {
    if (raw.type === 'image' && raw.notionImageUrl) {
      try {
        const supabaseUrl = await transferImageToSupabase(raw.notionImageUrl, raw.notionImageName ?? 'image.jpg')
        const alt = raw.html.match(/alt="([^"]*)"/) ?.[1] ?? ''
        htmlParts.push(`<img src="${supabaseUrl}" alt="${alt}">`)
      } catch {
        htmlParts.push(raw.html) // 転送失敗時は元URLをフォールバック
      }
    } else {
      htmlParts.push(raw.html)
    }
  }

  const body = wrapListItems(htmlParts).join('\n')

  return { title, slug, excerpt, type, status, thumbnail, published_at, body }
}
