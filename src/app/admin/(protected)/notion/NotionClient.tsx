'use client'

import { useState } from 'react'
import {
  saveNotionApiKey,
  clearNotionApiKey,
  testNotionConnection,
  addNotionDatabase,
  removeNotionDatabase,
  syncDatabase,
  importPageFromInput,
  type NotionDatabase,
  type NotionConfig,
} from '@/lib/actions/notion-config'

interface Props {
  config: NotionConfig
}

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'

export default function NotionClient({ config: initialConfig }: Props) {
  const [config, setConfig] = useState(initialConfig)

  // ─── API Key ───
  const [showKeyForm, setShowKeyForm] = useState(!initialConfig.maskedApiKey)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [savingKey, setSavingKey] = useState(false)
  const [keyError, setKeyError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  // ─── Databases ───
  const [databases, setDatabases] = useState<NotionDatabase[]>(initialConfig.databases)
  const [dbInput, setDbInput] = useState('')
  const [dbLabel, setDbLabel] = useState('')
  const [addingDb, setAddingDb] = useState(false)
  const [dbError, setDbError] = useState('')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<Record<string, string>>({})
  const [removingId, setRemovingId] = useState<string | null>(null)

  // ─── Import ───
  const [importInput, setImportInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ ok: boolean; message: string } | null>(null)

  const isConnected = !!config.maskedApiKey

  async function handleSaveKey() {
    setSavingKey(true)
    setKeyError('')
    const result = await saveNotionApiKey(apiKeyInput)
    if (result.error) {
      setKeyError(result.error)
    } else {
      setConfig(prev => ({ ...prev, maskedApiKey: `secret_••••${apiKeyInput.slice(-4)}` }))
      setApiKeyInput('')
      setShowKeyForm(false)
      setTestResult(null)
    }
    setSavingKey(false)
  }

  async function handleClearKey() {
    if (!confirm('APIキーの設定を削除しますか？')) return
    await clearNotionApiKey()
    setConfig(prev => ({ ...prev, maskedApiKey: null }))
    setShowKeyForm(true)
    setTestResult(null)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    const result = await testNotionConnection()
    setTestResult(
      result.success
        ? { ok: true, message: `接続成功 — ${result.name}` }
        : { ok: false, message: result.error || '接続失敗' }
    )
    setTesting(false)
  }

  async function handleAddDb() {
    if (!dbInput.trim()) return
    setAddingDb(true)
    setDbError('')
    const result = await addNotionDatabase(dbInput.trim(), dbLabel.trim())
    if (result.error) {
      setDbError(result.error)
    } else {
      // Re-fetch config to get updated DB list with labels
      const { getNotionConfig } = await import('@/lib/actions/notion-config')
      const updated = await getNotionConfig()
      setDatabases(updated.databases)
      setDbInput('')
      setDbLabel('')
    }
    setAddingDb(false)
  }

  async function handleRemoveDb(id: string) {
    if (!confirm('このデータベースの連携を解除しますか？\n※ インポート済みの記事は削除されません。')) return
    setRemovingId(id)
    await removeNotionDatabase(id)
    setDatabases(prev => prev.filter(d => d.id !== id))
    setRemovingId(null)
  }

  async function handleSync(db: NotionDatabase) {
    setSyncingId(db.id)
    setSyncResult(prev => ({ ...prev, [db.id]: '' }))
    const result = await syncDatabase(db.id)
    setSyncResult(prev => ({
      ...prev,
      [db.id]: result.errors.length === 0
        ? `✓ ${result.synced}件同期`
        : `✓ ${result.synced}件 / ✗ ${result.failed}件失敗`,
    }))
    setSyncingId(null)
  }

  async function handleImport() {
    if (!importInput.trim()) return
    setImporting(true)
    setImportResult(null)
    const result = await importPageFromInput(importInput.trim())
    if (result.success) {
      setImportResult({ ok: true, message: `「${result.title}」を${result.action === 'created' ? 'インポート' : '更新'}しました` })
      setImportInput('')
    } else {
      setImportResult({ ok: false, message: result.error })
    }
    setImporting(false)
  }

  return (
    <div className="space-y-6">
      {/* ─── API接続設定 ─── */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">🔑 Notion API接続設定</h2>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-900/30 px-3 py-0.5 text-xs text-green-400">
              ✓ 接続設定済み
            </span>
          )}
        </div>

        {config.hasEnvApiKey ? (
          <div className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
            <span className="text-xs text-[#555]">APIキー（環境変数）</span>
            <code className="flex-1 font-mono text-xs text-accent">{config.maskedApiKey}</code>
            <span className="rounded-full bg-[#1a1a2e] px-2 py-0.5 text-xs text-[#888]">ENV</span>
          </div>
        ) : !showKeyForm ? (
          <div className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
            <span className="text-xs text-[#555]">APIキー</span>
            <code className="flex-1 font-mono text-xs text-accent">{config.maskedApiKey}</code>
            <button onClick={() => setShowKeyForm(true)}
              className="text-xs text-[#666] hover:text-white transition-colors">変更</button>
            {!config.hasEnvApiKey && (
              <button onClick={handleClearKey}
                className="text-xs text-[#666] hover:text-red-400 transition-colors">削除</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {!isConnected && (
              <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 space-y-1.5">
                <p className="text-xs font-medium text-accent">初回セットアップ</p>
                <ol className="space-y-1 text-xs text-[#888] list-decimal list-inside">
                  <li><a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">notion.so/my-integrations</a> でインテグレーションを作成</li>
                  <li>「Internal Integration」を選択して作成</li>
                  <li>表示された「Internal Integration Secret」をコピー</li>
                  <li>連携したいNotionデータベースを開き、右上「…」→「Connect to」でインテグレーションを追加</li>
                </ol>
              </div>
            )}
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={inputClass}
              autoFocus
            />
            {keyError && <p className="text-xs text-red-400">{keyError}</p>}
            <div className="flex gap-2">
              <button onClick={handleSaveKey} disabled={savingKey || !apiKeyInput.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50">
                {savingKey ? '保存中...' : '保存して接続'}
              </button>
              {isConnected && (
                <button onClick={() => { setShowKeyForm(false); setApiKeyInput('') }}
                  className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888] hover:text-white">
                  キャンセル
                </button>
              )}
            </div>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center gap-3">
            <button onClick={handleTest} disabled={testing}
              className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888] hover:border-accent/40 hover:text-white disabled:opacity-50 transition-colors">
              {testing ? 'テスト中...' : '接続テスト'}
            </button>
            {testResult && (
              <span className={`text-xs ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.ok ? '✓' : '✗'} {testResult.message}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── データベース管理 ─── */}
      {isConnected && (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5 space-y-4">
          <h2 className="text-sm font-medium text-white">📚 連携データベース</h2>

          {databases.length === 0 ? (
            <p className="text-sm text-[#555]">データベースが登録されていません。</p>
          ) : (
            <ul className="space-y-2">
              {databases.map((db) => (
                <li key={db.id} className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{db.label}</p>
                    <p className="font-mono text-xs text-[#555] truncate">{db.id}</p>
                  </div>
                  {syncResult[db.id] && (
                    <span className="text-xs text-[#888] whitespace-nowrap">{syncResult[db.id]}</span>
                  )}
                  <button
                    onClick={() => handleSync(db)}
                    disabled={syncingId === db.id}
                    className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888] hover:border-accent/40 hover:text-white disabled:opacity-50 whitespace-nowrap transition-colors"
                  >
                    {syncingId === db.id ? '同期中...' : '今すぐ同期'}
                  </button>
                  <button
                    onClick={() => handleRemoveDb(db.id)}
                    disabled={removingId === db.id}
                    className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888] hover:border-red-800/50 hover:text-red-400 disabled:opacity-50 transition-colors"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* データベース追加フォーム */}
          <div className="space-y-2 border-t border-[#2a2a2a] pt-4">
            <p className="text-xs font-medium text-[#888]">データベースを追加</p>
            <input
              type="text"
              value={dbInput}
              onChange={(e) => setDbInput(e.target.value)}
              placeholder="NotionデータベースのURLまたはID"
              className={inputClass}
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={dbLabel}
                onChange={(e) => setDbLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDb()}
                placeholder="ラベル（例：ブログ）— 省略可"
                className={`flex-1 ${inputClass}`}
              />
              <button
                onClick={handleAddDb}
                disabled={addingDb || !dbInput.trim()}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50 whitespace-nowrap"
              >
                {addingDb ? '追加中...' : '追加'}
              </button>
            </div>
            {dbError && <p className="text-xs text-red-400">{dbError}</p>}
            <p className="text-xs text-[#555]">
              ※ データベースにインテグレーションを共有済みであることを確認してください
            </p>
          </div>
        </div>
      )}

      {/* ─── 手動インポート ─── */}
      {isConnected && (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5 space-y-3">
          <h2 className="text-sm font-medium text-white">➕ ページを手動インポート</h2>
          <p className="text-xs text-[#555]">NotionページのURLまたはページIDを貼り付けてインポートします。</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              placeholder="https://www.notion.so/... または ページID"
              className={`flex-1 ${inputClass}`}
            />
            <button
              onClick={handleImport}
              disabled={importing || !importInput.trim()}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50 whitespace-nowrap"
            >
              {importing ? 'インポート中...' : 'インポート'}
            </button>
          </div>
          {importResult && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              importResult.ok
                ? 'border border-green-800/50 bg-green-900/20 text-green-400'
                : 'border border-red-800/50 bg-red-900/20 text-red-400'
            }`}>
              <span>{importResult.ok ? '✓' : '✗'}</span>
              <span>{importResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
