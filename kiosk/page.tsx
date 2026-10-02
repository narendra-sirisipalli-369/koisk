'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import styles from './landing.module.css';
import { LandingHeader, LandingFooter } from './LandingChrome';

const TAGLINE_TEXT = 'YOUR ONE STOP SOLUTION';
const TAGLINE_LETTER_STEP = 0.06;
const TAGLINE_LETTER_DURATION = 0.5;
const TAGLINE_HOLD_AFTER = 3;
const TAGLINE_CYCLE_MS = Math.round(
  ((TAGLINE_TEXT.length - 1) * TAGLINE_LETTER_STEP + TAGLINE_LETTER_DURATION + TAGLINE_HOLD_AFTER) * 1000
);

export default function KioskLandingPage() {
  const router = useRouter();
  const [taglineCycle, setTaglineCycle] = useState(0);

  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setTaglineCycle((c) => c + 1);
    }, TAGLINE_CYCLE_MS);
    return () => clearInterval(taglineInterval);
  }, []);

  useEffect(() => {
    router.prefetch('/kiosk/login');
  }, [router]);

  return (
    <main className={styles.viewport}>
      {/* Subtle Digital Security Grid Watermark */}
      <div className={styles.securityWatermarkGrid} aria-hidden="true" />

      <LandingHeader />

      {/* ==========================================================================
          PRIMARY CONTENT PANEL (HERO CONTAINER: 16PX ROUNDED CORNERS + GLASSMORPHISM)
          ========================================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroPanel}>
          {/* Station Title: Logistics Department */}
          <h2 className={styles.stationTitle}>Logistics Department</h2>

          {/* Tagline / Subheading: YOUR ONE STOP SOLUTION */}
          <p className={styles.tagline} aria-label={TAGLINE_TEXT} key={taglineCycle}>
            {TAGLINE_TEXT.split('').map((char, i) => (
              <span
                key={i}
                className={styles.taglineLetter}
                style={{ animationDelay: `${i * TAGLINE_LETTER_STEP}s` }}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </p>

          {/* Subtle Gold Divider */}
          <div className={styles.goldDivider} aria-hidden="true">
            <div className={styles.goldLineLeft} />
            <div className={styles.goldPip} />
            <div className={styles.goldLineRight} />
          </div>

          {/* Main Title: File Status Management System */}
          <div className={styles.primaryTitleWrap}>
            <h1 className={styles.primaryTitle}>File Status Management System</h1>
          </div>

          {/* Action Button: Maximum Border Radius (Pill Shape) */}
          <div className={styles.ctaWrap}>
            <Link
              href="/kiosk/login"
              className={styles.beginButton}
              aria-label="Touch To Begin"
              role="button"
              tabIndex={0}
              prefetch={true}
            >
              <span>Touch To Begin</span>
              <ChevronRight size={18} strokeWidth={2.5} className={styles.btnChevron} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
