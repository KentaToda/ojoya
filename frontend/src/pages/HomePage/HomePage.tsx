/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE
   Landing page with hero section and call to action
   ═══════════════════════════════════════════════════════════════════════════ */

import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { OrnateFrame } from '@/components/common/OrnateFrame';
import { Button } from '@/components/common/Button';
import styles from './HomePage.module.css';

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <OrnateFrame variant="dark" size="lg" glow>
            <div className={styles.heroContent}>
              {/* Gem Icon */}
              <div className={styles.gemContainer}>
                <GemIcon />
              </div>

              {/* Title */}
              <h1 className={styles.title}>
                <span className={styles.titleMain}>Ojoya</span>
                <span className={styles.titleSub}>オホヤ</span>
              </h1>

              {/* Tagline */}
              <p className={styles.tagline}>
                AIの眼で隠れた宝石を見つけ出す
              </p>

              {/* Description */}
              <p className={styles.description}>
                写真をアップロードするだけで、AIエージェントが商品を特定し、
                <br />
                市場価格を調査して価値を査定します。
              </p>

              {/* CTA Button */}
              <div className={styles.cta}>
                <Link to="/appraisal">
                  <Button variant="primary" size="lg" icon={<SearchIcon />}>
                    査定を始める
                  </Button>
                </Link>
              </div>
            </div>
          </OrnateFrame>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featureGrid}>
            {/* Feature 1 */}
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📷</span>
              <h3 className={styles.featureTitle}>撮影するだけ</h3>
              <p className={styles.featureText}>
                商品を撮影するだけで査定開始。
                特別な知識は不要です。
              </p>
            </div>

            {/* Feature 2 */}
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🤖</span>
              <h3 className={styles.featureTitle}>AIが自動判定</h3>
              <p className={styles.featureText}>
                最新のAIが商品を特定し、
                市場相場を自動で調査します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💰</span>
              <h3 className={styles.featureTitle}>価格帯を提示</h3>
              <p className={styles.featureText}>
                中古市場での相場価格を
                レンジで分かりやすく表示。
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p className={styles.disclaimer}>
          ※本サービスはAIによる推定値を提供するものであり、実際の取引価格を保証するものではありません。
        </p>
      </div>
    </PageLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────

function GemIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={styles.gem}>
      <defs>
        <linearGradient id="heroGemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-gold-light)" />
          <stop offset="50%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-gold-dark)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="40,5 70,30 60,75 20,75 10,30"
        fill="url(#heroGemGradient)"
        stroke="var(--color-gold-light)"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <polygon
        points="40,5 10,30 20,75 40,60"
        fill="var(--color-gold)"
        opacity="0.4"
      />
      <polygon
        points="40,5 40,60 60,75 70,30"
        fill="var(--color-gold-dark)"
        opacity="0.6"
      />
      {/* Shine */}
      <ellipse cx="25" cy="25" rx="6" ry="3" fill="white" opacity="0.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default HomePage;
