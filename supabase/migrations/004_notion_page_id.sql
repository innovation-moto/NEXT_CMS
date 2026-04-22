-- Notionページ連携用カラムを追加
alter table posts
  add column if not exists notion_page_id text unique;

create index if not exists posts_notion_page_id_idx on posts (notion_page_id);
