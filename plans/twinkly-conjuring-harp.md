# 修正プラン: Docker環境でFirebase環境変数がフロントエンドに渡されない問題

## 問題の概要

履歴ページで「履歴を表示するには認証が必要です」と表示される原因は、Dockerビルド時に`VITE_FIREBASE_*`環境変数がフロントエンドに渡されていないため。

## 根本原因

1. Viteは**ビルド時**に`VITE_`プレフィックスの環境変数をJavaScriptバンドルに埋め込む
2. 開発用`dockerfile`にはビルド引数（ARG）が設定されていない
3. `compose.yaml`の`env_file`は**ランタイム時**にのみ適用され、ビルド時には効かない

## 修正内容

### 1. `dockerfile` の修正

フロントエンドビルドステージでビルド引数（ARG）を使用して環境変数を渡す。

**変更箇所**: 5-11行目付近

```dockerfile
# ステージ1: フロントエンドビルド
FROM node:20-slim AS frontend-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /frontend

# ビルド引数として環境変数を受け取る
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# 環境変数として設定
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build
```

### 2. `compose.yaml` の修正

ビルド時に`.env`から環境変数を渡す設定を追加。

**変更箇所**: devサービスのbuildセクション

```yaml
services:
  dev:
    build:
      context: .
      dockerfile: dockerfile
      args:
        - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
        - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
        - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
        - VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
        - VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
        - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
```

### 3. `dockerfile.prod` の修正（本番用）

本番用Dockerfileには一部のARGが既にあるが、`STORAGE_BUCKET`、`MESSAGING_SENDER_ID`、`APP_ID`が不足しているので追加。

**変更箇所**: 9-15行目を以下に置き換え

```dockerfile
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
```

## 修正対象ファイル

| ファイル | 修正内容 |
|---------|---------|
| [dockerfile](dockerfile) | ARG/ENVを追加してFirebase環境変数を受け取る |
| [dockerfile.prod](dockerfile.prod) | 不足している3つのARG/ENVを追加 |
| [compose.yaml](compose.yaml) | build.argsセクションを追加 |

## 検証方法

1. 修正後、Dockerイメージを再ビルド:
   ```bash
   docker compose build dev
   ```

2. コンテナを起動:
   ```bash
   docker compose up dev
   ```

3. ブラウザで履歴ページにアクセスし、「認証が必要です」が表示されないことを確認

4. ブラウザのコンソールで「Firebase is not configured」の警告が表示されないことを確認
