import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PATCH_NOTES } from '../data/patchNotes';
import { formatujDatePl, odmien } from '../utils/dataPl';
import LegalLayout from './LegalLayout';

/*
  /co-nowego — publiczny dziennik zmian panelu (plan uczłowieczenia landingu, analiza
  Smoobu §7 pkt 4; kandydat z analizy IdoBooking: „dowód życia produktu").

  Źródło treści = TE SAME patch noty, które zasilają popup „Co nowego" w panelu (E4):
  docs/marketing/patch-notes.md → npm run patchnotes:build → src/data/patchNotes.js.
  Strona nie ma własnych danych, więc nie może się rozjechać z panelem, a nowy wpis
  wychodzi na nią dokładnie z deployem, którego dotyczy. Generator pilnuje u źródła
  formatu dat, kolejności (najnowszy pierwszy), unikalności id i zakazu emoji.

  Daty z rokiem (nie „auto" jak w popupie): czytelnik z zewnątrz nie zna kontekstu.
*/
export default function CoNowegoPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const najnowszy = PATCH_NOTES[0];

  return (
    <LegalLayout
      label="Co nowego"
      title="Co nowego w WynajemPRO"
      subtitle="Zmiany w panelu, od najnowszej. To ta sama lista, którą gospodarze widzą po zalogowaniu."
      meta={najnowszy ? `Ostatnia zmiana: ${formatujDatePl(najnowszy.date, { zRokiem: 'zawsze' })} · ${odmien(PATCH_NOTES.length, ['wpis', 'wpisy', 'wpisów'])}` : undefined}
    >
      {PATCH_NOTES.map((wpis) => (
        <section className="wpb-pn" key={wpis.id} id={wpis.id}>
          <p className="wpb-meta" style={{ margin: 0 }}>{formatujDatePl(wpis.date, { zRokiem: 'zawsze' })}</p>
          <h2 style={{ marginTop: 6 }}>{wpis.title}</h2>
          <ul>
            {wpis.items.map((punkt, i) => (
              <li key={i}>{punkt}</li>
            ))}
          </ul>
        </section>
      ))}

      <hr className="wpb-prose-hr" />
      <p>
        Brakuje Ci czegoś w panelu albo coś działa nie tak, jak opisano wyżej?
        Napisz przez <Link to="/kontakt">formularz kontaktowy</Link>. Instrukcje do
        wszystkich części panelu są w <Link to="/pomoc">centrum pomocy</Link>.
      </p>
    </LegalLayout>
  );
}
