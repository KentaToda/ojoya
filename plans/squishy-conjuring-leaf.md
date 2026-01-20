# 個別ノードエンドポイント作成計画

## 目的
LangGraphエージェントの各ノード（Vision、Search、Price）を個別に呼び出すAPIエンドポイントを作成し、各ステップの出力を検証・デバッグできるようにする。

---

## 作成するエンドポイント

### 1. Vision Node エンドポイント
```
POST /api/v1/debug/vision
```

**入力:**
```json
{ "image_base64": "data:image/jpeg;base64,..." }
```

**出力:** `InitialAnalysis`
```json
{
  "category_type": "processable" | "unknown" | "prohibited",
  "confidence": "high" | "medium" | "low",
  "reasoning": "string",
  "item_name": "string | null",
  "visual_features": ["string"],
  "retry_advice": "string | null"
}
```

---

### 2. Search Node エンドポイント
```
POST /api/v1/debug/search
```

**入力（2つのモード - いずれか一方を指定）:**

```json
// モードA: 画像から実行（Vision → Search）
{ "image_base64": "data:image/jpeg;base64,..." }

// モードB: Visionの出力を直接渡す（Searchのみ実行）
{ "item_name": "NIKE Air Max 90", "visual_features": ["白", "メッシュ素材"] }
```

**出力:** `SearchNodeOutput`
```json
{
  "search_results": [],
  "analysis": {
    "classification": "mass_product" | "unique_item",
    "confidence": "high" | "medium" | "low",
    "reasoning": "string",
    "identified_product": "string | null"
  },
  "search_performed": true
}
```

---

### 3. Price Node エンドポイント
```
POST /api/v1/debug/price
```

**入力（2つのモード - いずれか一方を指定）:**

```json
// モードA: 画像から実行（全パイプライン: Vision → Search → Price）
{ "image_base64": "data:image/jpeg;base64,..." }

// モードB: Searchの出力を直接渡す（Priceのみ実行）
{ "identified_product": "NIKE Air Max 90, 白", "visual_features": ["白", "メッシュ素材"] }
```

**出力:** `PriceNodeOutput`
```json
{
  "status": "complete" | "error",
  "valuation": {
    "min_price": 5000,
    "max_price": 12000,
    "currency": "JPY",
    "confidence": "high"
  },
  "display_message": "string",
  "price_factors": ["string"]
}
```

---

## 実装計画

### Step 1: Search/Priceノードの単独実行関数を追加
**ファイル:** [graph.py](backend/features/agent/graph.py)

既存の `search_node()` と `price_node()` は `state` から前ノードの出力を取得している。
直接入力を受け取る新しい関数を追加:

```python
async def run_search_node_only(item_name: str, visual_features: list[str]) -> SearchNodeOutput:
    """Searchノードを直接実行（Visionノードをスキップ）"""

async def run_price_node_only(identified_product: str, visual_features: list[str]) -> PriceNodeOutput:
    """Priceノードを直接実行（Vision/Searchノードをスキップ）"""
```

### Step 2: デバッグ用エンドポイントファイル作成
**ファイル:** [debug.py](backend/api/v1/endpoints/debug.py) （新規作成）

- 3つのエンドポイントを定義
- 認証なし（デバッグ用）
- Pydanticモデルでリクエストバリデーション

```python
class VisionRequest(BaseModel):
    image_base64: str

class SearchRequest(BaseModel):
    image_base64: str | None = None
    item_name: str | None = None
    visual_features: list[str] | None = None

class PriceRequest(BaseModel):
    image_base64: str | None = None
    identified_product: str | None = None
    visual_features: list[str] | None = None
```

### Step 3: ルーターへ登録
**ファイル:** [router.py](backend/api/v1/router.py)

```python
from api.v1.endpoints import debug
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
```

---

## 修正対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| [backend/features/agent/graph.py](backend/features/agent/graph.py) | `run_search_node_only()`, `run_price_node_only()` を追加 |
| [backend/api/v1/endpoints/debug.py](backend/api/v1/endpoints/debug.py) | 新規作成 - 3つのエンドポイント |
| [backend/api/v1/router.py](backend/api/v1/router.py) | debug routerを登録 |

---

## 検証方法

1. サーバー起動:
   ```bash
   cd backend && fastapi dev main.py
   ```

2. Swagger UIで確認:
   - `http://localhost:8000/docs`
   - `/api/v1/debug/vision`, `/api/v1/debug/search`, `/api/v1/debug/price` が表示される

3. curlでテスト:
   ```bash
   # Vision Node テスト
   curl -X POST http://localhost:8000/api/v1/debug/vision \
     -H "Content-Type: application/json" \
     -d '{"image_base64": "data:image/jpeg;base64,..."}'

   # Search Node テスト（直接入力）
   curl -X POST http://localhost:8000/api/v1/debug/search \
     -H "Content-Type: application/json" \
     -d '{"item_name": "NIKE Air Max 90", "visual_features": ["白", "メッシュ"]}'

   # Price Node テスト（直接入力）
   curl -X POST http://localhost:8000/api/v1/debug/price \
     -H "Content-Type: application/json" \
     -d '{"identified_product": "NIKE Air Max 90, 白", "visual_features": ["白"]}'
   ```
