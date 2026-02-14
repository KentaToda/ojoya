from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query

from core.firebase import AuthError, get_current_user_id
from core.firestore import firestore_client
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/appraisals")
async def get_appraisal_history(
    limit: int = Query(default=20, ge=1, le=100, description="取得件数"),
    offset: int = Query(default=0, ge=0, description="スキップ件数"),
    authorization: Optional[str] = Header(None, description="Bearer token"),
):
    """
    ユーザーの査定履歴を取得するエンドポイント
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="認証が必要です")

    try:
        user_id = await get_current_user_id(authorization)
    except AuthError as e:
        logger.warning(f"Auth failed: {e.code} - {e.message}")
        raise HTTPException(status_code=401, detail=e.message)

    try:
        appraisals = await firestore_client.get_appraisal_history(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )
        user = await firestore_client.get_or_create_user(user_id)
        total = user.get("total_appraisals", 0)
        return {"appraisals": appraisals, "total": total}
    except Exception as e:
        logger.error(f"Failed to get appraisal history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
