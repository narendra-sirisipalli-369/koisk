'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { KioskHeader } from '../KioskHeader';
import styles from '../kiosk.module.css';

/**
 * Kiosk Home / Search Page — Screen 2
 * Per FSMS_Report.pdf: Displays department (top-left), IST clock (top-right),
 * Date range picker + SMS Reference No search field.
 */

import { Suspense } from 'react';

function KioskHomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId') ?? '';
  const department = searchParams.get('departmentName') ?? 'Department';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState('');

  const fromRowRef = useRef<HTMLDivElement | null>(null);
  const toRowRef = useRef<HTMLDivElement | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromMonth, setFromMonth] = useState(() => new Date());
  const [toMonth, setToMonth] = useState(() => new Date());
  const [yearOptions] = useState(() => {
    const now = new Date().getFullYear();
    const start = now - 10;
    return Array.from({ length: 21 }, (_, i) => start + i);
  });

  const togglePicker = (which: 'from' | 'to') => {
    const open = which === 'from' ? fromOpen : toOpen;
    const setOpen = which === 'from' ? setFromOpen : setToOpen;
    setOpen(!open);
  };

  const fmtDateForDisplay = (iso: string) => {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${m} / ${d} / ${y}`;
  };

  const parseIsoDate = (iso: string) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const toIsoDate = (date: Date) => {
    const yyyy = `${date.getFullYear()}`;
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMonthMatrix = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    return { year, month, cells };
  };

  useEffect(() => {
    if (fromOpen) {
      const selected = parseIsoDate(fromDate);
      setFromMonth(selected ?? new Date());
    }
  }, [fromOpen, fromDate]);

  useEffect(() => {
    if (toOpen) {
      const selected = parseIsoDate(toDate);
      setToMonth(selected ?? new Date());
    }
  }, [toOpen, toDate]);

  useEffect(() => {
    if (!fromOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!fromRowRef.current?.contains(event.target as Node)) {
        setFromOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [fromOpen]);

  useEffect(() => {
    if (!toOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!toRowRef.current?.contains(event.target as Node)) {
        setToOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [toOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setError('From Date cannot be later than To Date.');
      return;
    }
    setError('');
    const params = new URLSearchParams({ departmentId, departmentName: department });
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    router.push(`/kiosk/files?${params.toString()}`);
  };

  return (
    <main className={styles.shell}>
      <KioskHeader department={department} />
      <div className={styles.content}>
        {/* Search Card */}
        <div className={styles.panel} style={{ width: '100%', maxWidth: 880, margin: '0 auto', borderTop: '4px solid #c89b2b' }}>
          <div style={{
            border: '1px solid rgba(200, 155, 43, 0.45)', borderRadius: 9999, background: 'rgba(200, 155, 43, 0.14)',
            padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem',
          }}>
            <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#081e3d' }}>
              Department:
            </div>
            <div style={{ color: '#081e3d', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Arial, Helvetica, sans-serif' }}>
              {department}
            </div>
          </div>
          <h1 className={styles.h1} style={{ fontSize: '1.4rem', margin: '0 0 4px' }}>Date Range Search</h1>
          <p className={styles.lede} style={{ marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            Select file submission dates to query operational records.
          </p>

          {error && (
            <div className={styles.alert} style={{ marginBottom: '1.2rem' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="from-date-display" className={styles.label}>From Date</label>
                <div className="date-row" ref={fromRowRef}>
                  <input
                    id="from-date-display"
                    type="text"
                    className="date-field"
                    value={fromDate ? fmtDateForDisplay(fromDate) : ''}
                    placeholder="mm / dd / yyyy"
                    readOnly
                    onClick={() => togglePicker('from')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePicker('from');
                      }
                    }}
                    style={{ minHeight: 48, borderRadius: 10, width: '100%' }}
                  />
                  <button
                    type="button"
                    className="date-toggle"
                    aria-label={fromOpen ? 'Close calendar' : 'Open calendar'}
                    aria-pressed={fromOpen}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => togglePicker('from')}
                  >
                    <Calendar size={18} aria-hidden="true" />
                  </button>
                  {fromOpen && (
                    <div className="calendar-popover" role="dialog" aria-label="Choose From Date">
                      <div className="calendar-header">
                        <button
                          type="button"
                          className="calendar-nav"
                          aria-label="Previous month"
                          onClick={() => setFromMonth(new Date(fromMonth.getFullYear(), fromMonth.getMonth() - 1, 1))}
                        >
                          <ChevronLeft size={16} />
                        </button>
                      <div className="calendar-title">
                        {fromMonth.toLocaleString('en-US', { month: 'long' })}
                      </div>
                      <select
                        className="calendar-year"
                        aria-label="Select year"
                        value={fromMonth.getFullYear()}
                        onChange={e => {
                          const year = Number(e.target.value);
                          setFromMonth(new Date(year, fromMonth.getMonth(), 1));
                        }}
                      >
                        {yearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="calendar-nav"
                          aria-label="Next month"
                          onClick={() => setFromMonth(new Date(fromMonth.getFullYear(), fromMonth.getMonth() + 1, 1))}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="calendar-week">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className="calendar-grid">
                        {getMonthMatrix(fromMonth).cells.map((day, idx) => {
                          if (!day) return <span key={`f-${idx}`} className="calendar-day is-empty" />;
                          const date = new Date(fromMonth.getFullYear(), fromMonth.getMonth(), day);
                          const iso = toIsoDate(date);
                          const selected = iso === fromDate;
                          return (
                            <button
                              type="button"
                              key={`f-${idx}`}
                              className={`calendar-day${selected ? ' is-selected' : ''}`}
                              onClick={() => {
                                setFromDate(iso);
                                setFromOpen(false);
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="to-date-display" className={styles.label}>To Date</label>
                <div className="date-row" ref={toRowRef}>
                  <input
                    id="to-date-display"
                    type="text"
                    className="date-field"
                    value={toDate ? fmtDateForDisplay(toDate) : ''}
                    placeholder="mm / dd / yyyy"
                    readOnly
                    onClick={() => togglePicker('to')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePicker('to');
                      }
                    }}
                    style={{ minHeight: 48, borderRadius: 10, width: '100%' }}
                  />
                  <button
                    type="button"
                    className="date-toggle"
                    aria-label={toOpen ? 'Close calendar' : 'Open calendar'}
                    aria-pressed={toOpen}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => togglePicker('to')}
                  >
                    <Calendar size={18} aria-hidden="true" />
                  </button>
                  {toOpen && (
                    <div className="calendar-popover" role="dialog" aria-label="Choose To Date">
                      <div className="calendar-header">
                        <button
                          type="button"
                          className="calendar-nav"
                          aria-label="Previous month"
                          onClick={() => setToMonth(new Date(toMonth.getFullYear(), toMonth.getMonth() - 1, 1))}
                        >
                          <ChevronLeft size={16} />
                        </button>
                      <div className="calendar-title">
                        {toMonth.toLocaleString('en-US', { month: 'long' })}
                      </div>
                      <select
                        className="calendar-year"
                        aria-label="Select year"
                        value={toMonth.getFullYear()}
                        onChange={e => {
                          const year = Number(e.target.value);
                          setToMonth(new Date(year, toMonth.getMonth(), 1));
                        }}
                      >
                        {yearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="calendar-nav"
                          aria-label="Next month"
                          onClick={() => setToMonth(new Date(toMonth.getFullYear(), toMonth.getMonth() + 1, 1))}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="calendar-week">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className="calendar-grid">
                        {getMonthMatrix(toMonth).cells.map((day, idx) => {
                          if (!day) return <span key={`t-${idx}`} className="calendar-day is-empty" />;
                          const date = new Date(toMonth.getFullYear(), toMonth.getMonth(), day);
                          const iso = toIsoDate(date);
                          const selected = iso === toDate;
                          return (
                            <button
                              type="button"
                              key={`t-${idx}`}
                              className={`calendar-day${selected ? ' is-selected' : ''}`}
                              onClick={() => {
                                setToDate(iso);
                                setToOpen(false);
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button type="submit" id="kiosk-search-btn" className={styles.primary} style={{width:'100%'}}>Search Files</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function KioskHomePage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Kiosk Search...</div>}>
      <KioskHomePageInner />
    </Suspense>
  );
}
