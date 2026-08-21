import React from 'react';
import {
  UserPlus, CreditCard, Clock, Inbox, AlertTriangle, TrendingUp,
  BookOpen, PenLine, CalendarRange, Mail, Users,
} from 'lucide-react';
import { fmtNum, fmtMoney, delta, STATUS_LABEL, STATUS_TONE } from '../adminApi';

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/* Pasek udziału w kolorze statusu, nie w cynobrze: cynober jest w tej identyfikacji
   kolorem uwagi, więc „Trial" i „Aktywna" pomalowane nim czytały się jak alarm. */
const TONE_COLOR = {
  green: 'var(--green)', amber: 'var(--amber)', cynober: 'var(--cynober)',
  granat: 'var(--granat)', muted: 'var(--faint)',
};

/* Etykieta co piąty dzień — 30 podpisów pod słupkami zlewa się w szum. */
const chartLabel = (point, i) => (i % 5 === 0 ? point.date.slice(8) : '');

const Delta = ({ now, prev, unit }) => {
  const d = delta(now, prev);
  if (d === null) {
    return <span className="wpd-stat__sub">brak porównania</span>;
  }
  return (
    <span className={`wpd-stat__delta${d >= 0 ? ' wpd-stat__delta--up' : ''}`}>
      {d >= 0 ? '▲' : '▼'} {Math.abs(d)}% vs {unit}
    </span>
  );
};

