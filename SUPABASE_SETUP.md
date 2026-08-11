# Supabase同期設定

このゲームは、未設定時は端末内保存、Supabase設定後は保護者メール認証とクラウド進捗保存を使います。

## Supabase側

1. Supabaseで新しいプロジェクトを作成する。
2. SQL Editorで`supabase/migrations/001_game_progress.sql`を実行する。
3. Authentication → Providers → EmailでEmail providerを有効にする。
4. Email OTPを有効にし、本番利用時はSMTPを設定する。
5. Authentication → URL ConfigurationのSite URLへGitHub Pages URLを登録する。

## GitHub側

Repository Settings → Secrets and variables → Actions → New repository secretから、次を登録する。

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

`service_role`キーは登録・公開しない。フロントエンドへ埋め込むのはpublishable/anon keyだけにする。

登録後、Actionsの`Deploy to GitHub Pages`を手動実行する。ログインなしでも遊べるが、保護者メニューからメールOTPでログインすると、到達ステージがクラウドへ同期される。
