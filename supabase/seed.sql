-- ============================================
-- Innovation Music CMS — Seed Data
-- ============================================

-- デフォルトカテゴリー
INSERT INTO public.categories (name, slug, type) VALUES
  ('お知らせ', 'oshirase', 'news'),
  ('プレスリリース', 'press-release', 'news'),
  ('技術ブログ', 'tech', 'blog'),
  ('カルチャー', 'culture', 'blog');

-- ============================================
-- サンプル投稿 (開発用)
-- 本番環境では削除してください
-- ============================================
INSERT INTO public.posts (title, slug, excerpt, type, status, published_at) VALUES
  (
    'Innovation Music ウェブサイトをリニューアルしました',
    'website-renewal-2024',
    '長らくご愛顧いただいたウェブサイトをこの度全面リニューアルいたしました。新たなデザインで皆様をお迎えします。',
    'news',
    'published',
    now() - interval '7 days'
  ),
  (
    '新サービス「Sound Studio Pro」をリリース',
    'sound-studio-pro-release',
    'プロフェッショナル向け音楽制作支援サービス「Sound Studio Pro」の提供を開始いたします。',
    'news',
    'published',
    now() - interval '14 days'
  ),
  (
    'Next.js 14でCMSを構築した話',
    'nextjs14-cms-development',
    'React Server Componentsを活用したヘッドレスCMSの構築について、実装上のポイントを解説します。',
    'blog',
    'published',
    now() - interval '3 days'
  ),
  (
    'GSAPで作るインタラクティブなWebアニメーション',
    'gsap-web-animation',
    'GSAPとScrollTriggerを使って、スクロールと連動した洗練されたアニメーションを実装する方法を紹介します。',
    'blog',
    'published',
    now() - interval '10 days'
  );
