import React, { useState } from 'react';
import { Lock, Clock, AlertTriangle } from 'lucide-react';
import { BrandStyles } from '../styles/brand';

function PriceCard({ plan, name, badge, price, unit, note, active, isCheckoutLoading, onSubscribe }) {
  return (
    <div className="wpb-card" style={{ padding: 18, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, borderColor: active ? 'var(--ink)' : 'var(--hairline)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="wpb-label" style={{ margin: 0 }}>{name}</span>
          {active && <span className="wpb-tag" style={{ color: 'var(--cynober)', borderColor: '#EBD3CB', background: 'var(--tint-cynober)' }}>{badge}</span>}
        </div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 24 }}>
          {price} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--faint)' }}>{unit}</span>
        </p>
        <p className="wpb-meta" style={{ margin: '4px 0 0' }}>{note}</p>
      </div>
      <button onClick={() => onSubscribe(plan)} disabled={isCheckoutLoading}
        className="wpb-btn wpb-btn--primary wpb-btn--block" style={{ height: 40, fontSize: 13 }}>
        {isCheckoutLoading ? <span className="wpb-spin" style={{ width: 16, height: 16 }} /> : 'Aktywuj i odzyskaj dane'}
      </button>
    </div>
  );
}

/**
 * Ekran blokady dostępu (paywall) — identyfikacja WynajemPRO v2.
 * Wyświetlany gdy trial wygasł, subskrypcja jest anulowana lub zaległa. Logika bez zmian.
 */
export default function PaywallScreen({
  accountStatus, scheduledDeletionAt, onSubscribe, isCheckoutLoading,
  onManageSubscription, isBillingPortalLoading, onLogout,
}) {
  const [billingInterval, setBillingInterval] = useState('monthly');

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const diffDays = Math.ceil((targetDate.getTime() - new Date().getTime()) / 86400000);
    return diffDays > 0 ? diffDays : 0;
  };
  const daysRemaining = scheduledDeletionAt ? getDaysRemaining(scheduledDeletionAt) : 0;

  let title = 'Koniec okresu próbnego';
  let desc = 'Twój darmowy 14-dniowy dostęp dobiegł końca. Odblokuj pełen panel zarządzania rezerwacjami, integracje z kalendarzami i automatyczne raporty księgowe.';
  let Icon = Lock;
  let showBanner = false;

  if (accountStatus === 'canceled') {
    title = 'Subskrypcja wygasła';
    desc = 'Dostęp do panelu został zablokowany, ponieważ Twoja subskrypcja wygasła. Twoje dane biznesowe zostały zamrożone i są bezpieczne.';
    Icon = Clock;
    showBanner = true;
  } else if (accountStatus === 'past_due') {
    title = 'Zaległa płatność';
    desc = 'Nie mogliśmy automatycznie odnowić subskrypcji — prawdopodobnie problem z kartą. Zaktualizuj dane płatności w panelu Stripe, aby przywrócić dostęp.';
    Icon = AlertTriangle;
  }

  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center">
        <div className="wpb-panel wpb-panel--wide" style={{ textAlign: 'center', maxHeight: '95vh', overflowY: 'auto' }}>
          <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><Icon /></span>
          <h2 className="wpb-h2" style={{ marginBottom: 8 }}>{title}</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', fontSize: 14, margin: '0 auto 22px', maxWidth: '46ch' }}>{desc}</p>

          {showBanner && scheduledDeletionAt && (
            <div className="wpb-note wpb-note--err" style={{ marginBottom: 20, textAlign: 'left' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <AlertTriangle style={{ width: 15, height: 15 }} /> Planowana kasacja danych
              </strong>
              Wszystkie rezerwacje, ustawienia i dane klientów zostaną trwale usunięte dnia <strong>{scheduledDeletionAt.toLocaleDateString('pl-PL')}</strong>.
              Pozostało: {daysRemaining} {daysRemaining === 1 ? 'dzień' : 'dni'}.
            </div>
          )}

          {accountStatus === 'past_due' && (
            <div className="wpb-note wpb-note--err" style={{ marginBottom: 20, textAlign: 'left' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <AlertTriangle style={{ width: 15, height: 15 }} /> Zaległość w płatności
              </strong>
              Karta odrzuciła płatność za kolejny cykl. Zaktualizuj kartę w panelu Stripe, aby odzyskać pełen dostęp.
            </div>
          )}

          {/* Przełącznik okresu */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ display: 'inline-flex', gap: 3, background: 'var(--inner)', border: '1px solid var(--hairline)', borderRadius: 3, padding: 3 }}>
              {[['monthly', 'Miesięcznie'], ['yearly', 'Rocznie · −17%']].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => setBillingInterval(val)}
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 2,
                    background: billingInterval === val ? 'var(--ink)' : 'transparent', color: billingInterval === val ? '#fff' : 'var(--muted)' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Pakiety */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <PriceCard plan="monthly" name="Pakiet miesięczny" badge="Wybór" price="29,99" unit="zł / msc" note="Elastyczna subskrypcja."
              active={billingInterval === 'monthly'} isCheckoutLoading={isCheckoutLoading} onSubscribe={onSubscribe} />
            <PriceCard plan="yearly" name="Pakiet roczny" badge="Zalecany"
              price={billingInterval === 'monthly' ? '24,99' : '299,90'}
              unit={billingInterval === 'monthly' ? 'zł / msc' : 'zł / rok'} note="Dwa miesiące gratis."
              active={billingInterval === 'yearly'} isCheckoutLoading={isCheckoutLoading} onSubscribe={onSubscribe} />
          </div>

          {(accountStatus === 'canceled' || accountStatus === 'past_due') && (
            <button onClick={onManageSubscription} disabled={isBillingPortalLoading}
              className="wpb-btn wpb-btn--block" style={{ height: 40, fontSize: 13 }}>
              {isBillingPortalLoading ? <span className="wpb-spin" style={{ width: 16, height: 16 }} /> : 'Otwórz panel zarządzania'}
            </button>
          )}

          <button onClick={onLogout} className="wpb-link" style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--faint)' }}>
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
}
