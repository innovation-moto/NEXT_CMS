// /admin 配下の全ルート共通レイアウト（ログインページも含む）
// 認証チェック・サイドバーは (protected)/layout.tsx が担当
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
