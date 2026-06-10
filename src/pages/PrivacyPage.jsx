import React from 'react';
import LegalLayout from './LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout 
      title="Polityka Prywatności i Cookies"
      subtitle="Dowiedz się, jak chronimy Twoje dane osobowe"
      lastUpdated={new Date().toLocaleDateString('pl-PL')}
    >
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Kto jest administratorem danych?</h2>
        <p>
          Administratorem Danych Osobowych przetwarzanych w ramach aplikacji <strong>WynajemPRO</strong> jest operator aplikacji. 
          Wszelkie zapytania dotyczące przetwarzania danych należy kierować poprzez dane podane w zakładce <a href="/kontakt" className="text-blue-600 hover:underline">Kontakt</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Jakie dane przetwarzamy i w jakim celu?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Dane Konta:</strong> Adres e-mail, identyfikator użytkownika. Wymagane do logowania, zabezpieczenia konta oraz świadczenia usługi subskrypcyjnej.</li>
          <li><strong>Dane Zarządcze (Menedżera):</strong> Nazwy obiektów, ceny, wpisy w kalendarzu. Są to dane dostarczane dobrowolnie przez użytkownika w celu zarządzania własnym biznesem.</li>
          <li><strong>Dane Przewodników dla Gości:</strong> Imię i nazwisko (opcjonalnie) oraz podpisy akceptacji logowane podczas weryfikacji tożsamości gości przez zewnętrzny udostępniony link. Ochrona tych danych, zebranych za pośrednictwem Aplikacji, jest powierzona również bezpośrednio Menedżerowi, który fizycznie udostępnia klucze i dane dostępowe.</li>
          <li><strong>Dane Płatnicze:</strong> Przetwarzane bezpiecznie przez zewnętrznego operatora Stripe. Administrator WynajemPRO nie przetwarza numerów kart kredytowych, a jedynie identyfikatory transakcji.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Udostępnianie Danych Podmiotom Trzecim (Procesory Danych)</h2>
        <p className="mb-3">Do świadczenia usług na najwyższym poziomie wykorzystujemy sprawdzonych podwykonawców (tzw. Subprocesorów), w szczególności:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Google Cloud EMEA Limited (Firebase)</strong>: Dostarcza infrastrukturę serwerową (Hosting, Baza Danych Firestore, Cloud Functions). Twoje dane oraz ustawienia są przechowywane w bezpiecznych Centrach Danych Google (w obrębie UE lub innych bezpiecznych lokalizacjach certyfikowanych).</li>
          <li><strong>Stripe, Inc.</strong>: Obsługuje cały system autoryzacji subskrypcji oraz płatności cyklicznych zgodnie ze standardami PCI-DSS.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Prawa Użytkownika (RODO)</h2>
        <p className="mb-3">Zgodnie z unijnym rozporządzeniem RODO masz prawo do:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Wglądu i Sprostowania:</strong> Zmiana danych dostępna jest bezpośrednio w interfejsie Aplikacji (Profil Użytkownika).</li>
          <li><strong>Prawa do bycia zapomnianym:</strong> Skasowanie konta z panelu Ustawień jest nieodwracalne i skutkuje kasacją poświadczeń e-mail.</li>
          <li><strong>Eksportu (Przenoszenia) Danych:</strong> Jeżeli masz aktywną subskrypcję, możesz wyeksportować swoje rezerwacje (iCal) lub poprosić o wyciąg systemowy kontaktując się z nami.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Ochrona Przed Botami i Bezpieczeństwo Logowania</h2>
        <p>
          Nasz system uwierzytelniania API (np. interfejs Firebase App Check w tym reCAPTCHA v3) chroni system bazodanowy i serwery przed nadużyciami czy atakami automatycznymi ze strony złośliwych programów. Dostępność do baz danych blokowana jest autorskimi, zaawansowanymi regułami bezpieczeństwa Firestore ograniczonymi autoryzacją na poziomie konkretnych ról i subskrypcji.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">6. Polityka Cookies i Local Storage</h2>
        <p className="mb-3">WynajemPRO korzysta z "ciasteczek" i technologii pamięci lokalnej przeglądarki wyłacznie w minimalnym, funkcjonalnym zakresie:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Local Storage i IndexedDB</strong>: Przechowuje podręczną pamięć aplikacji webowej tak, aby przy braku zasięgu (PWA/Offline) menedżer miał wgląd w swoje rezerwacje. Aplikacja przechowuje również sesje gości (akceptacja zasad wczasowiczów).</li>
          <li><strong>Cookies niezbędne (Auth)</strong>: Cookies wykorzystywane do utrzymywania stabilnej sesji bezpiecznego logowania (Firebase).</li>
          <li>Aplikacja na chwilę obecną nie wymusza zgód "Cookie Consent", gdyż przechowuje wyłącznie ciasteczka niezbędne do działania usługi ("strictly necessary"), zgodnie z przepisami dyrektywy ePrivacy.</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
