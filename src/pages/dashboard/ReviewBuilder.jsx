import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Edit, Trash2, Copy, X, Star, ExternalLink, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

/*
  Edytor stron opinii (X13, nawigacja 09) — strona podziękowania po pobycie
  z łączami do portali opinii (Google / Booking / Airbnb…).
  Reużywa kolekcji `guides` z polem type:'review' — publiczny odczyt i prawa
  właściciela działają na istniejących regułach, bez zmian w firestore.rules.
  MVP wg decyzji właściciela (2026-07-04): strona per obiekt, link udostępniany
  ręcznie po wyjeździe, bez danych osobowych gościa i bez automatycznej wysyłki.
*/

/* Domyślne teksty: bez wykrzykników (głos marki) i bezosobowo — gospodarz wysyła
   jeden tekst wszystkim gościom; kto woli formę per „Ty", edytuje szablon. */
const DEFAULT_TITLE = 'Dziękujemy za pobyt';
const DEFAULT_MESSAGE = `Mamy nadzieję, że pobyt był udany i jeszcze się u nas zobaczymy.

Jeśli znajdzie się chwila, będziemy wdzięczni za kilka słów opinii — dla nas to najlepsza pomoc, a dla przyszłych gości cenna wskazówka. Wystarczy wybrać jedno z miejsc poniżej:`;

/* Podpowiedzi najczęstszych portali — label gotowy, URL uzupełnia gospodarz */
const LINK_PRESETS = [
  { label: 'Google', hint: 'https://g.page/r/… (link „Poproś o opinie” z Profilu Firmy)' },
  { label: 'Booking.com', hint: 'https://www.booking.com/hotel/pl/… (strona obiektu — Booking prosi o opinię własnym mailem)' },
  { label: 'Airbnb', hint: 'https://www.airbnb.pl/rooms/…' },
  { label: 'TripAdvisor', hint: 'https://www.tripadvisor.com/…' },
  { label: 'Facebook', hint: 'https://www.facebook.com/…/reviews' },
];

