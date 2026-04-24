import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  slug: z
    .string()
    .min(1, 'スラッグは必須です')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'スラッグは英数字とハイフンのみ使用可能です'),
  body: z.string().optional(),
  excerpt: z.string().max(500, '抜粋は500文字以内です').optional(),
  type: z.string().min(1, '種別は必須です'),
  status: z.enum(['draft', 'published', 'archived'], { errorMap: () => ({ message: 'ステータスが正しくありません' }) }),
  thumbnail: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  published_at: z.string().datetime().optional().nullable(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = Partial<CreatePostInput>
