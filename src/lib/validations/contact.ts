import { z } from 'zod'

// URLパターン（スパム検知用）
const URL_PATTERN = /https?:\/\/|www\./i

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'お名前は必須です')
    .max(100, 'お名前は100文字以内です')
    .regex(/^[^\x00-\x08\x0B\x0C\x0E-\x1F]+$/, 'お名前に使用できない文字が含まれています'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください')
    .max(200, 'メールアドレスは200文字以内です')
    .toLowerCase(),
  subject: z
    .string()
    .max(200, '件名は200文字以内です')
    .optional()
    .default(''),
  message: z
    .string()
    .min(10, 'メッセージは10文字以上入力してください')
    .max(2000, 'メッセージは2000文字以内です')
    .refine(
      (val) => !URL_PATTERN.test(val),
      'メッセージにURLは含められません'
    ),
  // ハニーポットフィールド（botフィルタリング）
  _hp: z.string().max(0, 'Bot detected').optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>