export default function ReviewBuilder({ user, properties }) {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // potwierdzenia w brandowym dialogu: { title, message, action }
  const [confirmBox, setConfirmBox] = useState(null);

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPages = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'guides'), where('ownerId', '==', user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPages(fetched.filter((g) => g.type === 'review'));
    } catch (err) {
      console.error('Błąd pobierania stron opinii:', err);
      // bez toasta pusty stan „Brak stron opinii" kłamałby przy błędzie sieci
      toast.error('Nie udało się pobrać stron opinii. Odśwież panel.');
    } finally {
      setIsLoading(false);
    }
  };

  const publicUrl = (id) => `${window.location.origin}/opinie/${id}`;

  const copyLink = async (id) => {
    try {
      await navigator.clipboard.writeText(publicUrl(id));
      toast.success('Link skopiowany');
    } catch {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleCreateNew = () => setEditingPage({
    id: `review_${Date.now()}`,
    type: 'review',
    property: properties.length > 0 ? properties[0].name : '',
    title: DEFAULT_TITLE,
    message: DEFAULT_MESSAGE,
    links: [{ label: 'Google', url: '' }],
  });

  const deletePage = async (id) => {
    try {
      await deleteDoc(doc(db, 'guides', id));
      toast.success('Usunięto stronę opinii');
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Błąd usuwania strony opinii:', err);
      toast.error('Nie udało się usunąć strony. Spróbuj ponownie.');
    }
  };

  const handleDelete = (id) => setConfirmBox({
    title: 'Usuwanie strony opinii',
    message: 'Czy na pewno usunąć tę stronę? Udostępnione wcześniej linki przestaną działać.',
    action: () => deletePage(id),
  });

  const setLink = (i, patch) => setEditingPage((p) => ({
    ...p, links: p.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
  }));
  const addLink = (label = '') => setEditingPage((p) => ({ ...p, links: [...p.links, { label, url: '' }] }));
  const removeLink = (i) => setEditingPage((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }));

  // brak protokołu → https:// (gospodarze wklejają adresy z paska bez protokołu)
  const normalizeUrl = (url) => {
    const u = (url || '').trim();
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const links = editingPage.links
      .map((l) => ({ label: (l.label || '').trim(), url: normalizeUrl(l.url) }))
      .filter((l) => l.url);
    if (links.length === 0) {
      toast.error('Dodaj przynajmniej jedno łącze do opinii.');
      return;
    }
    setIsSaving(true);
    try {
      const isNew = !pages.some((p) => p.id === editingPage.id);
      const payload = {
        type: 'review',
        ownerId: user.uid,
        property: editingPage.property || '',
        title: (editingPage.title || '').trim() || DEFAULT_TITLE,
        message: editingPage.message || '',
        links,
        updatedAt: serverTimestamp(),
      };
      const ref = doc(db, 'guides', editingPage.id);
      if (isNew) await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
      else await updateDoc(ref, payload);
      toast.success(isNew ? 'Strona opinii zapisana' : 'Strona opinii zaktualizowana');
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      console.error('Błąd zapisu strony opinii:', err);
      toast.error('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  // wspólny dla obu gałęzi renderu (lista / edycja)
  const confirmModal = confirmBox && (
    <DeleteConfirmModal
      title={confirmBox.title}
      message={confirmBox.message}
      onCancel={() => setConfirmBox(null)}
      onConfirm={() => { confirmBox.action(); setConfirmBox(null); }}
    />
  );

  if (isLoading) {
    return (
      <div className="wpd-loader" style={{ minHeight: '40vh', background: 'transparent' }}>
        <span className="wpd-spin" />
      </div>
    );
  }

  /* ── Edycja ── */
  if (editingPage) {
    return (
      <>
        {confirmModal}
        <div className="wpd-panel" style={{ marginBottom: 18 }}>
          <div className="wpd-panel__head">
            <div>
              <h2 className="wpd-h2">{pages.some((p) => p.id === editingPage.id) ? 'Edytuj stronę opinii' : 'Nowa strona opinii'}</h2>
              <p className="wpd-dialog__sub" style={{ marginTop: 4 }}>Podziękowanie dla gościa z prośbą o opinię</p>
            </div>
            <button type="button" className="wpd-dialog__close" style={{ marginLeft: 'auto' }} onClick={() => setEditingPage(null)}><X /></button>
          </div>
        </div>

        <form onSubmit={handleSave} className="wpd-gb-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Treść podziękowania */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><Star style={{ width: 16, height: 16, color: 'var(--cynober)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Treść podziękowania</h2></div>
              <div style={{ padding: 18 }}>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Obiekt</label>
                    <select className="wpd-select" value={editingPage.property} onChange={(e) => setEditingPage({ ...editingPage, property: e.target.value })}>
                      <option value="">— bez przypisania —</option>
                      {properties.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Tytuł</label>
                    <input className="wpd-input" value={editingPage.title} onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })} placeholder={DEFAULT_TITLE} />
                  </div>
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Wiadomość dla gościa</label>
                  <textarea className="wpd-textarea" rows="6" value={editingPage.message} onChange={(e) => setEditingPage({ ...editingPage, message: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Łącza do opinii */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><LinkIcon style={{ width: 16, height: 16, color: 'var(--cynober)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Łącza do opinii</h2></div>
              <div style={{ padding: 18 }}>
                {editingPage.links.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 40px', gap: 8, marginBottom: 10 }}>
                    <input className="wpd-input" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Portal" aria-label={`Nazwa portalu ${i + 1}`} />
                    <input className="wpd-input" value={l.url} onChange={(e) => setLink(i, { url: e.target.value })}
                      placeholder={LINK_PRESETS.find((pr) => pr.label === l.label)?.hint || 'https://…'} aria-label={`Adres łącza ${i + 1}`} />
                    <button type="button" className="wpd-iconbtn" title="Usuń łącze" onClick={() => removeLink(i)}><Trash2 /></button>
                  </div>
                ))}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {LINK_PRESETS.filter((pr) => !editingPage.links.some((l) => l.label === pr.label)).map((pr) => (
                    <button key={pr.label} type="button" className="wpd-btn wpd-btn--sm" onClick={() => addLink(pr.label)}><Plus /> {pr.label}</button>
                  ))}
                  <button type="button" className="wpd-btn wpd-btn--sm" onClick={() => addLink('')}><Plus /> Inne</button>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa kolumna: udostępnianie */}
          <div className="wpd-panel" style={{ alignSelf: 'start' }}>
            <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Udostępnianie</h2></div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span className="wpd-flabel">Publiczny link</span>
                <div className="wpd-mono" style={{ fontSize: 12, wordBreak: 'break-all', border: '1px solid var(--hairline)', borderRadius: 3, padding: '10px 12px', background: 'var(--surface)' }}>
                  {publicUrl(editingPage.id)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="wpd-btn wpd-btn--sm" onClick={() => copyLink(editingPage.id)}><Copy /> Kopiuj link</button>
                <a className="wpd-btn wpd-btn--sm" href={publicUrl(editingPage.id)} target="_blank" rel="noopener noreferrer"><ExternalLink /> Podgląd</a>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <QRCodeSVG value={publicUrl(editingPage.id)} size={128} />
                <p className="wpd-label" style={{ marginTop: 8 }}>Kod QR — np. do wydruku w obiekcie</p>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                Po wyjeździe gościa wyślij mu ten link SMS-em, WhatsAppem albo mailem.
                Strona jest publiczna i nie zawiera danych gościa — zapisz raz, używaj przy każdym pobycie.
              </p>
              <button type="submit" className="wpd-btn wpd-btn--primary" disabled={isSaving} style={{ width: '100%' }}>
                {isSaving ? 'Zapisywanie…' : 'Zapisz stronę'}
              </button>
            </div>
          </div>
        </form>
      </>
    );
  }

  /* ── Lista ── */
  return (
    <>
      {confirmModal}
      <div className="wpd-objs__head">
        <span className="wpd-label">Podziękowania z prośbą o opinię — wysyłane gościom po pobycie</span>
        <button className="wpd-btn wpd-btn--primary" onClick={handleCreateNew}><Plus /> Nowa strona</button>
      </div>

      {pages.length === 0 ? (
        <div className="wpd-soon">
          <div className="wpd-soon__card" style={{ textAlign: 'center' }}>
            <Star style={{ width: 26, height: 26, color: 'var(--faint)', margin: '0 auto 10px', display: 'block' }} />
            <p className="wpd-h2" style={{ fontSize: 16, marginBottom: 6 }}>Brak stron opinii</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px', maxWidth: '42ch' }}>
              Stwórz stronę z podziękowaniem i łączami do Google, Booking czy Airbnb —
              po pobycie wyślesz gościowi jeden link.
            </p>
            <button className="wpd-btn wpd-btn--primary" onClick={handleCreateNew}><Plus /> Nowa strona</button>
          </div>
        </div>
      ) : (
        <div className="wpd-panel">
          <div className="wpd-list">
            {pages.map((p) => (
              <div className="wpd-row" key={p.id}>
                <div className="wpd-row__main">
                  <div className="wpd-row__name">{p.property || p.title}</div>
                  <div className="wpd-row__meta wpd-mono" style={{ wordBreak: 'break-all' }}>{publicUrl(p.id)}</div>
                </div>
                <button className="wpd-iconbtn" title="Kopiuj link" onClick={() => copyLink(p.id)}><Copy /></button>
                <a className="wpd-iconbtn" title="Otwórz podgląd" href={publicUrl(p.id)} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
                <button className="wpd-iconbtn" title="Edytuj" onClick={() => setEditingPage({ links: [], ...p })}><Edit /></button>
                <button className="wpd-iconbtn" title="Usuń" onClick={() => handleDelete(p.id)}><Trash2 /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
