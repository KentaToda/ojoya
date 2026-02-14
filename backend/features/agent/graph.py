import asyncio

from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END

from features.agent.state import AgentState
from features.agent.vision.node import vision_node
from features.agent.search.node import search_node
from features.agent.price.node import price_node


# ---------------------------------------------------------
# 条件分岐関数
# ---------------------------------------------------------
def should_search(state: AgentState) -> str:
    """
    vision_nodeの結果に基づいて検索を行うかどうかを判定する。
    processableの場合のみ検索を実行する。
    """
    analysis = state.get("analysis_result")
    if analysis and analysis.category_type == "processable":
        return "search"
    return "end"


def should_price(state: AgentState) -> str:
    """
    search_nodeの結果に基づいて価格検索を行うかどうかを判定する。
    mass_productの場合のみ価格検索を実行する。
    """
    search_output = state.get("search_output")
    if search_output and search_output.analysis.classification == "mass_product":
        return "price"
    return "end"


# ---------------------------------------------------------
# グラフの構築
# ---------------------------------------------------------
workflow = StateGraph(AgentState)

# ノードの追加
workflow.add_node("node_vision", vision_node)
workflow.add_node("node_search", search_node)
workflow.add_node("node_price", price_node)

# エッジの追加
workflow.add_edge(START, "node_vision")

# 条件分岐: processableの場合のみsearch_nodeへ
workflow.add_conditional_edges(
    "node_vision",
    should_search,
    {
        "search": "node_search",
        "end": END,
    },
)

# 条件分岐: mass_productの場合のみprice_nodeへ
workflow.add_conditional_edges(
    "node_search",
    should_price,
    {
        "price": "node_price",
        "end": END,
    },
)
workflow.add_edge("node_price", END)

app = workflow.compile()


# =============================================
# API呼び出し用関数
# =============================================


async def stream_with_milestones(
    image_data: str,
    thinking_queue: asyncio.Queue,
) -> dict:
    """
    画像データを受け取って実際のノード関数を実行し、
    要所でマイルストーンメッセージをキューに送信する

    各ノード（vision_node, search_node, price_node）を直接呼び出すため、
    余分なLLM呼び出しは発生しない。

    Args:
        image_data: Base64エンコードされた画像文字列
        thinking_queue: マイルストーンメッセージを送信するキュー

    Returns:
        analysis_result, search_output, price_output を含む辞書
    """
    from core.logging import get_logger

    logger = get_logger(__name__)

    message = HumanMessage(
        content=[
            {
                "type": "image_url",
                "image_url": {"url": image_data},
            }
        ]
    )

    state = {
        "messages": [message],
        "retry_count": 0,
        "analysis_result": None,
        "search_output": None,
        "price_output": None,
    }

    # ========================================
    # Vision Node
    # ========================================
    await thinking_queue.put(
        {
            "type": "node_start",
            "node": "vision",
            "message": "画像を解析しています...",
        }
    )

    try:
        vision_result = await vision_node(state)
        state.update(vision_result)
    except Exception as e:
        logger.error(f"Vision Node Error: {e}", exc_info=True)
        await thinking_queue.put(
            {
                "type": "error",
                "node": "vision",
                "message": str(e),
            }
        )
        return state

    analysis = state.get("analysis_result")

    if analysis and analysis.category_type == "processable":
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "vision",
                "content": f"商品名を特定しました...「{analysis.item_name}」のようです",
            }
        )
    elif analysis and analysis.category_type == "prohibited":
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "vision",
                "content": "この画像は査定対象外です",
            }
        )
    else:
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "vision",
                "content": "商品を特定できませんでした",
            }
        )

    await thinking_queue.put(
        {
            "type": "node_complete",
            "node": "vision",
            "data": {
                "category_type": analysis.category_type if analysis else "unknown",
                "item_name": analysis.item_name if analysis else None,
            },
        }
    )

    # processable でなければ終了
    if not analysis or analysis.category_type != "processable":
        return state

    # ========================================
    # Search Node
    # ========================================
    await thinking_queue.put(
        {
            "type": "node_start",
            "node": "search",
            "message": "市場情報を調査しています...",
        }
    )

    try:
        search_result = await search_node(state)
        state.update(search_result)
    except Exception as e:
        logger.error(f"Search Node Error: {e}", exc_info=True)
        await thinking_queue.put(
            {
                "type": "error",
                "node": "search",
                "message": str(e),
            }
        )
        return state

    search_output = state.get("search_output")

    if search_output and search_output.analysis.classification == "mass_product":
        product = search_output.analysis.identified_product or analysis.item_name
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "search",
                "content": f"「{product}」は既製品と判定しました。価格を調べます...",
            }
        )
    else:
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "search",
                "content": "一点物と判定しました。市場相場の算出は困難です。",
            }
        )

    await thinking_queue.put(
        {
            "type": "node_complete",
            "node": "search",
            "data": {
                "classification": search_output.analysis.classification
                if search_output
                else "unknown",
                "identified_product": search_output.analysis.identified_product
                if search_output
                else None,
            },
        }
    )

    # mass_product でなければ終了
    if not search_output or search_output.analysis.classification != "mass_product":
        return state

    # ========================================
    # Price Node
    # ========================================
    await thinking_queue.put(
        {
            "type": "node_start",
            "node": "price",
            "message": "中古相場を検索しています...",
        }
    )

    try:
        price_result = await price_node(state)
        state.update(price_result)
    except Exception as e:
        logger.error(f"Price Node Error: {e}", exc_info=True)
        await thinking_queue.put(
            {
                "type": "error",
                "node": "price",
                "message": str(e),
            }
        )
        return state

    price_output = state.get("price_output")

    if price_output and price_output.valuation.min_price > 0:
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "price",
                "content": f"金額情報を検索できました...{price_output.valuation.min_price:,}〜{price_output.valuation.max_price:,}円程度",
            }
        )
    else:
        await thinking_queue.put(
            {
                "type": "thinking",
                "node": "price",
                "content": "価格情報の特定が困難でした。",
            }
        )

    await thinking_queue.put(
        {
            "type": "node_complete",
            "node": "price",
            "data": {
                "min_price": price_output.valuation.min_price if price_output else 0,
                "max_price": price_output.valuation.max_price if price_output else 0,
            },
        }
    )

    return state
