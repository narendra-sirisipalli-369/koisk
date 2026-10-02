'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../landing.module.css';
import { LandingHeader, LandingFooter } from '../LandingChrome';

const DEPARTMENT_ID = 'logistics';

export default function KioskLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, departmentId: DEPARTMENT_ID, portal: 'kiosk' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? 'Authentication failed. Check credentials and try again.');
      if (d.role !== 'KIOSK') throw new Error('This portal is for Kiosk users only. Please use Staff Login.');
      router.replace(d.redirectTo ?? `/kiosk/files?departmentId=${encodeURIComponent(DEPARTMENT_ID)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.viewport}>
      {/* Subtle Digital Security Grid Watermark */}
      <div className={styles.securityWatermarkGrid} aria-hidden="true" />

      <LandingHeader />

      <section className={styles.heroSection}>
        <div className={`${styles.heroPanel} ${styles.loginPanel}`}>
          {/* Main Title: Login Details */}
          <div className={styles.primaryTitleWrap}>
            <h1 className={`${styles.primaryTitle} ${styles.loginTitle}`}>Login Details</h1>
          </div>

          <form className={styles.loginForm} onSubmit={submit} autoComplete="off">
            {error && (
              <div className={styles.formAlert} role="alert">
                {error}
              </div>
            )}

            <label className={styles.formLabel}>
              Login ID
              <input
                className={styles.formInput}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter login ID"
                required
              />
            </label>

            <label className={styles.formLabel}>
              Password
              <div className={styles.passwordRow}>
                <input
                  className={styles.formInput}
                  style={{ paddingRight: 52 }}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                  className={styles.passwordToggle}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryPillButton}
                onClick={() => router.push('/kiosk')}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.beginButton}
                disabled={loading}
                style={{ animation: 'none' }}
              >
                <span>{loading ? 'Signing in…' : 'Sign In'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
