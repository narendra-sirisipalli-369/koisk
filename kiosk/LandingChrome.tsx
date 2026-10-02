'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './landing.module.css';

export function LandingHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerScene} aria-label="Eastern Naval Command Maritime Header">
        <div className={styles.headerGrid}>
          <div className={styles.crestWrapperLeft}>
            <Image
              src="/enc_transparent.png"
              alt="Eastern Naval Command Insignia"
              width={88}
              height={88}
              priority
              className={styles.emblemLeft}
            />
          </div>

          <div className={styles.headerCenter}>
            <div className={styles.headerGlass}>
              <h2 className={styles.headerTitleNavy}>INS DEGA</h2>
            </div>
          </div>

          <div className={styles.crestWrapperRight}>
            <Image
              src="/dega_transparent.png"
              alt="INS DEGA Crest"
              width={98}
              height={98}
              priority
              className={styles.emblemRight}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setCurrentTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerLeft}>
          शं नो वरुणः • SHAM NO VARUNAH
        </div>

        <div className={styles.footerRight}>
          <span className={styles.liveDot} aria-hidden="true" />
          <span className={styles.istTime}>
            {mounted ? `${currentTime} IST` : 'SYNCHRONIZING...'}
          </span>
        </div>
      </div>
    </footer>
  );
}
