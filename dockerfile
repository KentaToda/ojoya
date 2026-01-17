# 開発用 Dockerfile
# プロジェクトルートからビルド: docker build .

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

# ステージ2: バックエンド
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# 非rootユーザーの作成
RUN groupadd --system --gid 999 nonroot \
    && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app

# uv の設定
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_NO_DEV=1
ENV UV_TOOL_BIN_DIR=/usr/local/bin

# /app ディレクトリの所有権を変更（ここは root で実行）
RUN chown nonroot:nonroot /app

# ここで nonroot に切り替え
USER nonroot

# 依存関係のインストール
RUN --mount=type=cache,target=/home/nonroot/.cache/uv,uid=999,gid=999 \
    --mount=type=bind,source=backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=backend/pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project

# ソースコードをコピーしてインストール（--chown で所有権設定）
COPY --chown=nonroot:nonroot backend/ /app/
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

# フロントエンドのビルド済みファイルをコピー
COPY --from=frontend-builder --chown=nonroot:nonroot /frontend/dist /app/frontend/dist

ENV PATH="/app/.venv/bin:$PATH"

ENTRYPOINT []

# 開発モードで起動
CMD ["uv", "run", "fastapi", "dev", "--host", "0.0.0.0", "main.py"]
