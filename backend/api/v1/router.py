from fastapi import APIRouter

from api.v1.endpoints import analyze, appraisals

api_router = APIRouter()

# /analyze エンドポイントを登録
api_router.include_router(analyze.router, tags=["analysis"])

# /appraisals エンドポイントを登録
api_router.include_router(appraisals.router, tags=["appraisals"])
