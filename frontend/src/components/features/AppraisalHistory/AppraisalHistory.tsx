/* ═══════════════════════════════════════════════════════════════════════════
   APPRAISAL HISTORY COMPONENT
   Lists past appraisals with summary info
   ═══════════════════════════════════════════════════════════════════════════ */

import { OrnateFrame } from '@/components/common/OrnateFrame';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { AppraisalDocument } from '@/types/api';
import styles from './AppraisalHistory.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface AppraisalHistoryProps {
  appraisals: AppraisalDocument[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onSelect?: (appraisal: AppraisalDocument) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function AppraisalHistory({
  appraisals,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh,
  onSelect,
  className = '',
}: AppraisalHistoryProps) {
  // Loading state
  if (loading && (!appraisals || appraisals.length === 0)) {
    return (
      <div className={`${styles.container} ${className}`}>
        <OrnateFrame variant="dark" size="lg">
          <div className={styles.loadingState}>
            <LoadingSpinner size="md" message="履歴を読み込み中..." />
          </div>
        </OrnateFrame>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <OrnateFrame variant="dark" size="lg">
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorMessage}>履歴の読み込みに失敗しました</p>
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              再試行
            </Button>
          </div>
        </OrnateFrame>
      </div>
    );
  }

  // Empty state
  if (!appraisals || appraisals.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <OrnateFrame variant="dark" size="lg">
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📜</span>
            <h3 className={styles.emptyTitle}>履歴がありません</h3>
            <p className={styles.emptyText}>
              査定を行うと、ここに履歴が表示されます
            </p>
          </div>
        </OrnateFrame>
      </div>
    );
  }

  // List state
  return (
    <div className={`${styles.container} ${className}`}>
      <OrnateFrame variant="dark" size="md">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}>📋</span>
            査定履歴
          </h2>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            更新
          </Button>
        </div>

        {/* List */}
        <ul className={styles.list}>
          {appraisals.map((appraisal) => (
            <AppraisalHistoryItem
              key={appraisal.id}
              appraisal={appraisal}
              onClick={() => onSelect?.(appraisal)}
            />
          ))}
        </ul>

        {/* Load More */}
        {hasMore && (
          <div className={styles.loadMore}>
            <Button
              variant="secondary"
              size="sm"
              onClick={onLoadMore}
              loading={loading}
            >
              もっと見る
            </Button>
          </div>
        )}
      </OrnateFrame>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HISTORY ITEM
// ─────────────────────────────────────────────────────────────────────────

interface AppraisalHistoryItemProps {
  appraisal: AppraisalDocument;
  onClick?: () => void;
}

function AppraisalHistoryItem({ appraisal, onClick }: AppraisalHistoryItemProps) {
  const displayName =
    appraisal.search?.identified_product ||
    appraisal.vision?.item_name ||
    '不明な商品';

  const priceDisplay = getPriceDisplay(appraisal);
  const dateStr = formatDate(appraisal.created_at);
  const statusIcon = getStatusIcon(appraisal);

  return (
    <li className={styles.item}>
      <button className={styles.itemButton} onClick={onClick}>
        {/* Thumbnail placeholder */}
        <div className={styles.thumbnail}>
          <span className={styles.thumbnailIcon}>{statusIcon}</span>
        </div>

        {/* Info */}
        <div className={styles.itemInfo}>
          <span className={styles.itemName}>{displayName}</span>
          <span className={styles.itemDate}>{dateStr}</span>
        </div>

        {/* Price */}
        <div className={styles.itemPrice}>{priceDisplay}</div>
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function getPriceDisplay(appraisal: AppraisalDocument): string {
  if (appraisal.price) {
    return `¥${appraisal.price.min_price.toLocaleString()}〜`;
  }

  if (appraisal.search?.classification === 'unique_item') {
    return '一点物';
  }

  if (appraisal.vision?.category_type === 'prohibited') {
    return '対象外';
  }

  return '査定不可';
}

function getStatusIcon(appraisal: AppraisalDocument): string {
  if (appraisal.price) {
    return '💎';
  }

  if (appraisal.search?.classification === 'unique_item') {
    return '🏺';
  }

  if (appraisal.vision?.category_type === 'prohibited') {
    return '⛔';
  }

  return '❓';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default AppraisalHistory;
