"""
Vision Node - SerpApi Google Lens統合

画像をGoogle Lensで検索し、商品情報を取得する。
軽量LLMによるガードレールチェックも実施。
"""

import re
from typing import Optional

from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from core.config import settings
from core.logging import get_logger
from core.serpapi import serpapi_client
from core.storage import storage_client
from features.agent.state import AgentState
from features.agent.vision.schema import GuardrailResult, InitialAnalysis
from features.agent.vision.serpapi_schema import GoogleLensResponse

logger = get_logger(__name__)


def _parse_product_identification(text: str) -> tuple[Optional[str], list[str]]:
    """LLM応答から商品名と特徴をパース"""
    item_name = None
    visual_features = []

    for line in text.strip().splitlines():
        line = line.strip()
        if line.startswith("商品名:") or line.startswith("商品名："):
            item_name = line.split(":", 1)[-1].split("：", 1)[-1].strip()
        elif line.startswith("特徴:") or line.startswith("特徴："):
            raw = line.split(":", 1)[-1].split("：", 1)[-1].strip()
            visual_features = [f.strip() for f in raw.split(",") if f.strip()]

    return item_name, visual_features


async def _identify_product_name(
    messages: list,
    lens_result: GoogleLensResponse,
) -> tuple[Optional[str], list[str]]:
    """
    LLMで画像+Google Lens結果から正確な商品名を特定

    Returns:
        (item_name, visual_features)
    """
    llm = ChatGoogleGenerativeAI(
        model=settings.MODEL_VISION_NODE,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION,
        temperature=0,
        max_retries=2,
        vertexai=True,
    )

    lens_context = lens_result.to_llm_context()

    prompt = f"""あなたは商品鑑定の専門家です。
ユーザーが撮影した商品画像と、Google Lens画像検索の結果を照合して、正確な商品名を特定してください。

【Google Lens検索結果】
{lens_context}

【タスク】
1. 画像に写っている商品を確認
2. Google Lens結果の類似商品一覧から、最も一致する商品を特定
3. 以下のフォーマットで出力

【出力フォーマット】
商品名: [ブランド名] [商品名/モデル名] [カラー/バリエーション]
特徴: [特徴1], [特徴2], [特徴3]

【出力例】
商品名: Nike Air Max 90 ホワイト/レッド
特徴: スニーカー, メンズ, ローカット

商品名: Louis Vuitton ネヴァーフル MM ダミエ・エベヌ
特徴: トートバッグ, レザー, ブラウン

【注意】
- 型番やモデル名が特定できる場合は必ず含める
- 販売ページのタイトル（「送料無料」「セール」等の修飾語）はそのまま使わない
- 確信が持てない部分は省略してよい（不正確な情報を入れるより省略する）
"""

    identify_messages = [
        SystemMessage(content=prompt),
    ] + messages

    result = await llm.ainvoke(identify_messages)

    return _parse_product_identification(result.content)


def _extract_image_base64_from_messages(messages: list) -> Optional[str]:
    """メッセージから画像Base64を抽出"""
    for msg in messages:
        if hasattr(msg, "content") and isinstance(msg.content, list):
            for content in msg.content:
                if isinstance(content, dict) and content.get("type") == "image_url":
                    image_url = content.get("image_url", {})
                    url = (
                        image_url.get("url", "")
                        if isinstance(image_url, dict)
                        else image_url
                    )
                    # data:image/...;base64,... 形式から抽出
                    if url.startswith("data:image"):
                        match = re.match(r"data:image/[^;]+;base64,(.+)", url)
                        if match:
                            return match.group(1)
                        return url.split(",", 1)[-1] if "," in url else None
    return None


def _map_lens_result_to_analysis(
    lens_result: GoogleLensResponse,
    llm_item_name: Optional[str] = None,
    llm_visual_features: Optional[list[str]] = None,
) -> InitialAnalysis:
    """Google Lens結果をInitialAnalysisにマッピング（LLM特定結果を優先）"""

    if lens_result.status == "Error":
        return InitialAnalysis(
            category_type="unknown",
            confidence="low",
            reasoning=f"Google Lens検索エラー: {lens_result.error_message}",
            retry_advice="しばらく待ってからもう一度お試しください。",
        )

    if not lens_result.has_matches:
        return InitialAnalysis(
            category_type="unknown",
            confidence="low",
            reasoning="Google Lensで類似商品が見つかりませんでした。",
            retry_advice="別の角度から撮影するか、商品全体が写るようにしてください。",
        )

    # LLM特定結果を優先、なければGoogle Lens生データにフォールバック
    item_name = llm_item_name or lens_result.get_item_name()
    visual_features = llm_visual_features or lens_result.get_visual_features(
        max_items=5
    )

    # 信頼度を判定
    confidence = "high"
    if len(lens_result.visual_matches) < 3:
        confidence = "medium"
    if not lens_result.knowledge_graph:
        confidence = "medium" if confidence == "high" else "low"

    match_count = len(lens_result.visual_matches)
    reasoning = f"Google Lensで{match_count}件の類似商品を検出しました。"
    if item_name:
        reasoning += f" 商品名: {item_name}"

    return InitialAnalysis(
        category_type="processable",
        confidence=confidence,
        reasoning=reasoning,
        item_name=item_name,
        visual_features=visual_features,
    )


