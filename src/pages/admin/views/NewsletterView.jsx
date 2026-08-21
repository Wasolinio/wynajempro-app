import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Download, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import { adminCall, fmtNum, fmtDateTime, downloadCsv } from '../adminApi';

/*
  Newsletter (04) — lista zapisów WRAZ Z DOWODEM ZGODY.

  Eksport zawiera `consent` i `consentVersion` nie dla ozdoby: RODO art. 7 ust. 1 wymaga,
  żeby dało się wykazać, NA CO ktoś się zgodził i w jakim brzmieniu klauzuli. Lista samych
  adresów jest prawnie bezużyteczna — i dokładnie taka była do 2026-08-19, zanim reguła
  przestała przyjmować zapis bez zgody.
*/
export default function NewsletterView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCall('newsletter', {});
      setRows(res.rows);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      // Osobne wywołanie z flagą `export` — eksport danych osobowych ma zostawić
      // w dzienniku inny ślad niż samo obejrzenie listy.
      const res = await adminCall('newsletter', { export: true });
      downloadCsv(
        `newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          ['e-mail', 'data zapisu', 'źródło', 'zgoda', 'wersja klauzuli'],
          ...res.rows.map((r) => [
            r.email,
            r.subscribedAt ? new Date(r.subscribedAt).toISOString() : '',
            r.source || '',
            r.consent ? 'TAK' : 'NIE',
            r.consentVersion || '',
          ]),
        ]
      );
      toast.success(`Wyeksportowano ${res.rows.length} zapisów.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const withoutConsent = rows.filter((r) => !r.consent).length;

  return (
    <>
      <div className="wpa-toolbar">
        <span className="wpd-label">{fmtNum(rows.length)} zapisów</span>
        <div className="wpa-toolbar__spacer" />
        <button className="wpd-btn wpd-btn--sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} /> Odśwież
        </button>
        <button className="wpd-btn wpd-btn--sm wpd-btn--primary" onClick={exportCsv} disabled={rows.length === 0}>
          <Download style={{ width: 14, height: 14 }} /> Eksport CSV
        </button>
      </div>

      {withoutConsent > 0 && (
        <div className="wpd-note wpd-note--danger" style={{ marginBottom: 16 }}>
          <b>{withoutConsent} {withoutConsent === 1 ? 'zapis' : 'zapisów'} bez dowodu zgody.</b> To zapisy
          sprzed 2026-08-19, gdy reguła jeszcze ich nie wymagała. Nie da się dla nich wykazać podstawy
          z art. 7 ust. 1 — przed pierwszą wysyłką trzeba je albo odpytać ponownie, albo usunąć.
        </div>
      )}

      <div className="wpd-panel">
        <table className="wpd-table wpa-table">
          <thead>
            <tr>
              <th>Adres</th>
              <th>Data zapisu</th>
              <th>Źródło</th>
              <th>Zgoda</th>
              <th>Wersja klauzuli</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="wpd-cell-strong">{r.email}</td>
                <td className="wpd-cell-num">{fmtDateTime(r.subscribedAt)}</td>
                <td className="wpd-cell-num">{r.source || '—'}</td>
                <td>
                  {r.consent
                    ? <span className="wpd-tag wpd-tag--green"><ShieldCheck style={{ width: 12, height: 12 }} /> tak</span>
                    : <span className="wpd-tag wpd-tag--cynober"><ShieldX style={{ width: 12, height: 12 }} /> brak</span>}
                </td>
                <td className="wpd-cell-num">{r.consentVersion || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <div className="wpd-empty"><p>Nikt się jeszcze nie zapisał.</p></div>}
        {loading && rows.length === 0 && <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>}
      </div>
    </>
  );
}
