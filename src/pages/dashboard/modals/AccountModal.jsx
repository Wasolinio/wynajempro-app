import React, { useState } from 'react';
import { User, X, ExternalLink, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { auth, functions } from '../../../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { useDialogA11y } from './useDialogA11y';

/*
  Konto gospodarza (X6) — otwierane kliknięciem w imię i nazwisko w sidebarze
  oraz z pozycji „Konto" w mobilnym arkuszu „Więcej". Wydzielone z SettingsModal
  decyzją właściciela (2026-07-06): profil gospodarza, subskrypcja i usunięcie
  konta żyją przy tożsamości; ustawienia aplikacji zostają pod zębatką.
  UWAGA: zapis WYŁĄCZNIE settings/hostProfile (saveAccount) — celowo nie reużywa
  saveSettings, który zapisuje wszystkie stany editing* (przy wejściu z konta
  nieseedowane → ryzyko nadpisania np. listy obiektów pustką).
*/

const TABS = [
  ['hostProfile', 'Profil gospodarza'],
  ['subscription', 'Subskrypcja'],
  ['danger', 'Usunięcie konta'],
];

function AccountModal(props) {
  const {
    showAccountModal, setShowAccountModal,
    editingHostProfile, setEditingHostProfile,
    accountStatus, handleManageSubscription, isBillingPortalLoading, saveAccount,
  } = props;

  const [tab, setTab] = useState('hostProfile');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const dialogA11y = useDialogA11y(showAccountModal, () => setShowAccountModal(false));

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Wprowadź hasło by potwierdzić.');
    setIsDeletingAccount(true);
    try {
      if (auth.currentUser) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, deletePassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        const deleteAccountFn = httpsCallable(functions, 'deleteUserAccount');
        await deleteAccountFn();
        await signOut(auth);
        window.location.href = '/';
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') toast.error('Błędne hasło.');
      else toast.error('Wystąpił błąd podczas usuwania konta.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!showAccountModal) return null;
  const hp = editingHostProfile;
  const setHp = (patch) => setEditingHostProfile({ ...hp, ...patch });

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAccountModal(false); }}>
      <div className="wpd-dialog wpd-dialog--lg" {...dialogA11y}>
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><User /></span>
          <div><h2 className="wpd-h2">Twoje konto</h2></div>
          <button className="wpd-dialog__close" onClick={() => setShowAccountModal(false)}><X /></button>
        </div>

        <div className="wpd-dialog__body">
          <div className="wpd-tabs">
            {TABS.map(([key, label]) => (
              <button key={key} type="button" className={`wpd-tab${tab === key ? ' wpd-tab--active' : ''}`} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>

          {/* PROFIL GOSPODARZA */}
          {tab === 'hostProfile' && (
            <>
              <div className="wpd-field">
                <label className="wpd-flabel">Pełna nazwa podmiotu / Imię i nazwisko</label>
                <input className="wpd-input" value={hp.entityName || ''} onChange={(e) => setHp({ entityName: e.target.value })} />
              </div>
              <div className="wpd-fgrid">
                <div className="wpd-field">
                  <label className="wpd-flabel">Typ identyfikatora</label>
                  <select className="wpd-select" value={hp.identifierType || 'NIP'} onChange={(e) => setHp({ identifierType: e.target.value })}>
                    <option value="NIP">NIP</option><option value="PESEL">PESEL</option>
                  </select>
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Twój NIP / PESEL</label>
                  <input className="wpd-input wpd-input--num" placeholder="np. 1234567890" value={hp.taxIdentifier || ''} onChange={(e) => setHp({ taxIdentifier: e.target.value })} />
                </div>
              </div>
              <div className="wpd-field">
                <label className="wpd-flabel">Adres</label>
                <input className="wpd-input" value={hp.address || ''} onChange={(e) => setHp({ address: e.target.value })} />
              </div>
              <div className="wpd-fgrid">
                <div className="wpd-field">
                  <label className="wpd-flabel">Numer telefonu</label>
                  <input className="wpd-input wpd-input--num" value={hp.phone || ''} onChange={(e) => setHp({ phone: e.target.value })} />
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Adres e-mail</label>
                  <input className="wpd-input" type="email" value={hp.email || ''} onChange={(e) => setHp({ email: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {/* SUBSKRYPCJA */}
          {tab === 'subscription' && (
            <>
              <div className="wpd-panel" style={{ marginBottom: 14 }}>
                <div className="wpd-panel__head">
                  <h2 className="wpd-h2" style={{ fontSize: 15 }}>Status subskrypcji</h2>
                  <span className={`wpd-tag wpd-tag--${accountStatus === 'active' ? 'green' : accountStatus === 'trialing' ? 'granat' : 'cynober'}`} style={{ marginLeft: 'auto' }}>
                    {accountStatus === 'active' ? 'Aktywna' : accountStatus === 'trialing' ? 'Trial' : accountStatus === 'past_due' ? 'Zaległa' : 'Anulowana'}
                  </span>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 28 }} className="wpd-mono">29,99</span>
                    <span style={{ color: 'var(--faint)', fontSize: 13 }}>zł / miesiąc</span>
                  </div>
                  <p className="wpd-stat__sub" style={{ marginTop: 6 }}>Plan Gospodarza — pełen dostęp do systemu</p>
                </div>
              </div>
              <button type="button" className="wpd-btn wpd-btn--primary" style={{ width: '100%' }} onClick={handleManageSubscription} disabled={isBillingPortalLoading}>
                <ExternalLink /> {isBillingPortalLoading ? 'Otwieram…' : 'Otwórz panel zarządzania'}
              </button>
              <div className="wpd-note" style={{ marginTop: 14 }}>
                <p style={{ display: 'flex', gap: 7, margin: '0 0 6px' }}><CheckCircle style={{ width: 15, height: 15, flex: '0 0 15px', marginTop: 2, color: 'var(--green)' }} /> Zmiana karty bez przerwy w dostępie.</p>
                <p style={{ display: 'flex', gap: 7, margin: '0 0 6px' }}><CheckCircle style={{ width: 15, height: 15, flex: '0 0 15px', marginTop: 2, color: 'var(--green)' }} /> Faktury VAT do pobrania w PDF.</p>
                <p style={{ display: 'flex', gap: 7, margin: 0 }}><CheckCircle style={{ width: 15, height: 15, flex: '0 0 15px', marginTop: 2, color: 'var(--green)' }} /> Anulowanie w dowolnym momencie.</p>
              </div>
            </>
          )}

          {/* USUNIĘCIE KONTA */}
          {tab === 'danger' && (
            <>
              <div className="wpd-note wpd-note--danger" style={{ marginBottom: 14 }}>
                <h4><AlertTriangle /> Strefa zagrożenia: trwałe usuwanie konta</h4>
                Usunięcie konta bezpowrotnie kasuje konto, subskrypcję, nieruchomości i historię rezerwacji.
              </div>
              <div className="wpd-panel" style={{ padding: 18 }}>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px', lineHeight: 1.6 }}>
                  Zgodnie z RODO możesz w każdej chwili zażądać usunięcia danych z systemu WynajemPRO. Wymagane potwierdzenie hasłem.
                </p>
                <div className="wpd-field">
                  <label className="wpd-flabel">Twoje hasło do WynajemPRO</label>
                  <input className="wpd-input" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Wprowadź hasło by potwierdzić…" />
                </div>
                <button type="button" className="wpd-btn wpd-btn--primary" style={{ width: '100%' }} onClick={handleDeleteAccount} disabled={isDeletingAccount || !deletePassword}>
                  <Trash2 /> {isDeletingAccount ? 'Trwa kasowanie danych…' : 'Usuń trwale moje konto'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="wpd-dialog__foot">
          <button type="button" className="wpd-btn" onClick={() => setShowAccountModal(false)}>Zamknij</button>
          {tab === 'hostProfile' && (
            <button type="button" className="wpd-btn wpd-btn--primary" onClick={saveAccount}>Zapisz profil</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AccountModal);
