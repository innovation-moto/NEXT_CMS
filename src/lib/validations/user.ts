import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください').max(200),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上です')
    .max(100, 'パスワードは100文字以内です'),
  full_name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内です'),
  role: z.enum(['admin', 'editor']),
})

export type UserInput = z.infer<typeof userSchema>
