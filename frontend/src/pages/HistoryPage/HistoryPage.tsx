/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY PAGE
   Shows appraisal history list
   ═══════════════════════════════════════════════════════════════════════════ */

import { PageLayout } from '@/components/layout/PageLayout';
import { AppraisalHistory } from '@/components/features/AppraisalHistory';
import { useAppraisalHistory } from '@/hooks/useAppraisalHistory';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import styles from './HistoryPage.module.css';

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
          />
        </section>
      </div>
    </PageLayout>
  );
}

export default HistoryPage;
