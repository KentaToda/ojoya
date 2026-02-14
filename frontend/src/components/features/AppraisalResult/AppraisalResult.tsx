/* ═══════════════════════════════════════════════════════════════════════════
   APPRAISAL RESULT COMPONENT
   Displays appraisal results based on classification type
   ═══════════════════════════════════════════════════════════════════════════ */

import type { AnalyzeResponse } from '@/types/api';
import { MassProductResult } from './MassProductResult';
import { UniqueItemResult } from './UniqueItemResult';
import { UnknownResult } from './UnknownResult';
import { ProhibitedResult } from './ProhibitedResult';
import styles from './AppraisalResult.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface AppraisalResultProps {
  result: AnalyzeResponse;
  onRetry?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function AppraisalResult({
  result,
  onRetry,
  className = '',
}: AppraisalResultProps) {
  const containerClass = `${styles.container} ${className}`;

  switch (result.classification) {
    case 'mass_product':
      return (
        <div className={containerClass}>
          <MassProductResult result={result} />
        </div>
      );

    case 'unique_item':
      return (
        <div className={containerClass}>
          <UniqueItemResult result={result} />
        </div>
      );

    case 'unknown':
      return (
        <div className={containerClass}>
          <UnknownResult result={result} onRetry={onRetry} />
        </div>
      );

    case 'prohibited':
      return (
        <div className={containerClass}>
          <ProhibitedResult result={result} onRetry={onRetry} />
        </div>
      );

    default:
      return null;
  }
}

export default AppraisalResult;
