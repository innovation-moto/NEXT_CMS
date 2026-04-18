/**
 * SMTP接続テストスクリプト
 * 使い方: node test-smtp.mjs
 *
 * パスワードを直接入力して接続テストができます
 */
import nodemailer from 'nodemailer'

// ===== ここに実際のSMTP設定を入力 =====
const config = {
  host: 'sv10795.xserver.jp',
  port: 587,
  secure: false,
  user: 'motoki.s@innovation-music.com',
  pass: '!ukmh$zh6k-k',  // ← パスワードを直接入力（変数展開なし）
}
// =====================================

console.log('🔍 SMTP接続テスト開始...')
console.log(`Host: ${config.host}`)
console.log(`Port: ${config.port}`)
console.log(`Secure: ${config.secure}`)
console.log(`User: ${config.user}`)
console.log(`Pass length: ${config.pass.length}`)
console.log(`Pass (first3): ${config.pass.slice(0, 3)}`)
console.log(`Pass (last3): ${config.pass.slice(-3)}`)
console.log('')

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.pass,
  },
})

try {
  await transporter.verify()
  console.log('✅ SMTP接続成功！メール送信テストを開始します...')

  const result = await transporter.sendMail({
    from: `Innovation Music <${config.user}>`,
    to: config.user,
    subject: 'SMTPテストメール',
    text: 'このメールはSMTP接続テストです。受信できていれば設定は正常です。',
  })

  console.log('✅ テストメール送信成功:', result.messageId)
  console.log('受信トレイを確認してください。')
} catch (err) {
  console.error('❌ エラー:', err.message)
  console.error('')
  console.error('考えられる原因:')
  console.error('1. パスワードが間違っている')
  console.error('2. SMTPホスト名が間違っている（Xserverパネルで確認）')
  console.error('3. 送信メール認証が有効になっていない（Xserverパネルで確認）')
  console.error('4. IPアドレスがブロックされている')
}

transporter.close()
