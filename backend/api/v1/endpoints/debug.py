"""
デバッグ用エンドポイント

各ノード（Vision、Search、Price）を個別に呼び出して出力を検証できる。
画像はファイルアップロード形式で受け付ける。
"""

import base64
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from features.agent.graph import (
    run_vision_agent,
    run_search_agent,
    run_price_agent,
    run_search_node_only,
    run_price_node_only,
)
from features.agent.vision.schema import InitialAnalysis
from features.agent.search.schema import SearchNodeOutput
from features.agent.price.schema import PriceNodeOutput

router = APIRouter(prefix="/debug")


# =============================================
# ヘルパー関数
# =============================================
async def _file_to_base64(file: UploadFile) -> str:
    """アップロードされたファイルをBase64文字列に変換"""
    content = await file.read()
    base64_str = base64.b64encode(content).decode("utf-8")

    # Content-Typeからmime typeを取得
    content_type = file.content_type or "image/jpeg"

    return f"data:{content_type};base64,{base64_str}"


# =============================================
# レスポンスモデル
# =============================================
class VisionResponse(BaseModel):
    """Visionノードのレスポンス"""

    analysis_result: InitialAnalysis


class SearchResponse(BaseModel):
    """Searchノードのレスポンス"""

    search_output: SearchNodeOutput
    vision_result: InitialAnalysis | None = None
    mode: str  # "image" または "direct"


class PriceResponse(BaseModel):
    """Priceノードのレスポンス"""

    price_output: PriceNodeOutput
    search_output: SearchNodeOutput | None = None
    vision_result: InitialAnalysis | None = None
    mode: str  # "image" または "direct"


# =============================================
# エンドポイント
# =============================================
@router.post("/vision", response_model=VisionResponse)
async def debug_vision_node(
    image: Annotated[UploadFile, File(description="分析する画像ファイル")]
):
    """
    Visionノードを単独で実行

    画像ファイルをアップロードして、商品の分類（processable/unknown/prohibited）と
    商品名・視覚的特徴を抽出します。
    """
    # ファイル形式チェック
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"画像ファイルをアップロードしてください（受信: {image.content_type}）"
        )

    image_base64 = await _file_to_base64(image)
    result = await run_vision_agent(image_base64)
    analysis = result.get("analysis_result")

    if not analysis:
        raise HTTPException(status_code=500, detail="Vision node returned no result")

    return VisionResponse(analysis_result=analysis)


@router.post("/search", response_model=SearchResponse)
async def debug_search_node(
    image: Annotated[UploadFile | None, File(description="分析する画像ファイル（画像モード）")] = None,
    item_name: Annotated[str | None, Form(description="商品名（直接入力モード）")] = None,
    visual_features: Annotated[str | None, Form(description="視覚的特徴（カンマ区切り、直接入力モード）")] = None,
):
    """
    Searchノードを実行

    2つのモード:
    - 画像モード: imageをアップロード → Vision → Search を実行
    - 直接入力モード: item_name と visual_features を指定 → Searchのみ実行
    """
    has_image = image is not None
    has_direct_input = item_name is not None

    if not has_image and not has_direct_input:
        raise HTTPException(
            status_code=400,
            detail="image または item_name のいずれかを指定してください"
        )
    if has_image and has_direct_input:
        raise HTTPException(
            status_code=400,
            detail="image と item_name は同時に指定できません（どちらかのモードを選択してください）"
        )

    if has_image:
        # 画像モード
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"画像ファイルをアップロードしてください（受信: {image.content_type}）"
            )

        image_base64 = await _file_to_base64(image)
        result = await run_search_agent(image_base64)
        search_output = result.get("search_output")
        vision_result = result.get("analysis_result")

        if not search_output:
            if vision_result:
                raise HTTPException(
                    status_code=400,
                    detail=f"Vision結果が '{vision_result.category_type}' のため、Searchは実行されませんでした",
                )
            raise HTTPException(status_code=500, detail="Search node returned no result")

        return SearchResponse(
            search_output=search_output,
            vision_result=vision_result,
            mode="image",
        )
    else:
        # 直接入力モード
        features_list = None
        if visual_features:
            features_list = [f.strip() for f in visual_features.split(",") if f.strip()]

        result = await run_search_node_only(
            item_name=item_name,
            visual_features=features_list,
        )
        search_output = result.get("search_output")

        if not search_output:
            raise HTTPException(status_code=500, detail="Search node returned no result")

        return SearchResponse(
            search_output=search_output,
            vision_result=None,
            mode="direct",
        )


@router.post("/price", response_model=PriceResponse)
async def debug_price_node(
    image: Annotated[UploadFile | None, File(description="分析する画像ファイル（画像モード）")] = None,
    identified_product: Annotated[str | None, Form(description="特定された商品名（直接入力モード）")] = None,
    visual_features: Annotated[str | None, Form(description="視覚的特徴（カンマ区切り、直接入力モード）")] = None,
):
    """
    Priceノードを実行

    2つのモード:
    - 画像モード: imageをアップロード → Vision → Search → Price を実行
    - 直接入力モード: identified_product と visual_features を指定 → Priceのみ実行
    """
    has_image = image is not None
    has_direct_input = identified_product is not None

    if not has_image and not has_direct_input:
        raise HTTPException(
            status_code=400,
            detail="image または identified_product のいずれかを指定してください"
        )
    if has_image and has_direct_input:
        raise HTTPException(
            status_code=400,
            detail="image と identified_product は同時に指定できません（どちらかのモードを選択してください）"
        )

    if has_image:
        # 画像モード
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"画像ファイルをアップロードしてください（受信: {image.content_type}）"
            )

        image_base64 = await _file_to_base64(image)
        result = await run_price_agent(image_base64)
        price_output = result.get("price_output")
        search_output = result.get("search_output")
        vision_result = result.get("analysis_result")

        if not price_output:
            if vision_result and vision_result.category_type != "processable":
                raise HTTPException(
                    status_code=400,
                    detail=f"Vision結果が '{vision_result.category_type}' のため、Price検索は実行されませんでした",
                )
            if search_output and search_output.analysis.classification != "mass_product":
                raise HTTPException(
                    status_code=400,
                    detail=f"Search結果が '{search_output.analysis.classification}' のため、Price検索は実行されませんでした",
                )
            raise HTTPException(status_code=500, detail="Price node returned no result")

        return PriceResponse(
            price_output=price_output,
            search_output=search_output,
            vision_result=vision_result,
            mode="image",
        )
    else:
        # 直接入力モード
        features_list = None
        if visual_features:
            features_list = [f.strip() for f in visual_features.split(",") if f.strip()]

        result = await run_price_node_only(
            identified_product=identified_product,
            visual_features=features_list,
        )
        price_output = result.get("price_output")

        if not price_output:
            raise HTTPException(status_code=500, detail="Price node returned no result")

        return PriceResponse(
            price_output=price_output,
            search_output=None,
            vision_result=None,
            mode="direct",
        )
