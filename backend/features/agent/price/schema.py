from pydantic import BaseModel
from typing import Literal, Optional


class Valuation(BaseModel):
    """価格評価情報"""
    min_price: int
    max_price: int
    currency: Literal["JPY"] = "JPY"
    confidence: Literal["high", "medium", "low"]


class PriceAnalysis(BaseModel):
    """LLM出力用スキーマ"""
    min_price: int
    max_price: int
    confidence: Literal["high", "medium", "low"]
    reasoning: str
    display_message: str
    price_factors: Optional[list[str]] = None  # 価格変動要因（年代、カラー、状態など）


class PriceNodeOutput(BaseModel):
    """価格検索ノードの最終出力"""
    status: Literal["complete", "error"]
    valuation: Valuation
    display_message: str
    price_factors: Optional[list[str]] = None  # 価格変動要因
