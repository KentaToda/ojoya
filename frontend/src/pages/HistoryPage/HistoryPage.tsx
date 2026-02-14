/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY PAGE
   Shows appraisal history list with detail view
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppraisalHistory } from '@/components/features/AppraisalHistory';
import { AppraisalResult } from '@/components/features/AppraisalResult';
import { Button } from '@/components/common/Button';
import { useAppraisalHistory } from '@/hooks/useAppraisalHistory';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { AppraisalDocument, AnalyzeResponse } from '@/types/api';
import styles from './HistoryPage.module.css';

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function toAnalyzeResponse(doc: AppraisalDocument): AnalyzeResponse {
  const classification =
    doc.termination_point === 'vision_prohibited'
      ? 'prohibited'
      : doc.termination_point === 'vision_unknown'
        ? 'unknown'
        : doc.search?.classification === 'unique_item'
          ? 'unique_item'
          : 'mass_product';

  return {
    appraisal_id: doc.id,
    item_name: doc.vision?.item_name ?? null,
    identified_product: doc.search?.identified_product ?? null,
    visual_features: doc.vision?.visual_features ?? [],
    classification,
    price: doc.price
      ? {
          min_price: doc.price.min_price,
          max_price: doc.price.max_price,
          currency: doc.price.currency,
          display_message: doc.price.display_message,
        }
      : null,
    confidence: doc.vision
      ? {
          level:
            doc.price?.confidence ??
            doc.search?.confidence ??
            doc.vision.confidence,
          reasoning: doc.search?.reasoning ?? doc.vision.reasoning,
        }
      : null,
    price_factors: doc.price?.price_factors ?? null,
    message: null,
    recommendation: null,
    retry_advice: doc.vision?.retry_advice ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const { isReady: authReady, isAuthenticated } = useAutoAuth();
  const {
    appraisals,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useAppraisalHistory(20);

  const [selectedAppraisal, setSelectedAppraisal] =
    useState<AppraisalDocument | null>(null);

  const handleSelect = useCallback((appraisal: AppraisalDocument) => {
    setSelectedAppraisal(appraisal);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedAppraisal(null);
  }, []);

  // Auth loading state
  if (!authReady) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" message="準備中..." />
        </div>
      </PageLayout>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1 className={styles.title}>査定履歴</h1>
          </header>

          <div className={styles.notAuthState}>
            <span className={styles.notAuthIcon}>🔒</span>
            <p className={styles.notAuthText}>
              履歴を表示するには認証が必要です
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Detail view
  if (selectedAppraisal) {
    const result = toAnalyzeResponse(selectedAppraisal);
    const displayName =
      selectedAppraisal.search?.identified_product ||
      selectedAppraisal.vision?.item_name ||
      '査定結果';

    return (
      <PageLayout>
        <div className={styles.page}>
          {/* Back button */}
          <div className={styles.backSection}>
            <Button variant="secondary" size="sm" onClick={handleBack}>
              ← 一覧に戻る
            </Button>
          </div>

          {/* Detail header */}
          <header className={styles.header}>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>
              {formatDetailDate(selectedAppraisal.created_at)}
            </p>
          </header>

          {/* Product image */}
          {selectedAppraisal.image_url && (
            <section className={styles.detailImageSection}>
              <img
                src={selectedAppraisal.image_url}
                alt={displayName}
                className={styles.detailImage}
              />
            </section>
          )}

          {/* Appraisal result */}
          <section className={styles.section}>
            <AppraisalResult result={result} />
          </section>
        </div>
      </PageLayout>
    );
  }

  // List view
  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Page Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>査定履歴</h1>
          <p className={styles.subtitle}>
            過去の査定結果を確認できます
          </p>
        </header>

        {/* History List */}
        <section className={styles.section}>
          <AppraisalHistory
            appraisals={appraisals}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onRefresh={refresh}
            onSelect={handleSelect}
          />
        </section>
      </div>
    </PageLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function formatDetailDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default HistoryPage;
