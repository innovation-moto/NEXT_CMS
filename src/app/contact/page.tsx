'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/common/PageHero'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'

type Step = 'form' | 'confirm' | 'thanks'

type FormData = {
  name: string
  email: string
  subject: string
  message: string
  _hp: string
}

type FieldErrors = Partial<Record<keyof FormData, string>>

const URL_PATTERN = /https?:\/\/|www\./i

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!data.name.trim()) errors.name = 'お名前を入力してください'
  else if (data.name.length > 100) errors.name = 'お名前は100文字以内です'

  if (!data.email.trim()) errors.email = 'メールアドレスを入力してください'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = '有効なメールアドレスを入力してください'

  if (data.subject && data.subject.length > 200)
    errors.subject = '件名は200文字以内です'

  if (!data.message.trim()) errors.message = 'メッセージを入力してください'
  else if (data.message.trim().length < 10) errors.message = 'メッセージは10文字以上入力してください'
  else if (data.message.length > 2000) errors.message = 'メッセージは2000文字以内です'
  else if (URL_PATTERN.test(data.message)) errors.message = 'メッセージにURLは含められません'

  return errors
}

export default function ContactPage() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    _hp: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const inputClass =
    'w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-white placeholder-[#555] transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'
  const errorInputClass =
    'w-full rounded-lg border border-red-500 bg-bg px-4 py-3 text-sm text-white placeholder-[#555] transition-colors focus:outline-none focus:ring-1 focus:ring-red-500/30'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setStep('confirm')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setStep('thanks')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const json = await res.json()
        setSubmitError(
          json.error?.formErrors?.[0] ?? '送信に失敗しました。しばらく後にお試しください。'
        )
        setStep('form')
      }
    } catch {
      setSubmitError('ネットワークエラーが発生しました。')
      setStep('form')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Header />
      <main>
        <PageHero
          title="Contact"
          subtitle="プロジェクトのご相談、コラボレーション、その他お気軽にどうぞ。"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        />

        <section className="section bg-bg">
          <div className="container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

              {/* 左: 連絡先情報 */}
              <ScrollAnimWrapper animation="slideLeft" className="space-y-6">
                <div>
                  <p className="section-label mb-2">Get In Touch</p>
                  <h2 className="font-display text-2xl font-bold text-white">お気軽にご連絡を</h2>
                </div>
                {[
                  { icon: '📧', label: 'Email', value: 'motoki.s@innovation-music.com' },
                  { icon: '📍', label: 'Address', value: '東京都' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#888888]">{item.label}</p>
                      <p className="text-sm text-white">{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* ステップインジケーター */}
                {step !== 'thanks' && (
                  <div className="pt-6">
                    <p className="mb-3 text-xs font-medium text-[#888888]">送信ステップ</p>
                    <div className="flex items-center gap-2">
                      {(['form', 'confirm'] as const).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            step === s
                              ? 'bg-accent text-white'
                              : step === 'confirm' && s === 'form'
                              ? 'bg-green-600 text-white'
                              : 'bg-[#2a2a2a] text-[#888]'
                          }`}>
                            {step === 'confirm' && s === 'form' ? '✓' : i + 1}
                          </div>
                          <span className={`text-xs ${step === s ? 'text-white' : 'text-[#555]'}`}>
                            {s === 'form' ? '入力' : '確認'}
                          </span>
                          {i === 0 && <div className="h-px w-4 bg-[#2a2a2a]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollAnimWrapper>

              {/* 右: フォームエリア */}
              <ScrollAnimWrapper animation="fadeUp" className="lg:col-span-2">

                {/* ─── STEP 1: 入力フォーム ─── */}
                {step === 'form' && (
                  <form
                    onSubmit={handleConfirm}
                    className="rounded-xl border border-border bg-bg-card p-8"
                    noValidate
                  >
                    {/* ハニーポット (隠しフィールド) */}
                    <input
                      type="text"
                      name="_hp"
                      value={formData._hp}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                      aria-hidden="true"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {submitError && (
                      <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                        {submitError}
                      </div>
                    )}

                    <h3 className="mb-6 font-display text-lg font-bold text-white">お問い合わせフォーム</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[#888888]">
                          お名前 <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="山田 太郎"
                          autoComplete="name"
                          className={fieldErrors.name ? errorInputClass : inputClass}
                        />
                        {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#888888]">
                          メールアドレス <span className="text-accent">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                          autoComplete="email"
                          className={fieldErrors.email ? errorInputClass : inputClass}
                        />
                        {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-[#888888]">
                        件名
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="お問い合わせ件名"
                        className={fieldErrors.subject ? errorInputClass : inputClass}
                      />
                      {fieldErrors.subject && <p className="mt-1 text-xs text-red-400">{fieldErrors.subject}</p>}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-[#888888]">
                        メッセージ <span className="text-accent">*</span>
                        <span className="ml-2 font-normal text-[#555]">({formData.message.length}/2000)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder="ご相談内容をご記入ください..."
                        className={`${fieldErrors.message ? errorInputClass : inputClass} resize-none`}
                      />
                      {fieldErrors.message && <p className="mt-1 text-xs text-red-400">{fieldErrors.message}</p>}
                    </div>

                    <p className="mt-4 text-xs text-[#555]">
                      <span className="text-accent">*</span> は必須項目です
                    </p>

                    <button
                      type="submit"
                      className="mt-6 w-full rounded-full bg-accent py-3.5 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_24px_rgba(229,62,62,0.4)]"
                    >
                      確認画面へ →
                    </button>
                  </form>
                )}

                {/* ─── STEP 2: 確認画面 ─── */}
                {step === 'confirm' && (
                  <div className="rounded-xl border border-border bg-bg-card p-8">
                    <h3 className="mb-2 font-display text-lg font-bold text-white">入力内容の確認</h3>
                    <p className="mb-6 text-sm text-[#888888]">以下の内容で送信します。よろしければ「送信する」を押してください。</p>

                    <dl className="space-y-4">
                      {[
                        { label: 'お名前', value: formData.name },
                        { label: 'メールアドレス', value: formData.email },
                        ...(formData.subject ? [{ label: '件名', value: formData.subject }] : []),
                        { label: 'メッセージ', value: formData.message },
                      ].map((item) => (
                        <div key={item.label} className="border-b border-border pb-4">
                          <dt className="mb-1 text-xs font-medium text-[#888888]">{item.label}</dt>
                          <dd className="text-sm text-white whitespace-pre-wrap">{item.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-8 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="flex-1 rounded-full border border-border py-3.5 text-sm text-[#888888] transition-all hover:border-accent/50 hover:text-white"
                      >
                        ← 戻って修正する
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 rounded-full bg-accent py-3.5 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_24px_rgba(229,62,62,0.4)] disabled:opacity-50"
                      >
                        {submitting ? '送信中...' : '送信する →'}
                      </button>
                    </div>
                    <p className="mt-4 text-center text-xs text-[#555]">
                      送信後、ご入力のメールアドレスに自動返信メールをお送りします。
                    </p>
                  </div>
                )}

                {/* ─── STEP 3: サンクス画面 ─── */}
                {step === 'thanks' && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg-card p-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-900/30 text-4xl">
                      ✅
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-bold text-white">
                      送信が完了しました
                    </h3>
                    <p className="mb-2 text-[#888888]">
                      お問い合わせありがとうございます。
                    </p>
                    <p className="mb-8 text-sm text-[#888888]">
                      ご入力のメールアドレスに自動返信メールをお送りしました。<br />
                      担当者より改めてご連絡いたします。
                    </p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-all hover:bg-accent/80"
                    >
                      トップページへ戻る
                    </a>
                  </div>
                )}

              </ScrollAnimWrapper>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
