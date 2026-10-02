'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../kiosk.module.css';
import { KioskHeader } from '../../KioskHeader';

type History = {
  id: string;
  action: string;
  stageName: string | null;
  remarks: string | null;
  actorUsername: string | null;
  timestamp: string;
};

type FileRecord = {
  id: string;
  smsRefNo: string;
  fileId: string;
  description: string;
  proposalValue: string;
  headCodeCode: string;
  headCodeName: string;
  departmentName: string;
  procurementModeName: string;
  status: string;
  authorityName: string;
  currentStageName: string | null;
  dateSubmission: string;
};

const date = (x: string) =>
  new Date(x).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const money = (x: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(x));

export default function Detail({ params }: { params: { fileId: string } }) {
  const router = useRouter();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/kiosk/files');
    }
  };

  useEffect(() => {
    fetch(`/api/files/${params.fileId}`)
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        setFile(d.file);
        setHistory(d.histories ?? []);
      })
      .catch(() => setError('Unable to retrieve this file.'))
      .finally(() => setLoading(false));
  }, [params.fileId]);

  if (loading)
    return (
      <main className={styles.shell}>
        <KioskHeader back="/kiosk/files" />
        <div className={styles.content}>
          <div className={styles.skeleton} style={{ height: 250 }} />
        </div>
      </main>
    );

  if (error || !file)
    return (
      <main className={styles.shell}>
        <KioskHeader back="/kiosk/files" />
        <div className={styles.content}>
          <div className={styles.alert} role="alert">
            {error || 'File not found.'}
          </div>
          <button className={styles.secondary} style={{ marginTop: 20 }} onClick={handleBack}>
            Back to search
          </button>
        </div>
      </main>
    );

  const cells = [
    ['Case description', file.description],
    ['Proposal value', money(file.proposalValue)],
    ['File number', file.fileId || file.smsRefNo],
    ['SMS reference', file.smsRefNo],
    ['Head code', `${file.headCodeCode} — ${file.headCodeName}`],
    ['Department', file.departmentName],
    ['Procurement mode', file.procurementModeName],
    ['Authority', file.authorityName || '—'],
    ['Submission date', date(file.dateSubmission)],
  ];

  return (
    <main className={styles.shell}>
      <KioskHeader department={file.departmentName} back="/kiosk/files" />
      <div className={styles.content}>
        <button className={styles.secondary} onClick={handleBack} style={{ cursor: 'pointer' }}>
          ← Back to search
        </button>
        <div className={styles.kicker} style={{ marginTop: 28 }}>
          SMS Reference · {file.smsRefNo}
        </div>
        <h1 className={styles.h1}>File Details</h1>
        <section className={`${styles.panel} ${styles.detailHero}`}>
          <div>
            <div className={styles.kicker}>Current status</div>
            <div className={styles.status}>{file.status}</div>
            <p className={styles.lede} style={{ margin: 8 }}>
              {file.currentStageName || 'Awaiting stage update'}
            </p>
          </div>
          <span className={styles.badge}>{history.length} recorded events</span>
        </section>
        <h2 className={styles.h1} style={{ fontSize: 26, marginTop: 38 }}>
          File Information
        </h2>
        <section className={styles.grid}>
          {cells.map(([l, v]) => (
            <div className={styles.cell} key={l}>
              <div className={styles.cellLabel}>{l}</div>
              <div className={styles.cellValue}>{v}</div>
            </div>
          ))}
        </section>
        <h2 className={styles.h1} style={{ fontSize: 26, marginTop: 38 }}>
          Status History
        </h2>
        <section className={styles.panel}>
          {history.length ? (
            <div className={styles.timeline}>
              {history.map((h) => (
                <article className={styles.event} key={h.id}>
                  <div className={styles.eventTitle}>
                    {h.action}
                    {h.stageName ? ` · ${h.stageName}` : ''}
                  </div>
                  <div className={styles.eventMeta}>
                    {date(h.timestamp)} · {h.actorUsername || 'System record'}
                  </div>
                  {h.remarks && <p>{h.remarks}</p>}
                </article>
              ))}
            </div>
          ) : (
            <div>
              <strong>No status history recorded.</strong>
              <p className={styles.eventMeta}>Updates will appear here when the file progresses.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
