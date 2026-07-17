import React, { useMemo, useState } from 'react';
import { Receipt, Percent, Wrench, Repeat, Plus, Edit, Trash2, TrendingUp, PiggyBank, Coins, Landmark, Plug } from 'lucide-react';
import { propHex, channelTone } from '../styles';
import { categoryIcon, sourceIcon } from '../glyphs';
import { useCountUp } from '../useCountUp';
import { db } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import RecurringCostModal from '../modals/RecurringCostModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('pl-PL'); } catch { return '—'; } };
const propNameOf = (p) => (typeof p === 'object' ? p?.name : p) || '';
const uuid = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `rc_${Date.now()}_${Math.random().toString(36).slice(2)}`);
const monthIdx = (ym) => { const [y, m] = (ym || '').split('-').map(Number); return (y || 0) * 12 + ((m || 1) - 1); };
const fmtMonth = (ym) => { if (!ym) return ''; const [y, m] = ym.split('-'); return `${['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][Number(m) - 1] || ''} ${y}`; };

// Kategorie syntetyczne (koszty doklejone do rezerwacji) mają stałe kolory z tokenów;
// kategorie własne (wpisy + koszty stałe) dostają kolor z rotacji, stabilnej między odświeżeniami.
const SYNTH = {
  commission: { name: 'Prowizje portali', color: 'var(--cynober)' },
  tax: { name: 'Podatek i VAT', color: 'var(--amber-ink)' },
  bookingUtil: { name: 'Media w rezerwacjach', color: 'var(--granat)' },
};
const CAT_RAMP = ['var(--green)', '#8A6BA8', 'var(--brick)', 'var(--label)', '#4C7BA0', 'var(--faint)'];
const CHANNEL_HEX = { cynober: 'var(--cynober)', granat: 'var(--granat)', amber: 'var(--amber)', green: 'var(--green)' };
// ikony słupka „Na co poszły pieniądze": syntetyczne kategorie mają stałą ikonę,
// własne dostają ikonę po nazwie (X15 — spójne z listą i ostatnimi kosztami)
const CAT_ICON = { 'Prowizje portali': Percent, 'Podatek i VAT': Landmark, 'Media w rezerwacjach': Plug };
const catBarIcon = (name) => CAT_ICON[name] || categoryIcon(name);

