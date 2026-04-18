import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { contactSchema } from '@/lib/validations/contact'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'motoki.s@innovation-music.com'
const SITE_NAME = 'Innovation Music'

// ─── デバッグ: 環境変数の読み込み確認 ───
console.log('📧 SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  passLength: process.env.SMTP_PASS?.length,
  passFirst3: process.env.SMTP_PASS?.slice(0, 3),
  passLast3: process.env.SMTP_PASS?.slice(-3),
})

// ─── SMTPトランスポーター（モジュールレベルで使い回して接続コストを削減） ───
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true', // 465番ポートならtrue、587ならfalse
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,        // 接続プールを使い回す
  maxConnections: 3, // 同時接続数
})

// ─── レート制限（メモリベース / 本番は Upstash Redis を推奨） ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 3) return false
  entry.count++
  return true
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── 管理者宛メール ───
function buildAdminMail(data: { name: string; email: string; subject: string; message: string }) {
  const subject = data.subject
    ? `【お問い合わせ】${data.subject}`
    : `【お問い合わせ】${data.name} 様より`

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
      <h2 style="color:#e53e3e;border-bottom:2px solid #e53e3e;padding-bottom:8px;">
        ${SITE_NAME} お問い合わせ
      </h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:130px;font-size:14px;">お名前</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">メールアドレス</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">
            <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
          </td>
        </tr>
        ${data.subject ? `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">件名</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(data.subject)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;vertical-align:top;">メッセージ</td>
          <td style="padding:10px 0;font-size:14px;white-space:pre-wrap;">${escapeHtml(data.message)}</td>
        </tr>
      </table>
      <p style="font-size:12px;color:#999;margin-top:24px;">
        送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      </p>
    </div>
  `
  return { subject, html }
}

// ─── 自動返信メール ───
function buildAutoReplyMail(data: { name: string; email: string; subject: string; message: string }) {
  const subject = `【${SITE_NAME}】お問い合わせを受け付けました`
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
      <h2 style="color:#e53e3e;border-bottom:2px solid #e53e3e;padding-bottom:8px;">
        お問い合わせありがとうございます
      </h2>
      <p style="font-size:14px;line-height:1.8;color:#333;">
        ${escapeHtml(data.name)} 様<br><br>
        この度は ${SITE_NAME} へお問い合わせいただき、ありがとうございます。<br>
        以下の内容で受け付けいたしました。担当者より改めてご連絡いたします。
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #e53e3e;padding:16px;margin:16px 0;border-radius:4px;">
        ${data.subject ? `<p style="font-size:13px;color:#555;margin:0 0 8px;"><strong>件名:</strong> ${escapeHtml(data.subject)}</p>` : ''}
        <p style="font-size:13px;color:#555;margin:0;white-space:pre-wrap;"><strong>メッセージ:</strong><br>${escapeHtml(data.message)}</p>
      </div>
      <p style="font-size:13px;color:#888;line-height:1.8;">
        ※ このメールは自動送信です。このメールへの返信はお答えできません。<br>
        お急ぎの場合は <a href="mailto:${ADMIN_EMAIL}" style="color:#e53e3e;">${ADMIN_EMAIL}</a> までご連絡ください。
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#aaa;text-align:center;">${SITE_NAME}</p>
    </div>
  `
  return { subject, html }
}

// ─── POST ハンドラー ───
export async function POST(request: NextRequest) {
  // レート制限
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: { formErrors: ['送信制限を超えました。1分後に再度お試しください。'], fieldErrors: {} } },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // JSONパース
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: { formErrors: ['不正なリクエストです'], fieldErrors: {} } },
      { status: 400 }
    )
  }

  // Zodバリデーション
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { _hp, ...data } = parsed.data

  // ハニーポットチェック（ボット検知 → サイレント200）
  if (_hp && _hp.length > 0) {
    return NextResponse.json({ success: true })
  }

  // Supabase に保存
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('contact_messages').insert({
    name: data.name,
    email: data.email,
    subject: data.subject || null,
    message: data.message,
  })

  if (dbError) {
    console.error('Contact DB insert error:', dbError)
    return NextResponse.json(
      { error: { formErrors: ['送信に失敗しました。しばらく後にお試しください。'], fieldErrors: {} } },
      { status: 500 }
    )
  }

  // DB保存完了時点でレスポンスを返し、メール送信は非同期で継続
  const response = NextResponse.json({ success: true })

  // メール送信（レスポンス後にバックグラウンドで実行）
  const fromAddress = `${SITE_NAME} <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`
  const adminMail = buildAdminMail(data)
  const autoReply = buildAutoReplyMail(data)

  Promise.all([
    transporter.sendMail({
      from: fromAddress,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: adminMail.subject,
      html: adminMail.html,
    }),
    transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: autoReply.subject,
      html: autoReply.html,
    }),
  ])
    .then(([adminResult, autoReplyResult]) => {
      console.log('✅ 管理者メール送信:', adminResult.messageId)
      console.log('✅ 自動返信メール送信:', autoReplyResult.messageId)
    })
    .catch((emailError) => {
      console.error('❌ メール送信エラー:', emailError instanceof Error ? emailError.message : emailError)
    })

  return response
}