/*
  Przegląd (01) — liczby, po które właściciel wchodzi do panelu administratora.
  Kolejność ekranu odpowiada kolejności pytań: ilu ich przybywa → ilu płaci →
  komu kończy się trial → co czeka na odpowiedź → gdzie coś wymaga reakcji.
*/
export default function OverviewView({ data, onGo }) {
  const { registrations, accounts, trials, funnel, revenue, content, messages, newsletter, risks } = data;
  const guests = data.guests || { sessions: 0, staleDocs: 0 };
  const chartMax = Math.max(1, ...registrations.chart.map((p) => p.count));

  const funnelSteps = [
    { name: 'Rejestracje', value: funnel.registered },
    { name: 'Potwierdzony adres', value: funnel.verified },
    { name: 'Uzupełniony profil', value: funnel.profiled },
    { name: 'Wprowadzone dane', value: funnel.withBookings },
    { name: 'Płacące konta', value: funnel.paying, end: true },
  ];

  const riskRows = [
    { key: 'pastDue', label: 'Zaległość w płatności', value: risks.pastDue, tone: 'amber' },
    { key: 'unverifiedOlder7d', label: 'Adres niepotwierdzony ponad 7 dni', value: risks.unverifiedOlder7d, tone: 'amber' },
    { key: 'expiredTrial', label: 'Trial wygasł, konto zostało', value: trials.expired, tone: 'muted' },
    { key: 'scheduledDeletion', label: 'Zaplanowane usunięcie danych', value: risks.scheduledDeletion, tone: 'cynober' },
    { key: 'missingDoc', label: 'Login bez dokumentu w bazie', value: risks.missingDoc, tone: 'cynober' },
    { key: 'missingAuth', label: 'Dokument bez loginu', value: risks.missingAuth, tone: 'cynober' },
    { key: 'staleGuestDocs', label: 'Dokumenty-widma po sesjach gości', value: risks.staleGuestDocs || 0, tone: 'amber' },
    { key: 'retention', label: `Zgłoszenia starsze niż ${risks.retentionMonths} mies.`, value: risks.messagesOverRetention, tone: 'muted' },
  ].filter((r) => r.value > 0);

  const statusRows = Object.keys(accounts.byStatus)
    .map((key) => ({ key, count: accounts.byStatus[key] }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {/* ── Cztery liczby ── */}
      <div className="wpd-stats">
        <div className="wpd-stat wpa-stat--flat">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Rejestracje · 30 dni</p>
            <span className="wpd-stat__ic"><UserPlus /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(registrations.d30)}</div>
          <div className="wpd-stat__foot">
            <Delta now={registrations.d30} prev={registrations.prev30} unit="poprz. 30 dni" />
          </div>
        </div>

        <div className="wpd-stat" role="button" tabIndex={0}
          onClick={() => onGo('users')} onKeyDown={(e) => e.key === 'Enter' && onGo('users')}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Konta płacące</p>
            <span className="wpd-stat__ic"><CreditCard /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(funnel.paying)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">
              {revenue ? `MRR ${fmtMoney(revenue.mrr, revenue.currency)}` : 'MRR — brak danych ze Stripe'}
            </span>
          </div>
        </div>

        <div className="wpd-stat" role="button" tabIndex={0}
          onClick={() => onGo('users')} onKeyDown={(e) => e.key === 'Enter' && onGo('users')}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Trwające triale</p>
            <span className="wpd-stat__ic"><Clock /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(trials.active)}</div>
          <div className="wpd-stat__foot">
            <span className={`wpd-stat__sub${trials.endingIn3 > 0 ? ' wpd-stat__sub--accent' : ''}`}>
              {trials.endingIn3 > 0 ? `${trials.endingIn3} kończy się w 3 dni` : `${trials.endingIn7} kończy się w 7 dni`}
            </span>
          </div>
        </div>

        <div className={`wpd-stat${messages.new > 0 ? ' wpd-stat--dark' : ''}`} role="button" tabIndex={0}
          onClick={() => onGo('messages')} onKeyDown={(e) => e.key === 'Enter' && onGo('messages')}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Zgłoszenia nowe</p>
            <span className="wpd-stat__ic"><Inbox /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(messages.new)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">{messages.last7} w ostatnich 7 dniach</span>
          </div>
        </div>
      </div>

      {/* ── Rejestracje w czasie + lejek ── */}
      <div className="wpd-section wpd-grid-2">
        <div className="wpd-chart wpa-chart30">
          <p className="wpd-chart__title">Rejestracje · ostatnie 30 dni</p>
          <div className="wpd-chart__bars">
            {registrations.chart.map((p, i) => (
              <div className="wpd-chart__col" key={p.date} title={`${p.date}: ${p.count}`}>
                <div className={`wpd-chart__bar${p.count > 0 && p.count === chartMax ? ' wpd-chart__bar--hi' : ''}`}
                  style={{ height: `${Math.max(3, (p.count / chartMax) * 100)}%` }} />
                <span className="wpd-chart__x">{chartLabel(p, i)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wpd-panel">
          <div className="wpd-panel__head">
            <TrendingUp style={{ width: 17, height: 17, color: 'var(--cynober)' }} />
            <h2 className="wpd-h2">Lejek</h2>
            <span className="wpd-label" style={{ marginLeft: 'auto' }}>od rejestracji do płatności</span>
          </div>
          <div style={{ padding: '10px 20px 18px' }}>
            <div className="wpa-funnel">
              {funnelSteps.map((step) => (
                <div className="wpa-funnel__row" key={step.name}>
                  <div className="wpa-funnel__top">
                    <span className="wpa-funnel__name">{step.name}</span>
                    <span className="wpa-funnel__val">
                      {fmtNum(step.value)}<small>{pct(step.value, funnel.registered)}%</small>
                    </span>
                  </div>
                  <div className="wpa-funnel__bar">
                    <div className={`wpa-funnel__fill${step.end ? ' wpa-funnel__fill--end' : ''}`}
                      style={{ width: `${pct(step.value, funnel.registered)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Bez tego zdania „Wprowadzone dane" czyta się jak metryka aktywności,
                a to tylko fakt istnienia choćby jednej rezerwacji. */}
            <p className="wpd-fhint" style={{ marginTop: 12 }}>
              „Wprowadzone dane" = konto ma co najmniej jedną rezerwację. Panel liczy je, nie czyta.
              Lejek liczy wyłącznie konta gospodarzy — anonimowe sesje gości stoją osobno.
            </p>
          </div>
        </div>
      </div>

      {/* ── Statusy + co wymaga uwagi ── */}
      <div className="wpd-section wpd-grid-2">
        <div className="wpd-panel">
          <div className="wpd-panel__head">
            <h2 className="wpd-h2">Statusy kont</h2>
            <span className="wpd-label" style={{ marginLeft: 'auto' }}>{fmtNum(accounts.total)} łącznie</span>
          </div>
          <div className="wpd-list">
            {statusRows.map((row) => (
              <div className="wpd-row" key={row.key}>
                <span className={`wpd-tag wpd-tag--${STATUS_TONE[row.key] || 'muted'}`}>
                  {STATUS_LABEL[row.key] || row.key}
                </span>
                <div className="wpd-row__main">
                  <div className="wpd-bar" style={{ marginTop: 0 }}>
                    <div className="wpd-bar__fill" style={{
                      width: `${pct(row.count, accounts.total)}%`,
                      background: TONE_COLOR[STATUS_TONE[row.key]] || 'var(--faint)',
                    }} />
                  </div>
                </div>
                <span className="wpd-cell-num" style={{ fontWeight: 600 }}>{fmtNum(row.count)}</span>
              </div>
            ))}
            <div className="wpd-row">
              <span className="wpd-tag wpd-tag--muted">Adres</span>
              <div className="wpd-row__main">
                <div className="wpd-row__name" style={{ fontSize: 13.5 }}>
                  {fmtNum(accounts.verified)} potwierdzonych · {fmtNum(accounts.unverified)} nie
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wpd-panel">
          <div className="wpd-panel__head">
            <AlertTriangle style={{ width: 17, height: 17, color: riskRows.length ? 'var(--amber)' : 'var(--faint)' }} />
            <h2 className="wpd-h2">Wymaga uwagi</h2>
            {riskRows.length > 0 && (
              <button className="wpd-alink" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => onGo('health')}>Szczegóły</button>
            )}
          </div>
          <div className="wpd-list">
            {riskRows.map((r) => (
              <div className="wpd-row" key={r.key}>
                <span className={`wpd-tag wpd-tag--${r.tone}`}>{r.value}</span>
                <div className="wpd-row__main">
                  <div className="wpd-row__name" style={{ fontSize: 13.5 }}>{r.label}</div>
                </div>
              </div>
            ))}
            {riskRows.length === 0 && (
              <div className="wpd-empty"><p>Nic nie czeka na reakcję.</p></div>
            )}
          </div>
        </div>
      </div>

      {/* ── Co jest w bazie ── */}
      <div className="wpd-section wpd-stats">
        <div className="wpd-stat wpa-stat--flat">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Rezerwacje w systemie</p>
            <span className="wpd-stat__ic"><CalendarRange /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(content.rentals)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">na {fmtNum(content.accountsWithData)} kontach</span>
          </div>
        </div>
        <div className="wpd-stat wpa-stat--flat">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przewodniki i strony opinii</p>
            <span className="wpd-stat__ic"><BookOpen /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(content.guides)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub"><PenLine style={{ width: 11, height: 11, display: 'inline', verticalAlign: -1 }} /> {fmtNum(content.signatures)} podpisów gości</span>
          </div>
        </div>
        <div className="wpd-stat" role="button" tabIndex={0}
          onClick={() => onGo('newsletter')} onKeyDown={(e) => e.key === 'Enter' && onGo('newsletter')}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Newsletter</p>
            <span className="wpd-stat__ic"><Mail /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(newsletter.total)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">+{fmtNum(newsletter.d30)} w 30 dni</span>
          </div>
        </div>

        {/* Sesje gości to NIE konta — stoją osobno właśnie dlatego. Każde otwarcie
            przewodnika loguje odwiedzającego anonimowo (reguły wymagają `request.auth`
            do odczytu sekretów i zapisania podpisu), więc w Firebase Auth powstaje
            użytkownik bez adresu. Wliczone do kont zafałszowałyby wszystko. */}
        <div className="wpd-stat wpa-stat--flat">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Sesje gości</p>
            <span className="wpd-stat__ic"><Users /></span>
          </div>
          <div className="wpd-stat__value">{fmtNum(guests.sessions)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">otwarcia przewodników · nie konta</span>
          </div>
        </div>
      </div>

      {revenue && (
        <p className="wpd-fhint" style={{ marginTop: 18 }}>
          MRR liczone jako {fmtNum(revenue.activeSubs)} × {fmtMoney(revenue.price, revenue.currency)}
          {revenue.interval === 'year' ? ' rocznie ÷ 12' : ' miesięcznie'} (cena pobrana ze Stripe).
          Konta z dostępem nadanym ręcznie też mają status „aktywna", więc nie każde z nich płaci.
        </p>
      )}
      {data.truncated && (
        <div className="wpd-note wpd-note--danger" style={{ marginTop: 18 }}>
          Skan danych sięgnął limitu bezpieczeństwa — liczby rezerwacji są zaniżone.
          Trzeba przejść na liczniki agregujące (`count()` per konto).
        </div>
      )}
      <p className="wpd-fhint" style={{ marginTop: 10 }}>
        Ostatnie odświeżenie: {new Date(data.generatedAt).toLocaleTimeString('pl-PL')}
        {data.cached ? ' · z pamięci podręcznej funkcji (do 60 s)' : ''}
        {' · '}Rejestracje liczone dla strefy Europe/Warsaw.
      </p>
    </>
  );
}
