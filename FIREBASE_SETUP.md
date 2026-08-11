# Firebase同期設定

1. Firebase Consoleでプロジェクトを作成し、Webアプリを登録する。
2. Authentication → Sign-in method → Email/Passwordを有効にする。
3. Firestore Databaseを作成する。
4. `firestore.rules`をFirestore Rulesへ反映する。
5. FirebaseのWebアプリ設定値をGitHub ActionsのRepository secretsへ登録する。

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

`service account`の秘密鍵は登録しない。Webアプリ設定値はクライアント用で、Firestore RulesとAuthenticationでアクセスを制限する。

登録後、GitHub Actionsの`Deploy to GitHub Pages`を再実行する。ゲーム画面の保護者メニューからメールアドレスとパスワードでログインすると、`game_progress/{userId}`へ到達ステージが保存される。
