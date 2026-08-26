import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import { adminCall, fmtDateTime } from '../adminApi';

/* Nazwy akcji na polski — dziennik czyta człowiek, nie parser. */
const ACTION_LABEL = {
  'user.read.level1': 'Podgląd konta (poziom 1)',
  'user.read.level2': 'Podgląd ustawień (poziom 2)',
  'user.read.level2.taxId': 'Odsłonięcie identyfikatora podatkowego',
  'access.trial': 'Przedłużenie trialu',
  'access.active': 'Nadanie dostępu',
  'access.revoke': 'Odebranie dostępu',
  'messages.read': 'Odczyt zgłoszeń',
  'message.update': 'Zmiana zgłoszenia',
  'newsletter.read': 'Podgląd newslettera',
  'newsletter.export': 'Eksport newslettera',
  'retention.cleanup': 'Automatyczne kasowanie po retencji',
};
const TONE = {
  'user.read.level2.taxId': 'cynober',
  'access.active': 'green',
  'access.revoke': 'cynober',
  'access.trial': 'granat',
  'newsletter.export': 'amber',
};

const summarize = (details) => {
  if (!details || typeof details !== 'object') return '';
  return Object.keys(details)
    .filter((k) => details[k] !== null && details[k] !== undefined && details[k] !== false)
    .map((k) => `${k}: ${details[k]}`)
    .join(' · ');
};

/*
  Dziennik (06) — kto, kiedy i po co sięgnął po dane.

  Wpisy powstają wyłącznie po stronie funkcji (Admin SDK), a `admin_audit` jest w regułach
  zamknięte dla każdego klienta. To nie jest ozdoba compliance: przy stopniowanym dostępie
  do danych osobowych jedynym dowodem, że zakres faktycznie był zawężany, jest zapis, którego
  nie da się ominąć z przeglądarki.
*/
export default function AuditView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCall('audit', { limit: 200 });
      setRows(res.rows);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="wpa-toolbar">
        <span className="wpd-label">ostatnie {rows.length} wpisów</span>
        <div className="wpa-toolbar__spacer" />
        <button className="wpd-btn wpd-btn--sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} /> Odśwież
        </button>
      </div>

      <div className="wpd-panel">
        <table className="wpd-table wpa-table">
          <thead>
            <tr>
              <th>Kiedy</th>
              <th>Działanie</th>
              <th>Szczegóły</th>
              <th>Administrator</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="wpd-cell-num" style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(r.at)}</td>
                <td>
                  <span className={`wpd-tag wpd-tag--${TONE[r.action] || 'muted'}`}>
                    {ACTION_LABEL[r.action] || r.action}
                  </span>
                </td>
                <td className="wpd-cell-sub" style={{ marginTop: 0 }}>{summarize(r.details)}</td>
                <td className="wpd-cell-num">{r.adminUid ? (r.adminUid.length > 8 ? `${r.adminUid.slice(0, 8)}…` : r.adminUid) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <div className="wpd-empty"><p>Dziennik jest pusty.</p></div>}
        {loading && rows.length === 0 && <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>}
      </div>
    </>
  );
}
