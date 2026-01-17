# Ojoya Frontend Implementation Plan

## Overview

Vite + React + TypeScript でRPGテーマのフロントエンドを `/frontend` ディレクトリに構築する。

**技術スタック:**
- Framework: Vite + React 18
- Language: TypeScript
- Package Manager: pnpm
- Auth: Firebase Anonymous Auth
- Styling: CSS Modules + CSS Variables

## Design Direction: RPG Fantasy Theme

### Typography
- **Display Font:** Playfair Display (weight: 200, 900)
- **Body Font:** Crimson Pro (weight: 200, 700, 800)
- **Mono Font:** JetBrains Mono (weight: 100, 700)
- **Size Contrast:** 3x+ (base 16px → headers 48-80px)

### Color Palette
```css
--color-gold: #C9A227;
--color-parchment: #F5E6C8;
--color-leather: #5C4033;
--color-ink: #1A1A1A;
--confidence-high: #2D5A27;    /* 深い森緑 */
--confidence-medium: #8B6914;  /* アンティークゴールド */
--confidence-low: #8B4513;     /* サドルブラウン */
```

### Visual Elements
- Ornate gold borders with corner decorations
- Parchment texture backgrounds
- Dramatic shadows and glow effects
- Medieval-style decorative frames

---

## Project Structure

```
/frontend
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
│
└── src/
    ├── main.tsx
    ├── App.tsx
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button/
    │   │   ├── OrnateFrame/
    │   │   └── LoadingSpinner/
    │   ├── layout/
    │   │   ├── Header/
    │   │   └── PageLayout/
    │   └── features/
    │       ├── ImagePicker/
    │       ├── AnalysisProgress/
    │       ├── AppraisalResult/
    │       └── AppraisalHistory/
    │
    ├── pages/
    │   ├── HomePage/
    │   ├── AppraisalPage/
    │   └── HistoryPage/
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useAutoAuth.ts
    │   └── useStreamingAnalysis.ts
    │
    ├── lib/
    │   ├── firebase.ts
    │   ├── api.ts
    │   └── streaming.ts
    │
    ├── types/
    │   └── api.ts
    │
    └── styles/
        ├── globals.css
        └── rpg-theme.css
```

---

## Implementation Steps

### Phase 1: Project Setup
1. `pnpm create vite frontend --template react-ts`
2. Install dependencies: `react-router-dom`, `firebase`
3. Configure vite.config.ts with path aliases
4. Create folder structure
5. Set up environment variables (.env.example)
6. Create global styles with RPG theme CSS variables
7. Import Google Fonts (Playfair Display, Crimson Pro, JetBrains Mono)

### Phase 2: Firebase & API Infrastructure
1. Create `lib/firebase.ts` - Firebase initialization
2. Create `hooks/useAuth.ts` - Auth state management
3. Create `hooks/useAutoAuth.ts` - Auto anonymous sign-in
4. Create `lib/api.ts` - API client with token injection
5. Create `lib/streaming.ts` - SSE streaming client
6. Define TypeScript types in `types/api.ts`

### Phase 3: Common Components
1. `OrnateFrame` - Decorative frame with gold borders and corners
2. `Button` - RPG-styled buttons (primary, secondary, ghost variants)
3. `LoadingSpinner` - Medieval-themed loading animation
4. `Header` - App header with navigation
5. `PageLayout` - Page wrapper with consistent styling

### Phase 4: Feature Components
1. `ImagePicker` - Drag & drop, file select, camera capture
2. `AnalysisProgress` - Collapsible AI thinking display with SSE
3. `AppraisalResult` - Result display for 4 classification types:
   - `MassProductResult` - Price range, factors, confidence
   - `UniqueItemResult` - Expert recommendation
   - `UnknownResult` - Retry advice
   - `ProhibitedResult` - Warning message
4. `AppraisalHistory` - List of past appraisals

### Phase 5: Pages & Routing
1. `HomePage` - Hero with call to action
2. `AppraisalPage` - Image upload → Analysis → Result flow
3. `HistoryPage` - Appraisal history list
4. Configure React Router

---

## Key Files to Modify/Create

| File | Purpose |
|------|---------|
| `/frontend/package.json` | Dependencies configuration |
| `/frontend/vite.config.ts` | Vite configuration with aliases |
| `/frontend/src/styles/rpg-theme.css` | RPG theme CSS variables |
| `/frontend/src/lib/firebase.ts` | Firebase initialization |
| `/frontend/src/hooks/useAuth.ts` | Authentication hook |
| `/frontend/src/lib/api.ts` | API client with auth |
| `/frontend/src/lib/streaming.ts` | SSE streaming client |
| `/frontend/src/components/common/OrnateFrame/` | Decorative frame component |
| `/frontend/src/components/features/ImagePicker/` | Image upload component |
| `/frontend/src/components/features/AnalysisProgress/` | AI thinking display |
| `/frontend/src/components/features/AppraisalResult/` | Result display |
| `/frontend/src/pages/AppraisalPage/` | Main appraisal page |

---

## Reference Documents

- `docs/frontend/ui_guidelines.md` - Component specifications and example code
- `docs/frontend/firebase_auth.md` - Firebase auth implementation
- `docs/frontend/firestore_schema.md` - API response types
- `docs/api/analyze_endpoint.md` - API specification

---

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

---

## Verification

1. **開発サーバー起動**: `cd frontend && pnpm dev`
2. **認証確認**: 初回アクセスで匿名サインインが自動実行される
3. **画像アップロード**: ドラッグ&ドロップ、ファイル選択が機能する
4. **API連携**: バックエンド起動状態で査定が実行される
5. **SSEストリーミング**: AI思考プロセスがリアルタイム表示される
6. **結果表示**: 4種類の分類に応じた結果が正しく表示される
7. **レスポンシブ**: モバイル/タブレット/デスクトップで正しく表示される
