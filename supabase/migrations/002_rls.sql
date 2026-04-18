-- ============================================
-- Innovation Music CMS — RLS Policies
-- ============================================

-- RLSを全テーブルで有効化
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- === posts ===
-- 公開投稿は誰でも読める
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- 認証済みユーザーは全操作可能
CREATE POLICY "Auth users can do everything on posts"
  ON public.posts FOR ALL
  USING (auth.uid() IS NOT NULL);

-- === profiles ===
-- 本人のみ自分のプロファイルを読める
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 管理者は全プロファイルを読める
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 管理者は全プロファイル操作可能
CREATE POLICY "Admin can manage profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- === contact_messages ===
-- 誰でも作成可能（お問い合わせフォーム）
CREATE POLICY "Anyone can create contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- 認証済みのみ読める
CREATE POLICY "Auth users can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 認証済みのみ更新可能 (is_read フラグ)
CREATE POLICY "Auth users can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- === media ===
CREATE POLICY "Auth users can manage media"
  ON public.media FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view media"
  ON public.media FOR SELECT
  USING (true);

-- === categories ===
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Auth users can manage categories"
  ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);

-- === post_categories ===
CREATE POLICY "Public can view post categories"
  ON public.post_categories FOR SELECT USING (true);

CREATE POLICY "Auth users can manage post categories"
  ON public.post_categories FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- Supabase Storage ポリシー
-- ============================================
-- storage.objects テーブルに対するポリシー
CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Auth users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);