/* Poziomy słupek — ten sam idiom co w Analityce (spójny słownik komponentów). */
function CostBar({ name, dot, Icon, amount, pct, color, shown, delay }) {
  return (
    <div className="wpd-hbar">
      <div className="wpd-hbar__head">
        <span className="wpd-hbar__name">
          {Icon ? <Icon style={{ width: 13, height: 13, color, flex: '0 0 13px' }} /> : dot ? <span className="wpd-dot" style={{ background: dot }} /> : null}
          {name}
        </span>
        <span className="wpd-hbar__val"><b>{fmt(amount)} zł</b> · {pct}%</span>
      </div>
      <div className="wpd-hbar__track">
        <div className="wpd-hbar__fill" style={{ width: `${pct}%`, background: color, transform: shown ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

/*
  Koszty i opłaty (X4, fuzja Finanse+Analityka). „Gdzie i na co poszły pieniądze"
  + rozbudowane śledzenie (partia 2): podział koszty zmienne vs stałe, zysk netto
  i marża, prowizje wg portalu, zysk wg obiektu oraz zarządzanie kosztami stałymi
  (cyklicznymi — kwota miesięczna wpisana raz, liczona w każdym aktywnym miesiącu).
  Model: rezerwacje niosą income/commission/utilities/tax/vat; wpis 'utility' trzyma
  kwotę w polu utilities pod kategorią; koszty stałe żyją w settings/recurringCosts.
*/
export default function CostsView({ rentals, properties, user, categories = [], recurringCosts = [], selectedYear }) {
  const [scope, setScope] = useState('year'); // 'month' | 'year' | 'all'
  const [propFilter, setPropFilter] = useState('all');
  const [editingCost, setEditingCost] = useState(null); // obiekt kosztu | 'new' | null
  const [confirmId, setConfirmId] = useState(null);

  const data = useMemo(() => {
    const now = new Date();
    const nowIdx = now.getFullYear() * 12 + now.getMonth();
    const curMonth = now.getMonth();
    const selY = Number(selectedYear);

    const inScope = (r) => {
      if (propFilter !== 'all' && propNameOf(r.property) !== propFilter) return false;
      if (!r.date) return scope === 'all';
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (scope === 'all') return true;
      if (d.getFullYear() !== selY) return false;
      if (scope === 'month') return d.getMonth() === curMonth;
      return true;
    };

    // aktywne miesiące kosztu stałego w bieżącym zakresie czasowym (bez filtra obiektu)
    const monthsInScope = (c) => {
      const start = monthIdx(c.startMonth);
      const end = c.endMonth ? monthIdx(c.endMonth) : Infinity;
      let wStart, wEnd;
      // koszty stałe liczymy jako PONIESIONE do dziś — nie projektujemy niezapłaconych
      // przyszłych miesięcy (uczciwe śledzenie zysku); rok bieżący = do bieżącego miesiąca
      if (scope === 'month') { wStart = selY * 12 + curMonth; wEnd = wStart; }
      else if (scope === 'year') { wStart = selY * 12; wEnd = Math.min(selY * 12 + 11, nowIdx); }
      else { wStart = start; wEnd = nowIdx; } // wszystko: od startu kosztu do dziś
      return Math.max(0, Math.min(wEnd, end) - Math.max(wStart, start) + 1);
    };

    const cats = {};
    const byPropCost = {};
    const incomeByProp = {};
    const portal = {};
    const entries = [];
    let commission = 0, tax = 0, bookingUtil = 0, standalone = 0, income = 0;

    const addCat = (key, name, color, amount) => {
      if (amount <= 0) return;
      if (!cats[key]) cats[key] = { name, color, amount: 0 };
      cats[key].amount += amount;
    };
    const addPropCost = (name, amount) => { if (!name || amount <= 0) return; byPropCost[name] = (byPropCost[name] || 0) + amount; };

    rentals.forEach((r) => {
      if (!inScope(r)) return;
      const pName = propNameOf(r.property);
      if (r.type === 'booking') {
        const inc = Number(r.income) || 0;
        const com = Number(r.commission) || 0;
        const txv = (Number(r.tax) || 0) + (Number(r.vat) || 0);
        const util = Number(r.utilities) || 0;
        income += inc; commission += com; tax += txv; bookingUtil += util;
        if (inc > 0) incomeByProp[pName] = (incomeByProp[pName] || 0) + inc;
        addCat('commission', SYNTH.commission.name, SYNTH.commission.color, com);
        addCat('tax', SYNTH.tax.name, SYNTH.tax.color, txv);
        addCat('bookingUtil', SYNTH.bookingUtil.name, SYNTH.bookingUtil.color, util);
        addPropCost(pName, com + txv + util);
        if (com > 0) { const label = r.source || 'Inne'; portal[label] = (portal[label] || 0) + com; }
      } else if (r.type === 'utility') {
        const amount = Number(r.utilities) || 0;
        if (amount <= 0) return;
        standalone += amount;
        const cat = r.category || 'Inne koszty';
        addCat(`cat:${cat}`, cat, null, amount);
        addPropCost(pName, amount);
        entries.push({ id: r.id, date: r.date, category: cat, detail: r.guest || '—', property: pName, amount });
      }
    });

    // Koszty stałe: wiersze do zarządzania (zakres czasowy) + wkład do sum (z filtrem obiektu)
    const fixedRows = recurringCosts.map((c) => {
      const months = monthsInScope(c);
      return { ...c, months, contribution: months * (Number(c.amount) || 0) };
    }).sort((a, b) => (b.contribution - a.contribution) || (Number(b.amount) - Number(a.amount)));

    let fixed = 0;
    recurringCosts.forEach((c) => {
      const months = monthsInScope(c);
      if (months <= 0) return;
      const amt = months * (Number(c.amount) || 0);
      if (amt <= 0) return;
      const pName = c.property || '';
      if (propFilter !== 'all' && pName !== propFilter) return; // koszty „wszystkie obiekty" tylko w widoku ogólnym
      fixed += amt;
      addCat(`cat:${c.category || 'Inne'}`, c.category || 'Inne', null, amt);
      if (pName) addPropCost(pName, amt);
    });

    // kolory kategorii własnych — rotacja po posortowaniu (najwięksi = stabilne barwy)
    Object.keys(cats).filter((k) => k.startsWith('cat:')).sort((a, b) => cats[b].amount - cats[a].amount)
      .forEach((k, i) => { cats[k].color = CAT_RAMP[i % CAT_RAMP.length]; });

    const variable = commission + tax + bookingUtil + standalone;
    const total = variable + fixed;
    const profit = income - total;
    const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

    const totalCat = Object.values(cats).reduce((a, c) => a + c.amount, 0) || 1;
    const maxCat = Math.max(1, ...Object.values(cats).map((c) => c.amount));
    const categoriesRows = Object.values(cats)
      .map((c) => ({ ...c, pct: Math.round((c.amount / totalCat) * 100), bar: Math.round((c.amount / maxCat) * 100) }))
      .sort((a, b) => b.amount - a.amount);

    const maxPortal = Math.max(1, ...Object.values(portal));
    const portalRows = Object.entries(portal)
      .map(([name, amount]) => ({ name, amount, pct: Math.round((amount / (commission || 1)) * 100), bar: Math.round((amount / maxPortal) * 100), color: CHANNEL_HEX[channelTone(name)] || 'var(--faint)' }))
      .sort((a, b) => b.amount - a.amount);

    const profitByProp = Object.keys({ ...incomeByProp, ...byPropCost })
      .map((name) => {
        const inc = incomeByProp[name] || 0; const cost = byPropCost[name] || 0;
        return { name, income: inc, cost, profit: inc - cost, margin: inc > 0 ? Math.round(((inc - cost) / inc) * 100) : 0, color: propHex(properties.find((p) => p.name === name)?.color) };
      })
      .sort((a, b) => b.profit - a.profit);

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      income, total, variable, fixed, profit, margin,
      categoriesRows, portalRows, profitByProp, fixedRows,
      recent: entries.slice(0, 8), recentCount: entries.length,
      hasActivity: income > 0 || total > 0,
    };
  }, [rentals, properties, recurringCosts, selectedYear, scope, propFilter]);

  const { progress, shown } = useCountUp();

  // ── Zapis kosztów stałych (settings/recurringCosts; onSnapshot odświeży prop) ──
  const persist = async (items) => {
    if (!user) return false;
    try { await setDoc(doc(db, 'users', user.uid, 'settings', 'recurringCosts'), { items }); return true; }
    catch (e) { console.error('Błąd zapisu kosztu stałego:', e); toast.error('Nie udało się zapisać. Spróbuj ponownie.'); return false; }
  };
  const saveCost = async (payload) => {
    const isEdit = editingCost && editingCost !== 'new';
    const items = isEdit
      ? recurringCosts.map((c) => (c.id === editingCost.id ? { ...payload, id: c.id } : c))
      : [...recurringCosts, { ...payload, id: uuid() }];
    if (await persist(items)) { toast.success(isEdit ? 'Zaktualizowano koszt stały' : 'Dodano koszt stały'); setEditingCost(null); }
  };
  const removeCost = async (id) => { if (await persist(recurringCosts.filter((c) => c.id !== id))) toast.success('Usunięto koszt stały'); setConfirmId(null); };

  return (
    <>
      {editingCost && (
        <RecurringCostModal
          editing={editingCost === 'new' ? null : editingCost}
          categories={categories} properties={properties}
          onCancel={() => setEditingCost(null)} onSave={saveCost}
        />
      )}
      {confirmId && (
        <DeleteConfirmModal
          title="Usuwanie kosztu stałego"
          message="Czy na pewno usunąć ten koszt cykliczny? Przestanie być liczony w kosztach."
          onCancel={() => setConfirmId(null)} onConfirm={() => removeCost(confirmId)}
        />
      )}

      <div className="wpd-objs__head" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="wpd-seg">
          <button className={`wpd-seg__btn${scope === 'month' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('month')}>Miesiąc</button>
          <button className={`wpd-seg__btn${scope === 'year' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('year')}>Rok {selectedYear}</button>
          <button className={`wpd-seg__btn${scope === 'all' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('all')}>Wszystko</button>
        </div>
        <select className="wpd-select wpd-select--sm" value={propFilter} onChange={(e) => setPropFilter(e.target.value)} aria-label="Filtr obiektu">
          <option value="all">Wszystkie obiekty</option>
          {properties.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      {data.hasActivity ? (
        <>
          <div className={`wpd-stats wpd-rise${shown ? ' is-in' : ''}`}>
            <div className="wpd-stat wpd-stat--dark" style={{ cursor: 'default' }}>
              <div className="wpd-stat__head"><p className="wpd-stat__label">Koszty łącznie</p><span className="wpd-stat__ic"><Receipt /></span></div>
              <div className="wpd-stat__value" style={{ color: 'var(--cynober)' }}>{fmt(data.total * progress)} <small>zł</small></div>
            </div>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <div className="wpd-stat__head"><p className="wpd-stat__label">Koszty zmienne</p><span className="wpd-stat__ic"><Percent /></span></div>
              <div className="wpd-stat__value">{fmt(data.variable * progress)} <small>zł</small></div>
              <p className="wpd-stat__foot">prowizje, podatki, media, wpisy</p>
            </div>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <div className="wpd-stat__head"><p className="wpd-stat__label">Koszty stałe</p><span className="wpd-stat__ic"><Repeat /></span></div>
              <div className="wpd-stat__value">{fmt(data.fixed * progress)} <small>zł</small></div>
              <p className="wpd-stat__foot">cykliczne, miesięczne</p>
            </div>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <div className="wpd-stat__head"><p className="wpd-stat__label">Zysk netto</p><span className="wpd-stat__ic"><PiggyBank /></span></div>
              <div className="wpd-stat__value" style={{ color: data.profit >= 0 ? 'var(--green)' : 'var(--cynober)' }}>{fmt(data.profit * progress)} <small>zł</small></div>
              <p className="wpd-stat__foot">{data.income > 0 ? `marża ${data.margin}% · przychód ${fmt(data.income)} zł` : 'brak przychodu w zakresie'}</p>
            </div>
          </div>

          <div className={`wpd-section wpd-grid-2 wpd-rise${shown ? ' is-in' : ''}`} style={{ transitionDelay: '60ms' }}>
            <div className="wpd-panel">
              <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Na co poszły pieniądze</h2></div>
              <div style={{ padding: '10px 18px 16px' }}>
                {data.categoriesRows.map((c, i) => (
                  <CostBar key={c.name} name={c.name} Icon={catBarIcon(c.name)} amount={c.amount} pct={c.pct} color={c.color} shown={shown} delay={i * 55} />
                ))}
              </div>
            </div>
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <Percent style={{ width: 15, height: 15, color: 'var(--cynober)' }} />
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Prowizje wg portalu</h2>
              </div>
              <div style={{ padding: '10px 18px 16px' }}>
                {data.portalRows.length === 0
                  ? <p className="wpd-body" style={{ color: 'var(--faint)', margin: '10px 0' }}>Brak prowizji w tym zakresie. Uzupełnij pole „Prowizja portalu" przy rezerwacjach.</p>
                  : data.portalRows.map((p, i) => (
                    <CostBar key={p.name} name={p.name} Icon={sourceIcon(p.name)} amount={p.amount} pct={p.pct} color={p.color} shown={shown} delay={i * 55} />
                  ))}
              </div>
            </div>
          </div>

          <div className={`wpd-section wpd-grid-2 wpd-rise${shown ? ' is-in' : ''}`} style={{ transitionDelay: '90ms' }}>
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <TrendingUp style={{ width: 15, height: 15, color: 'var(--green)' }} />
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Zysk wg obiektu</h2>
              </div>
              <div className="wpd-ptable">
                {data.profitByProp.length === 0 && <p className="wpd-body" style={{ color: 'var(--faint)', margin: '10px 18px' }}>Brak danych o obiektach w tym zakresie.</p>}
                {data.profitByProp.map((p) => (
                  <div className="wpd-ptable__row" key={p.name}>
                    <span className="wpd-ptable__name"><span className="wpd-dot" style={{ background: p.color }} />{p.name || '—'}</span>
                    <span className="wpd-ptable__meta wpd-mono">{fmt(p.income)} − {fmt(p.cost)}</span>
                    <span className="wpd-ptable__profit wpd-mono" style={{ color: p.profit >= 0 ? 'var(--green)' : 'var(--cynober)' }}>{fmt(p.profit)} zł</span>
                    <span className="wpd-ptable__margin">{p.income > 0 ? `${p.margin}%` : '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <Repeat style={{ width: 15, height: 15, color: 'var(--amber-ink)' }} />
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Koszty stałe (miesięczne)</h2>
                <button className="wpd-btn wpd-btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setEditingCost('new')}><Plus /> Dodaj</button>
              </div>
              <div style={{ padding: '12px 18px 16px' }}>
                {recurringCosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '14px 6px' }}>
                    <Coins style={{ width: 22, height: 22, color: 'var(--faint)', margin: '0 auto 8px', display: 'block' }} />
                    <p className="wpd-body" style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                      Brak kosztów stałych. Dodaj np. ubezpieczenie, abonament, ryczałt za sprzątanie — wpisujesz raz, liczą się co miesiąc.
                    </p>
                  </div>
                ) : data.fixedRows.map((c) => (
                  <div className="wpd-listrow" key={c.id}>
                    <span className="wpd-listrow__ic" style={{ background: 'var(--inner-2)', color: 'var(--amber-ink)' }}>{React.createElement(categoryIcon(c.category))}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <span className="wpd-body" style={{ display: 'block', color: 'var(--faint)', fontSize: 12, marginTop: 1 }}>
                        {c.category || 'Inne'} · {c.property || 'wszystkie obiekty'} · od {fmtMonth(c.startMonth)}{c.endMonth ? ` do ${fmtMonth(c.endMonth)}` : ''}
                      </span>
                    </span>
                    <span style={{ textAlign: 'right', flex: '0 0 auto', marginRight: 4 }}>
                      <span className="wpd-mono" style={{ display: 'block', fontWeight: 600, fontSize: 13.5 }}>{fmt(c.amount)} zł/mc</span>
                      <span className="wpd-body" style={{ display: 'block', color: 'var(--faint)', fontSize: 11.5 }}>{c.months > 0 ? `${c.months} mc = ${fmt(c.contribution)} zł` : 'poza zakresem'}</span>
                    </span>
                    <span style={{ display: 'inline-flex', gap: 4, flex: '0 0 auto' }}>
                      <button className="wpd-iconbtn" title="Edytuj" onClick={() => setEditingCost(c)}><Edit /></button>
                      <button className="wpd-iconbtn wpd-iconbtn--del" title="Usuń" onClick={() => setConfirmId(c.id)}><Trash2 /></button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.recent.length > 0 && (
            <div className={`wpd-section wpd-panel wpd-rise${shown ? ' is-in' : ''}`} style={{ transitionDelay: '120ms' }}>
              <div className="wpd-panel__head">
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Ostatnie koszty</h2>
                {data.recentCount > data.recent.length && (
                  <span className="wpd-label" style={{ marginLeft: 'auto' }}>{data.recent.length} z {data.recentCount}</span>
                )}
              </div>
              <div className="wpd-ctable">
                {data.recent.map((e) => (
                  <div className="wpd-ctable__row" key={e.id}>
                    <span className="wpd-ctable__date wpd-mono">{fmtDate(e.date)}</span>
                    <span className="wpd-ctable__cat">{React.createElement(categoryIcon(e.category), { style: { width: 12, height: 12, verticalAlign: '-2px', marginRight: 6, color: 'var(--faint)' } })}{e.category}</span>
                    <span className="wpd-ctable__detail" title={e.detail}>{e.detail}</span>
                    <span className="wpd-ctable__prop">{e.property || '—'}</span>
                    <span className="wpd-ctable__amt wpd-mono">{fmt(e.amount)} zł</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="wpd-section wpd-panel">
          <div className="wpd-panel__head">
            <Repeat style={{ width: 15, height: 15, color: 'var(--amber-ink)' }} />
            <h2 className="wpd-h2" style={{ fontSize: 15 }}>Koszty stałe (miesięczne)</h2>
            <button className="wpd-btn wpd-btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setEditingCost('new')}><Plus /> Dodaj</button>
          </div>
          <div style={{ padding: '18px' }}>
            {recurringCosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '10px 6px' }}>
                <Receipt style={{ width: 26, height: 26, color: 'var(--faint)', margin: '0 auto 10px', display: 'block' }} />
                <p className="wpd-h2" style={{ fontSize: 16, marginBottom: 6 }}>Brak kosztów w tym zakresie</p>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                  Koszty pojawią się z prowizji i podatków rezerwacji oraz z wpisów „+ Rezerwacja” → zakładka <b>Koszty</b>. Koszty stałe (ubezpieczenie, abonamenty) dodasz przyciskiem powyżej.
                </p>
              </div>
            ) : data.fixedRows.map((c) => (
              <div className="wpd-listrow" key={c.id}>
                <span className="wpd-listrow__ic" style={{ background: 'var(--inner-2)', color: 'var(--amber-ink)' }}><Repeat /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                  <span className="wpd-body" style={{ display: 'block', color: 'var(--faint)', fontSize: 12, marginTop: 1 }}>
                    {c.category || 'Inne'} · {c.property || 'wszystkie obiekty'} · od {fmtMonth(c.startMonth)}{c.endMonth ? ` do ${fmtMonth(c.endMonth)}` : ''}
                  </span>
                </span>
                <span className="wpd-mono" style={{ fontWeight: 600, fontSize: 13.5, marginRight: 4 }}>{fmt(c.amount)} zł/mc</span>
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  <button className="wpd-iconbtn" title="Edytuj" onClick={() => setEditingCost(c)}><Edit /></button>
                  <button className="wpd-iconbtn wpd-iconbtn--del" title="Usuń" onClick={() => setConfirmId(c.id)}><Trash2 /></button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
