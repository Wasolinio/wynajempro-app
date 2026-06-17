import React from 'react';
import LegalLayout from './LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout 
      title="Regulamin Świadczenia Usług"
      subtitle="Zasady korzystania z aplikacji WynajemPRO"
      lastUpdated={new Date().toLocaleDateString('pl-PL')}
    >
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Postanowienia ogólne</h2>
        <p>
          Niniejszy regulamin określa zasady świadczenia usług drogą elektroniczną w ramach aplikacji <strong>WynajemPRO</strong> 
          ("Aplikacja"), zasady korzystania z konta użytkownika oraz politykę płatności subskrypcyjnych realizowanych 
          za pośrednictwem platformy Stripe.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Zakładanie Konta i Okres Próbny</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Rejestracja w Aplikacji jest równoznaczna z akceptacją niniejszego Regulaminu.</li>
          <li>Konto użytkownika może założyć wyłącznie osoba pełnoletnia lub podmiot gospodarczy posiadający pełną zdolność do czynności prawnych.</li>
          <li>Użytkownik po rejestracji otrzymuje dostęp do darmowego okresu próbnego (o ile takowy obowiązuje w ofercie), w ramach którego ma pełny dostęp do funkcjonalności Aplikacji.</li>
          <li>Po wygaśnięciu okresu próbnego dostęp do danych (np. rezerwacji, kalendarzy) wymaga opłacenia subskrypcji.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Płatności i Subskrypcje (Stripe)</h2>
        <p className="mb-3">
          Usługi płatne w WynajemPRO realizowane są w modelu subskrypcyjnym z automatycznym odnawianiem.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Operatorem płatności jest <strong>Stripe, Inc.</strong> oraz powiązane z nim podmioty. WynajemPRO nie przechowuje pełnych danych kart płatniczych.</li>
          <li>Płatności pobierane są z góry za każdy kolejny cykl rozliczeniowy (np. miesiąc).</li>
          <li><strong>Anulowanie subskrypcji:</strong> Użytkownik ma pełne prawo anulować subskrypcję w dowolnym momencie korzystając z panelu Customer Portal dostępnego w ustawieniach konta. Po anulowaniu, funkcjonalność Premium zostaje zachowana do końca opłaconego cyklu.</li>
          <li>WynajemPRO nie zwraca kosztów za niewykorzystane dni w danym cyklu rozliczeniowym po rezygnacji, chyba że wprost nakazują tego przepisy prawa konsumenckiego.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Odpowiedzialność i Ograniczenia</h2>
        <p className="mb-3">Użytkownik zobowiązuje się do:</p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>Podawania prawdziwych danych podczas rejestracji oraz autoryzacji gości.</li>
          <li>Niewykorzystywania Aplikacji do celów niezgodnych z prawem, w tym przesyłania nielegalnych treści poprzez formularze Przewodników dla Gości.</li>
          <li>Zabezpieczenia swoich danych dostępowych do panelu administracyjnego przed osobami trzecimi.</li>
        </ul>
        <p>
          Twórcy Aplikacji dokładają wszelkich starań, by usługa działała bez przerwy (SLA), jednak nie ponoszą 
          odpowiedzialności za przerwy wynikające z awarii zewnętrznych operatorów chmurowych (Google Cloud, Firebase, Stripe) 
          oraz za szkody wynikłe z błędnej konfiguracji synchronizacji (np. zduplikowane rezerwacje wskutek opóźnień zew. serwerów iCal).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Ochrona Danych i Własność Intelektualna</h2>
        <p>
          Szczegółowe informacje na temat przetwarzania danych osobowych zawiera 
          <a href="/prywatnosc" className="text-blue-600 hover:underline mx-1">Polityka Prywatności</a>. 
          Wszelkie kody źródłowe, interfejsy oraz nazwa WynajemPRO podlegają ochronie prawno-autorskiej.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">6. Rozwiązywanie Sporów i Kontakt</h2>
        <p>
          Wszelkie reklamacje i wątpliwości związane z działaniem usługi należy zgłaszać na adres e-mail 
          dostępny na stronie <a href="/kontakt" className="text-blue-600 hover:underline">Kontakt</a>. 
          Odpowiedź na reklamację zostanie udzielona w terminie do 14 dni roboczych.
        </p>
      </section>
    </LegalLayout>
  );
}
