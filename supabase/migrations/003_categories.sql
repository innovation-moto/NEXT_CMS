-- ============================================================
-- Migration 003: categories テーブル + posts.category_id
-- ============================================================

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('news', 'blog')),
  sort_order int         NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- posts に category_id カラムを追加
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category_id uuid
    REFERENCES public.categories(id)
    ON DELETE SET NULL;

-- インデックス
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts(category_id);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 誰でも読める（公開サイト用）
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- 認証済みユーザーのみ作成・更新・削除
CREATE POLICY "Auth users can manage categories"
  ON public.categories FOR ALL
  USING (auth.uid() IS NOT NULL);

-- シードデータ（ニュース用カテゴリ）
INSERT INTO public.categories (name, type, sort_order) VALUES
  ('お知らせ',         'news', 1),
  ('プレスリリース',   'news', 2),
  ('イベント',         'news', 3)
ON CONFLICT DO NOTHING;

-- シードデータ（ブログ用カテゴリ）
INSERT INTO public.categories (name, type, sort_order) VALUES
  ('音楽制作',   'blog', 1),
  ('テクノロジー', 'blog', 2),
  ('日記',       'blog', 3)
ON CONFLICT DO NOTHING;
