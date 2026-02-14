from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api.v1.router import api_router
from core.config import settings
from core.logging import get_logger, setup_logging

# ロギング初期化
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"GCP Project: {settings.GCP_PROJECT_ID}")
    yield
    # 終了時
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


is_production = settings.ENVIRONMENT == "production"

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if not is_production else None,
    docs_url=f"{settings.API_V1_STR}/docs" if not is_production else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if not is_production else None,
    lifespan=lifespan,
)

# CORS設定（設定ファイルから取得）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターをアプリケーションに登録
app.include_router(api_router, prefix=settings.API_V1_STR)

# 静的ファイルのパス設定（frontend/dist/ディレクトリ）
# 本番: /app/frontend/dist、開発: ../frontend/dist
FRONTEND_DIST_DIR = Path("/app/frontend/dist")
if not FRONTEND_DIST_DIR.exists():
    # 開発環境: backend/src/backend/main.py から ../../../frontend/dist へのパス
    FRONTEND_DIST_DIR = Path(__file__).parent.parent.parent.parent / "frontend" / "dist"

# 静的ファイルの配信設定（frontend/distディレクトリが存在する場合のみ）
if FRONTEND_DIST_DIR.exists():
    # 静的アセット（JS, CSS, 画像など）を配信
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST_DIR / "assets")), name="assets")

    # SPAフォールバック: API以外の全てのルートでindex.htmlを返す
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # 静的ファイルが存在する場合はそれを返す
        file_path = FRONTEND_DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # それ以外はindex.htmlを返す（SPAルーティング用）
        return FileResponse(FRONTEND_DIST_DIR / "index.html")


# ローカルデバッグ用 (python app/main.py で起動する場合)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)