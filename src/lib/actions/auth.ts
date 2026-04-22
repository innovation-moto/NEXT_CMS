'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'

// ─── SMTP トランスポーター ───
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ─── ログイン（Step 1: パスワード認証 → OTP送信） ───
export async function loginWithOtp(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' }
  }

  // Supabase でパスワード認証
  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  // 6桁のOTPコードを生成
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分後

  // 古いコードを削除してから新しいコードを保存
  await adminSupabase
    .from('otp_codes')
    .delete()
    .eq('email', email)

  const { error: dbError } = await adminSupabase
    .from('otp_codes')
    .insert({ email, code, expires_at: expiresAt })

  if (dbError) {
    console.error('OTP保存エラー:', dbError)
    return { error: '認証コードの生成に失敗しました。しばらくしてから再試行してください。' }
  }

  // OTPメール送信
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Innovation Music CMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【Innovation Music】ログイン認証コード',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0d0d14; color: #fff; border-radius: 12px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #fff;">ログイン認証コード</h2>
          <p style="color: #888; margin: 0 0 24px; font-size: 14px;">以下のコードを認証画面に入力してください。有効期限は <strong style="color:#fff">10分間</strong> です。</p>
          <div style="background: #1a1a2e; border: 1px solid #2a2a40; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #e53e3e;">${code}</span>
          </div>
          <p style="color: #555; font-size: 12px; margin: 0;">このコードに心当たりがない場合は無視してください。</p>
        </div>
      `,
    })
  } catch (emailErr) {
    console.error('OTPメール送信エラー:', emailErr)
    // メール送信失敗時はOTPを削除してエラーを返す
    await adminSupabase.from('otp_codes').delete().eq('email', email)
    return { error: '認証コードのメール送信に失敗しました。SMTP設定を確認してください。' }
  }

  // 2FA pending クッキーをセット
  const cookieStore = await cookies()
  cookieStore.set('admin_2fa_pending', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10分
    path: '/',
  })

  redirect('/admin/verify-2fa')
}

// ─── OTP検証（Step 2） ───
export async function verifyOtp(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const code = (formData.get('code') as string).trim()
  const cookieStore = await cookies()
  const email = cookieStore.get('admin_2fa_pending')?.value

  if (!email) {
    redirect('/admin/login')
  }

  if (!code || code.length !== 6) {
    return { error: '6桁のコードを入力してください' }
  }

  // DBからOTPを検索（未使用 & 有効期限内）
  const { data: otpRecord, error: dbError } = await adminSupabase
    .from('otp_codes')
    .select('id, code, expires_at, used')
    .eq('email', email)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (dbError || !otpRecord) {
    return { error: '認証コードが見つかりません。再度ログインしてください。' }
  }

  // 有効期限チェック
  if (new Date(otpRecord.expires_at) < new Date()) {
    await adminSupabase.from('otp_codes').delete().eq('id', otpRecord.id)
    return { error: '認証コードの有効期限が切れています。再度ログインしてください。' }
  }

  // コード照合
  if (otpRecord.code !== code) {
    return { error: 'コードが正しくありません' }
  }

  // 使用済みにする
  await adminSupabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', otpRecord.id)

  // 2FA pending クッキーを削除
  cookieStore.delete('admin_2fa_pending')

  redirect('/admin')
}

// ─── ログアウト ───
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete('admin_2fa_pending')
  redirect('/admin/login')
}