async def _check_guardrails(messages: list) -> Optional[InitialAnalysis]:
    """
    軽量LLMでガードレールチェック

    禁止コンテンツ（顔、個人情報など）を検出した場合はInitialAnalysisを返す。
    問題なければNoneを返す。
    """
    if not settings.ENABLE_GUARDRAIL_CHECK:
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.MODEL_GUARDRAIL,
            project=settings.GCP_PROJECT_ID,
            location=settings.GCP_LOCATION,
            temperature=0,
            vertexai=True,
        )

        guardrail_prompt = """あなたは画像の安全性を判定するモデレーターです。
画像を注意深く観察し、以下の禁止コンテンツが含まれていないか判定してください。

【禁止コンテンツ一覧】
1. 人物の顔が明確に写っている（※商品を着用しているモデル写真は除く）
2. 個人情報（住所、電話番号、クレジットカード番号、マイナンバーカード、保険証、パスポート、免許証など）
3. 現金・有価証券
4. 動物・ペット・生き物（犬、猫、鳥、魚、爬虫類、昆虫など種類を問わず全ての生き物。ただし動物のぬいぐるみ・フィギュア・イラストなどの「商品」は除く）

【特に注意すべき点】
- 画像の主要な被写体が生きている動物・ペットである場合は必ず禁止です
- このサービスは「商品の査定」が目的です。商品ではないもの（ペット、人物など）は禁止です
- 判断に迷う場合は禁止と判定してください"""

        guardrail_messages = [SystemMessage(content=guardrail_prompt)] + messages

        structured_llm = llm.with_structured_output(GuardrailResult)
        result = await structured_llm.ainvoke(guardrail_messages)
        logger.info(
            f"Guardrail response: is_prohibited={result.is_prohibited}, "
            f"observation={result.observation}, reason={result.reason}"
        )

        if result.is_prohibited:
            logger.info("Guardrail detected prohibited content")
            return InitialAnalysis(
                category_type="prohibited",
                confidence="high",
                reasoning=f"禁止コンテンツが検出されました: {result.reason}",
            )

        return None

    except Exception as e:
        logger.warning(f"Guardrail check failed, continuing: {e}")
        return None


async def _vision_node_async(state: "AgentState") -> dict:
    """Vision Nodeの非同期実装"""

    messages = state["messages"]

    # Step 1: 画像Base64を抽出
    image_base64 = _extract_image_base64_from_messages(messages)
    if not image_base64:
        logger.error("No image found in messages")
        return {
            "analysis_result": InitialAnalysis(
                category_type="unknown",
                confidence="low",
                reasoning="画像が見つかりませんでした。",
                retry_advice="画像を添付してください。",
            )
        }

    # Step 2: ガードレールチェック（prohibitedなら即終了）
    guardrail_result = await _check_guardrails(messages)
    if guardrail_result:
        return {"analysis_result": guardrail_result}

    # Step 3: SerpApi用に画像をGCSにアップロード
    try:
        image_url = await storage_client.upload_temp_image_for_serpapi(image_base64)
    except Exception as e:
        logger.error(f"Failed to upload image for SerpApi: {e}")
        return {
            "analysis_result": InitialAnalysis(
                category_type="unknown",
                confidence="low",
                reasoning=f"画像のアップロードに失敗しました: {str(e)}",
                retry_advice="もう一度お試しください。",
            )
        }

    # Step 4: SerpApi Google Lens検索
    lens_result = await serpapi_client.search_by_image_url(
        image_url=image_url,
        search_type="products",
    )

    # Step 4.5: LLMで商品名を特定（Google Lens結果がある場合のみ）
    llm_item_name = None
    llm_visual_features = None
    if lens_result.has_matches:
        try:
            llm_item_name, llm_visual_features = await _identify_product_name(
                messages, lens_result
            )
            logger.info(f"LLM identified product: {llm_item_name}")
        except Exception as e:
            logger.warning(f"Product identification failed, using raw lens data: {e}")

    # Step 5: Google Lens結果をマッピング（LLM結果を優先）
    analysis = _map_lens_result_to_analysis(
        lens_result, llm_item_name, llm_visual_features
    )

    logger.info(
        f"Vision node completed: category={analysis.category_type}, "
        f"confidence={analysis.confidence}, item={analysis.item_name}"
    )

    return {"analysis_result": analysis}


async def vision_node(state: "AgentState") -> dict:
    """
    Vision Node - SerpApi Google Lens統合

    1. 画像をGCSにアップロード
    2. SerpApi Google Lensで検索
    3. 軽量LLMでガードレールチェック
    4. 結果をInitialAnalysisにマッピング
    """
    try:
        return await _vision_node_async(state)
    except Exception as e:
        logger.error(f"Vision node error: {e}", exc_info=True)
        return {
            "analysis_result": InitialAnalysis(
                category_type="unknown",
                confidence="low",
                reasoning=f"System Error: {str(e)}",
                retry_advice="システムエラーが発生しました。もう一度お試しください。",
            )
        }
