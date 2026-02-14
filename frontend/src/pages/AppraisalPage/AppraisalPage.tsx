/* ═══════════════════════════════════════════════════════════════════════════
   APPRAISAL PAGE
   Main page for image upload and appraisal
   ═══════════════════════════════════════════════════════════════════════════ */

import { useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ImagePicker } from '@/components/features/ImagePicker';
import { AnalysisProgress } from '@/components/features/AnalysisProgress';
import { AppraisalResult } from '@/components/features/AppraisalResult';
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import styles from './AppraisalPage.module.css';

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function AppraisalPage() {
  const { isReady: authReady } = useAutoAuth();
  const {
    isLoading,
    thinkingEvents,
    result,
    error,
    submitImage,
    reset,
  } = useStreamingAnalysis();

  // Handle image selection
  const handleImageSelect = useCallback(
    (base64: string) => {
      submitImage(base64);
    },
    [submitImage]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

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

  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Page Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>商品を査定する</h1>
          <p className={styles.subtitle}>
            商品の画像を選択して、AIに査定を依頼しましょう
          </p>
        </header>

        {/* Image Picker - Show when no result and not loading */}
        {!result && !isLoading && (
          <section className={styles.section}>
            <ImagePicker
              onImageSelect={handleImageSelect}
              disabled={isLoading}
            />
          </section>
        )}

        {/* Analysis Progress - Show during loading or when has events */}
        {(isLoading || thinkingEvents.length > 0) && (
          <section className={styles.section}>
            <AnalysisProgress
              isLoading={isLoading}
              thinkingEvents={thinkingEvents}
            />
          </section>
        )}

        {/* Error Message */}
        {error && (
          <section className={styles.section}>
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <p className={styles.errorText}>{error}</p>
              <button className={styles.retryLink} onClick={handleRetry}>
                もう一度試す
              </button>
            </div>
          </section>
        )}

        {/* Appraisal Result */}
        {result && (
          <section className={styles.section}>
            <AppraisalResult result={result} onRetry={handleRetry} />
          </section>
        )}

        {/* New Appraisal Button - Show after result */}
        {result && (
          <section className={styles.newAppraisalSection}>
            <button className={styles.newAppraisalButton} onClick={handleRetry}>
              <span className={styles.newAppraisalIcon}>📷</span>
              新しい査定を始める
            </button>
          </section>
        )}
      </div>
    </PageLayout>
  );
}

export default AppraisalPage;
