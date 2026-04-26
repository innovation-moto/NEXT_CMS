'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { importNotionPage } from '@/lib/notion-import'
import type { ImportResult } from '@/lib/notion-import'

export interface NotionDatabase {
  id: string
  label: string
}

export interface NotionConfig {
  hasEnvApiKey: boolean
  maskedApiKey: string | null
  databases: NotionDatabase[]
}

async function assertAuth() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('認証が必要です')
}

async function getRow() {
  const { data } = await adminSupabase
    .from('notion_config')
    .select('*')
    .limit(1)
    .maybeSingle()
  return data
}

async function upsert(update: { api_key?: string | null; databases?: NotionDatabase[] }) {
  const existing = await getRow()
  if (existing) {
    await adminSupabase
      .from('notion_config')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await adminSupabase
      .from('notion_config')
      .insert({ api_key: null, databases: [], ...update })
  }
}

export async function getNotionConfig(): Promise<NotionConfig> {
  const hasEnvApiKey = !!process.env.NOTION_API_KEY
  const row = await getRow()
  const databases: NotionDatabase[] = (row?.databases as NotionDatabase[] | null) ?? []
  const dbApiKey = row?.api_key as string | null ?? null
  const effectiveKey = hasEnvApiKey ? process.env.NOTION_API_KEY! : dbApiKey
  const maskedApiKey = effectiveKey ? `secret_••••${effectiveKey.slice(-4)}` : null
  return { hasEnvApiKey, maskedApiKey, databases }
}

export async function saveNotionApiKey(apiKey: string): Promise<{ error?: string }> {
  await assertAuth()
  const trimmed = apiKey.trim()
  if (!trimmed) return { error: 'APIキーを入力してください' }
  await upsert({ api_key: trimmed })
  return {}
}

export async function clearNotionApiKey(): Promise<{ error?: string }> {
  await assertAuth()
  await upsert({ api_key: null })
  return {}
}

export async function testNotionConnection(): Promise<{ success: boolean; name?: string; error?: string }> {
  await assertAuth()
  const row = await getRow()
  const apiKey = process.env.NOTION_API_KEY || (row?.api_key as string | null) || null
  if (!apiKey) return { success: false, error: 'APIキーが設定されていません' }
  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${apiKey}`, 'Notion-Version': '2022-06-28' },
    })
    if (res.ok) {
      const data = await res.json()
      return { success: true, name: data.name || 'Notion Bot' }
    }
    const err = await res.json().catch(() => ({}))
    return { success: false, error: (err as { message?: string }).message || `HTTP ${res.status}` }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '接続エラー' }
  }
}

export async function addNotionDatabase(input: string, label: string): Promise<{ error?: string }> {
  await assertAuth()
  const databaseId = await extractNotionId(input)
  if (!databaseId) return { error: 'URLまたはデータベースIDを入力してください' }

  const row = await getRow()
  const apiKey = process.env.NOTION_API_KEY || (row?.api_key as string | null) || null
  if (!apiKey) return { error: 'APIキーが設定されていません' }

  // データベースへのアクセスを検証
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${apiKey}`, 'Notion-Version': '2022-06-28' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as { message?: string }).message || ''
    if (res.status === 404) return { error: 'データベースが見つかりません。インテグレーションをデータベースに共有してください。' }
    if (res.status === 401) return { error: 'このデータベースへのアクセス権限がありません。' }
    return { error: msg || `接続エラー (HTTP ${res.status})` }
  }

  const current: NotionDatabase[] = (row?.databases as NotionDatabase[] | null) ?? []
  if (current.some(d => d.id === databaseId)) {
    return { error: 'このデータベースはすでに登録されています' }
  }

  const dbInfo = await res.json()
  const autoLabel = label.trim() ||
    (dbInfo.title as Array<{ plain_text: string }>)?.[0]?.plain_text ||
    'データベース'

  await upsert({ databases: [...current, { id: databaseId, label: autoLabel }] })
  return {}
}

export async function removeNotionDatabase(databaseId: string): Promise<{ error?: string }> {
  await assertAuth()
  const row = await getRow()
  const current: NotionDatabase[] = (row?.databases as NotionDatabase[] | null) ?? []
  await upsert({ databases: current.filter(d => d.id !== databaseId) })
  return {}
}

export async function syncDatabase(databaseId: string): Promise<{ synced: number; failed: number; errors: string[] }> {
  await assertAuth()
  const row = await getRow()
  const apiKey = process.env.NOTION_API_KEY || (row?.api_key as string | null) || null
  if (!apiKey) return { synced: 0, failed: 0, errors: ['APIキーが設定されていません'] }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { synced: 0, failed: 0, errors: [(err as { message?: string }).message || `HTTP ${res.status}`] }
    }
    const data = await res.json()
    const pageIds: string[] = (data.results as Array<{ id: string }>).map(p => p.id)

    let synced = 0, failed = 0
    const errors: string[] = []
    for (const pageId of pageIds) {
      const result = await importNotionPage(pageId)
      if (result.success) synced++
      else { failed++; errors.push(result.error) }
    }
    return { synced, failed, errors }
  } catch (err) {
    return { synced: 0, failed: 0, errors: [err instanceof Error ? err.message : '同期エラー'] }
  }
}

export async function importPageFromInput(input: string): Promise<ImportResult> {
  await assertAuth()
  const pageId = await extractNotionId(input)
  return importNotionPage(pageId)
}

export async function extractNotionId(input: string): Promise<string> {
  const trimmed = input.trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return trimmed
  if (/^[0-9a-f]{32}$/i.test(trimmed)) {
    const id = trimmed.toLowerCase()
    return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`
  }
  const match = trimmed.match(/([0-9a-f]{32})(?:[?&#]|$)/i)
  if (match) {
    const id = match[1].toLowerCase()
    return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`
  }
  return trimmed
}
