from fastapi import APIRouter

from api.v1.endpoints import analyze, appraisals, debug, health

api_router = APIRouter()

# /health エンドポイントを登録
api_router.include_router(health.router, tags=["health"])

# /analyze エンドポイントを登録
api_router.include_router(analyze.router, tags=["analysis"])

# /appraisals, /users エンドポイントを登録
api_router.include_router(appraisals.router, tags=["appraisals"])

# /debug エンドポイントを登録（各ノードの個別テスト用）
api_router.include_router(debug.router, tags=["debug"])