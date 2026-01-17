# 修正計画: HistoryPage の undefined エラー

## 問題の概要

`HistoryPage`で `appraisals` が `undefined` の状態で `.length` にアクセスしてエラーが発生する。

```
Cannot read properties of undefined (reading 'length')
```

## 原因分析

[AppraisalHistory.tsx:42](frontend/src/components/features/AppraisalHistory/AppraisalHistory.tsx#L42) で:

```tsx
if (loading && appraisals.length === 0) {
```

`appraisals` が `undefined` の場合にエラーになる。

`useAppraisalHistory` フックは `appraisals` を `useState<AppraisalDocument[]>([])` で初期化しているが、以下のタイミング問題がある:

1. `HistoryPage` で `useAutoAuth` と `useAppraisalHistory` を同時に呼び出している
2. `useAppraisalHistory` 内の `useAuth` と `useAutoAuth` 内の `useAuth` は別々のフック呼び出し
3. 認証状態の同期タイミングによって、APIからのレスポンスで `undefined` が返る可能性がある

## 修正方針

`AppraisalHistory` コンポーネントで `appraisals` が `undefined` の場合を防御的にハンドリングする。

## 修正対象ファイル

- [frontend/src/components/features/AppraisalHistory/AppraisalHistory.tsx](frontend/src/components/features/AppraisalHistory/AppraisalHistory.tsx)

## 修正内容

42行目と72行目で `appraisals?.length` (オプショナルチェイニング) を使用するか、または早期リターンで `undefined` をチェック:

```tsx
// 42行目を修正
if (loading && (!appraisals || appraisals.length === 0)) {

// 72行目を修正
if (!appraisals || appraisals.length === 0) {
```

## 検証方法

1. フロントエンドを起動: `cd frontend && npm run dev`
2. HistoryPage (`/history`) にアクセス
3. データがない状態でもエラーが発生しないことを確認
4. 「履歴がありません」の空状態が正常に表示されることを確認
