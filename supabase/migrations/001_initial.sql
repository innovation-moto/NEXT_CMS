-- ============================================
-- Innovation Music CMS — Initial Migration
-- ============================================

-- ========================================
-- 1. 投稿テーブル (posts)
-- ========================================
CREATE TABLE public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  body        TEXT,                          -- TipTap HTML
  excerpt     TEXT,
  type        TEXT NOT NULL DEFAULT 'blog'   CHECK (type IN ('blog', 'news')),
  status      TEXT NOT NULL DEFAULT 'draft'  CHECK (status IN ('draft', 'published', 'archived')),
  thumbnail   TEXT,                          -- Supabase Storage public URL
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX posts_slug_idx ON public.posts(slug);
CREATE INDEX posts_type_status_idx ON public.posts(type, status);
CREATE INDEX posts_published_at_idx ON public.posts(published_at DESC);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 2. カテゴリーテーブル (categories)
-- ========================================
CREATE TABLE public.categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'news', 'both'))
);

-- ========================================
-- 3. 投稿-カテゴリー中間テーブル
-- ========================================
CREATE TABLE public.post_categories (
  post_id     UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ========================================
-- 4. ユーザープロファイルテーブル
-- ========================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- auth.users に新規作成時、自動でプロファイル作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 5. お問い合わせテーブル (contact_messages)
-- ========================================
CREATE TABLE public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 6. メディア管理テーブル
-- ========================================
CREATE TABLE public.media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  size        BIGINT,
  mime_type   TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);
