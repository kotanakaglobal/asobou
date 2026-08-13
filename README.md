# Asobou

友達グループで「いつ空いてるか」と「何をやりたいか」を持ち寄って、次の予定をサクッと決めるための、ログイン不要のWebツールです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトを用意する

1. [Supabase](https://supabase.com)で新規プロジェクトを作成します。
2. Supabaseダッシュボードの SQL Editor で `supabase/migrations/` 配下のSQLファイルを**番号順に**実行し、テーブル（`groups` / `members` / `availability` / `ideas` / `idea_votes` / `plans`）と RLS 設定を作成します（`0001_init.sql` → `0002_idea_note.sql` の順）。
   - Supabase CLI を使う場合は `supabase db push` でも適用できます。
3. Project Settings → API から以下を控えます。
   - `Project URL`
   - `service_role` キー（**anon key ではありません**）

### 3. 環境変数を設定する

`.env.example` を `.env.local` にコピーし、値を入力してください。

```bash
cp .env.example .env.local
```

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_` プレフィックスを付けないでください。このアプリはブラウザから直接Supabaseへアクセスせず、Next.jsのサーバー側（Server Components / Server Actions）だけがこの鍵を使います。

### 4. ローカルで起動する

```bash
npm run dev
```

<http://localhost:3000> を開いてください。

### 5. Vercelへのデプロイ

このリポジトリをVercelにインポートし、Project Settings → Environment Variables に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定するだけで動作します（追加のビルド設定は不要です）。

## 実装した機能

- グループ作成（グループ名 + 自分の名前 → 招待用URL発行）
- URLだけで参加（名前を入力するだけ、ログイン・パスワード不要）
- 空いてる日の登録（日付＋任意メモ、時刻入力なし）・一覧表示・自分が登録した空いてる日の編集/削除
- 他メンバーが登録した日程への「私も空いてます」ワンクリック意思表示
- やりたいことの自由入力（任意でメモも追加可能）・一覧・重複タイトルの防止（前後空白/大文字小文字を正規化して比較）
- やりたいことへの投票・取り消し（1人1票、Optimistic UI、自分で追加したアイデアには自動で投票済み）
- 「空いている人数が多い→やりたい人が多い→日付が近い」順の予定候補の自動表示
- 予定候補日（メンバーの空き状況から `n/m人` を算出、全員空きを優先表示）を踏まえた予定作成
- 予定の詳細表示・編集・削除
- 招待リンクの共有（Web Share API / クリップボードコピー）
- メンバー一覧表示、名前変更・削除（グループから抜ける）
- 主要エラー（グループ/アイデア/予定が見つからない、通信エラー、入力バリデーション）のハンドリング
- モバイルファーストなレスポンシブUI、PWA向けの manifest とアイコン

## 主な作成ファイル

```
supabase/migrations/0001_init.sql   DBスキーマ・RLS
lib/types.ts                        ドメイン型
lib/supabase/server.ts              Supabaseサーバークライアント（service role, server-only）
lib/token.ts                        share_token生成
lib/validation.ts                   入力バリデーション
lib/availability.ts                 空き時間の区間交差ロジック（純粋関数）
lib/candidates.ts                   予定候補のランキングロジック（純粋関数）
lib/format.ts                       日付・時刻の表示整形
lib/member-storage.ts               localStorageのメンバー情報ヘルパー
lib/db/*.ts                         Supabaseアクセス層（groups/members/availability/ideas/plans）
lib/actions/*.ts                    Server Actions（作成・参加・登録・投票・予定確定など）
components/JoinGate.tsx             参加ゲート + メンバーコンテキスト
components/VoteButton.tsx           投票ボタン（Optimistic UI）
components/InviteButton.tsx         招待リンク共有/コピー
components/*Form.tsx, PlanDetail.tsx 各種フォーム・予定編集UI
app/page.tsx                        ランディングページ
app/create/page.tsx                 グループ作成
app/g/[token]/**                    グループトップ・空き時間・やりたいこと・予定の各ページ
app/manifest.ts, app/icon.tsx, app/apple-icon.tsx  PWA設定
```

## セキュリティ設計（MVPとして許容している範囲）

- ログイン・パスワードは一切なし。**グループURL（`share_token`）自体を招待の秘密情報として扱います**（9バイトの暗号学的乱数、約72bitのエントロピー）。
- ブラウザは Supabase に直接アクセスしません。すべての読み書きは Next.js サーバー側（service role キー）を経由します。これにより Supabase の RLS は全テーブルで「有効化・ポリシーなし（デフォルト拒否）」にできます。万が一 anon key 相当の情報が漏れても、`share_token` の総当たり列挙はできません。
- メンバーの識別は `localStorage`（`asobou_group_[token]`）に保存した member ID のみで行います。ログインがない以上、**member ID はブラウザ側で偽装可能**です（他人のIDを推測するにはUUIDを当てる必要があり現実的ではありませんが、暗号学的な本人確認はできません）。MVPではこれを許容し、各Server Actionは「そのmember IDが該当グループの実在メンバーであるか」のみをDBで検証します。
- 全てのDBクエリはSupabaseクライアント経由のパラメータ化されたクエリで実行しており、SQLインジェクションのリスクはありません。
- メンバーの名前変更・削除は、グループの誰でも（自分以外に対しても）実行できます。招待リンクを知っている＝仲間内という前提のMVPの割り切りです。メンバー削除はそのメンバーが登録した空いてる日・やりたいこと・投票も連動して削除されます（`ON DELETE CASCADE`）。一方、空いてる日の編集・削除は登録した本人のみに制限しています。

## 未実装の項目 / 今後の改善候補

- Supabase Realtimeによる自動反映は未実装です（`revalidatePath`によるミューテーション直後の再取得のみ）。他メンバーの変更をリアルタイムに見るにはページの再読み込み・再訪問が必要です。
- 予定の「参加メンバー」は現状グループ全員として扱っており、予定ごとの参加者選別・出欠管理はできません（`plans`テーブルに参加者テーブルを追加すれば拡張可能です）。
- 招待リンクの失効・再発行機能はありません。
- 空いてる日は現在「日付単位」（時刻入力なし）で登録する仕様です。DBの`availability.start_time`/`end_time`列は非破壊対応のため残していますが、実際には常に終日（`00:00`〜`23:59`）で保存され、UI上は表示・編集しません。マイグレーション不要でこの仕様変更を行っています。
- 本セッションの実行環境には実際のSupabaseプロジェクトを接続していないため、`npm run build`によるビルド検証・型チェックは行いましたが、実データベースに対するエンドツーエンドの動作確認は未実施です。上記手順でSupabaseプロジェクトを接続の上、実際にご確認ください。
