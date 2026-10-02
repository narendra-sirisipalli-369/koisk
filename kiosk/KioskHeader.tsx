'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './kiosk.module.css';
import { ISTClock, KioskSession } from './KioskSession';

export function KioskHeader({ department, back }: { department?: string; back?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (back) {
      router.push(back);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/kiosk');
    }
  };

  const handleBrandClick = () => {
    router.push('/kiosk');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          {back && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className={styles.headerBackBtn}
            >
              ←
            </button>
          )}
          <div
            onClick={handleBrandClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBrandClick(); }}
            aria-label="INS DEGA Home"
          >
            <Image
              className={styles.logo}
              src="/dega_transparent.png"
              alt="INS DEGA"
              width={54}
              height={54}
              style={{ objectFit: 'contain' }}
            />
            <span className={styles.brandName}>INS DEGA</span>
          </div>
        </div>
        <div className={styles.headerTitle}>
          File Status Management System
          <br />
          <small>{department || 'Logistics Department'}</small>
        </div>
        <div className={styles.meta}>
          <span className={styles.dot} />
          System Ready
          <br />
          <ISTClock />
        </div>
      </header>
      <KioskSession />
    </>
  );
}
