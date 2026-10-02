'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../kiosk.module.css';
import { KioskHeader } from '../KioskHeader';

type FileResult = {
  id: string;
  fileId: string;
  smsRefNo: string;
  description: string;
  dateSubmission: string;
  status: string;
  currentStageName: string | null;
  authorityName: string;
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

function Files() {
  const router = useRouter();
  const q = useSearchParams();
  const departmentId = q.get('departmentId') ?? '';
  const departmentName = q.get('departmentName') ?? 'Department';
  const [files, setFiles] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ date: '', description: '', fileNo: '' });

  useEffect(() => {
    const p = new URLSearchParams();
    if (departmentId) p.set('departmentId', departmentId);
    if (filters.date) p.set('date', filters.date);
    if (filters.description.trim()) p.set('q', filters.description.trim());
    if (filters.fileNo.trim()) p.set('fileNo', filters.fileNo.trim());
    setLoading(true);
    setError('');
    fetch(`/api/kiosk/search?${p}`)
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => setFiles(Array.isArray(d.files) ? d.files : []))
      .catch(() => setError('Unable to fetch files. Please try again.'))
      .finally(() => setLoading(false));
  }, [filters, departmentId]);

  const open = (id: string) =>
    router.push(`/kiosk/file/${id}?${new URLSearchParams({ departmentId, departmentName })}`);

  return (
    <main className={styles.shell}>
      <KioskHeader department={departmentName} back="/kiosk/login" />
      <div className={styles.content}>
        <div className={styles.kicker}>Operational workspace</div>
        <h1 className={styles.h1}>Department Files</h1>
        <p className={styles.lede}>Locate and review submitted department files.</p>
        <section className={styles.panel} style={{ marginBottom: 24 }}>
          <div className={styles.searchGrid}>
            <label className={styles.label}>
              Submission date
              <input
                className={styles.input}
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((x) => ({ ...x, date: e.target.value }))}
              />
            </label>
            <label className={styles.label}>
              Description
              <input
                className={styles.input}
                type="search"
                placeholder="Search case description"
                value={filters.description}
                onChange={(e) => setFilters((x) => ({ ...x, description: e.target.value }))}
              />
            </label>
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => setFilters({ date: '', description: '', fileNo: '' })}
                style={{ cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </section>
        {error && (
          <div className={styles.alert} role="alert" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {[
                  'Serial',
                  'Case Description',
                  'Submission Date',
                  'File No',
                  'Authority',
                  'Current Stage',
                  'Action',
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className={styles.skeleton} />
                    </td>
                  </tr>
                ))}
              {!loading && !files.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 64 }}>
                    <strong>No files found</strong>
                    <br />
                    <span className={styles.eventMeta}>
                      Adjust the filters or check the selected department.
                    </span>
                  </td>
                </tr>
              )}
              {files.map((f, i) => (
                <tr key={f.id} onClick={() => open(f.fileId)} style={{ cursor: 'pointer' }}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{f.description}</strong>
                  </td>
                  <td>{fmt(f.dateSubmission)}</td>
                  <td className={styles.mono}>{f.smsRefNo}</td>
                  <td>{f.authorityName || '—'}</td>
                  <td>
                    <span className={styles.badge}>{f.currentStageName ?? f.status ?? 'Completed'}</span>
                  </td>
                  <td>
                    <button
                      className={styles.primary}
                      style={{ minHeight: 44, padding: '0 16px', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        open(f.fileId);
                      }}
                    >
                      View file
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default function KioskFilesPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.shell}>
          <div className={styles.content}>Loading operational workspace…</div>
        </main>
      }
    >
      <Files />
    </Suspense>
  );
}
