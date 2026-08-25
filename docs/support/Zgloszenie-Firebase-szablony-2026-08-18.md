# Zgłoszenie do wsparcia Firebase — odblokowanie edycji szablonów e-mail

> **Status:** ✅ **WYSŁANE przez właściciela 2026-08-18** — czekamy na odpowiedź Google.
> Odpowiedź wkleić do [[Activity-Log]] i przestawić status zlecenia #10. Kontekst i diagnostyka:
> [[Activity-Log]] 2026-08-18, [[Projects/Zlecenia-wlasciciela]] #10.

## Gdzie to wysłać

Konsola Firebase → ikona **?** (Pomoc) w prawym górnym rogu → **Support** →
formularz kontaktowy, albo bezpośrednio: <https://firebase.google.com/support/contact/troubleshooting/>

Wybierz kategorię **Authentication**, projekt **`moje-domki-6c77d`**.
Formularz jest po angielsku i odpowiedzi też przychodzą po angielsku — dlatego treść niżej
jest angielska. Wklej ją w całości.

## Treść do wklejenia

```
Subject: Email template customization blocked — EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED (project moje-domki-6c77d)

Hello,

I am unable to set a custom action URL for the account management email templates in
project moje-domki-6c77d (Firebase Authentication with Identity Platform).

What I am trying to do:
Set the action URL for the "Email address verification", "Password reset" and
"Email address change" templates to my own handler page:

    https://wynajempro.com/auth/action

This page is already live in production. It handles verifyEmail, resetPassword and
recoverEmail modes using the Firebase JS SDK, and it is part of my product's branding.
wynajempro.com is the canonical domain of the application, hosted on Firebase Hosting
in this same project.

What happens:
Saving in the Firebase console shows "An error occurred updating action URL".
The underlying request

    PATCH /v2/projects/moje-domki-6c77d/config?updateMask=notification.sendEmail.callbackUri

returns HTTP 400 with:

    EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED

What I have already verified:
- wynajempro.com IS present in the authorized domains list of this project.
- The domain is connected to Firebase Hosting in this project (site "wynajempro"),
  serving the production application over HTTPS.
- Reproduced in an incognito window with all browser extensions disabled.
- I am the project Owner, and the response is 400 (not 403), so this does not look like
  a permissions problem.

My questions:
1. Why is template/action URL customization disabled for this project?
2. What are the conditions for having this restriction lifted, and can you lift it for
   project moje-domki-6c77d?
3. If it cannot be lifted, please confirm that the only supported path is generating
   action links with the Admin SDK and sending them through my own email infrastructure,
   so I can plan accordingly.

Context: this is a small SaaS preparing for public launch. Today new users receive a
verification link pointing to moje-domki-6c77d.firebaseapp.com and land on the default
Google-branded page, which looks untrustworthy to customers who just signed up on
wynajempro.com. This is a trust issue for the product, not a cosmetic preference.

Thank you,
[Twoje imię i nazwisko]
Project: moje-domki-6c77d
```

## Czego się spodziewać

- Odpowiedź zwykle w ciągu kilku dni roboczych, po angielsku.
- Możliwe scenariusze: (a) zdejmą ograniczenie — wtedy wracamy do zlecenia #10 i klikamy
  action URL w trzech szablonach; (b) odmówią i wskażą Admin SDK — wtedy decyzja o własnej
  wysyłce poczty przestaje być opcjonalna; (c) poproszą o dodatkowe dane projektu.
- **Odpowiedź wklej mi w całości** — dopiszę wynik do dziennika i przestawię status zlecenia.

---

# Odpowiedź Google — 2026-08-25

> **Status wątku:** ✅ **ODPOWIEDŹ PRZYSZŁA** — scenariusz (a) i (b) naraz. Google **nie zdejmie
> ograniczenia szablonów**, ale **sam ustawi nam Action URL**, jeśli poprosimy. To wystarczy,
> żeby zamknąć zlecenie #10 w warstwie, która bolała najbardziej.

## Co napisał support (Casper, dosłownie — skrót merytoryczny)

1. Części szablonów e-mail **nie da się zmieniać** i to jest celowe — ochrona przed spamem
   i nadużywaniem maili autoryzacyjnych. Czyli `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED` to nie
   awaria naszego projektu, tylko polityka.
2. Ścieżka „pełna kontrola": Admin SDK generuje link akcji, my wstawiamy go we własny
   szablon HTML i wysyłamy własnym SMTP-em → [Generating Email Action Links](https://firebase.google.com/docs/auth/admin/email-action-links).
   To dokładnie nasz [[Projects/Roadmap]] X19.
3. 🔥 **Kluczowe zdanie:** „If this option doesn't fit your app's needs, **we can manually
   update the Action URL for you**." — z zastrzeżeniem, że idzie to przez ręczny przegląd
   i **może potrwać**. Casper czeka na nasze „tak".

## Rekomendacja: odpowiadamy „tak, proszę ustawić"

🎯 **Po co:** ręczne ustawienie Action URL załatwia problem, który zgłosił właściciel przy
smoke 4f — link w mailu przestaje prowadzić na `moje-domki-6c77d.firebaseapp.com`, a nowy
klient ląduje na naszej stronie `/auth/action`, po polsku i w identyfikacji WynajemPRO.
Koszt: zero linijek kodu, zero nowych podprocesorów, zero pracy `legal`.

🛡️ **Dlaczego nie od razu X19 (własna wysyłka):** Admin SDK to nie jest „ta sama rzecz, tylko
ładniej". To nowy dostawca poczty jako **podprocesor danych** → aktualizacja Polityki
prywatności i DPA przed uruchomieniem, do tego SPF/DKIM/DMARC i własne ryzyko dostarczalności
(nasz świeży domenowy nadawca trafia do spamu łatwiej niż Google). Branie tego na siebie na
kilka tygodni przed launchem to zamiana problemu estetycznego na problem „mail nie dochodzi".
X19 zostaje **po launchu** — i wtedy i tak nadpisze Action URL, więc te ścieżki się nie gryzą.

⚖️ **Czego ustawienie Action URL NIE załatwia:** treść maila dalej jest z szablonu Google —
zostaje literówka marki („WynajemPro" zamiast „WynajemPRO") i nadawca
`noreply@moje-domki-6c77d.firebaseapp.com`. Stąd pytanie 2 w odpowiedzi niżej.
📌 **Ale podpis `%APP_NAME%` da się poprawić samodzielnie** — bierze się z *Ustawienia projektu
→ Ogólne → Nazwa publiczna*, a to pole **nie jest** objęte blokadą szablonów. Warto sprawdzić,
zanim zapytamy o to support.

## Treść do wysłania (odpowiedz w tym samym wątku, po angielsku)

```
Subject: Re: Email template customization blocked — EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED (project moje-domki-6c77d)

Hi Casper,

Thank you for the clear answer. Yes, please proceed with the manual Action URL update.

Please set the action URL for project moje-domki-6c77d to:

    https://wynajempro.com/auth/action

This handler is already live in production. It handles the verifyEmail, resetPassword and
recoverEmail modes using the Firebase JS SDK. wynajempro.com is an authorized domain in this
project and is served by Firebase Hosting from the same project, so nothing else needs to
change on my side.

Two things I would like to confirm:

1. My understanding is that the action URL is a single project-level setting
   (notification.sendEmail.callbackUri), so one value covers the email verification,
   password reset and email address change templates. Please confirm — and if any template
   has to be set separately, please apply the same URL to all of them.

2. After the manual update, does EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED still apply to the rest
   of the template configuration (subject and body text)? I ask because the message body
   spells my product name incorrectly, and I need to know whether correcting that also has
   to go through support or stays unavailable for this project.

I did look at the Admin SDK option and it is on my roadmap, but it means adding an external
email provider as a data subprocessor, which brings GDPR paperwork I would rather not take on
right before launch. The manual action URL solves the immediate problem: today a user who has
just signed up on wynajempro.com receives a link to a domain that has nothing to do with the
product, and that reads as a phishing attempt.

Thank you for the help,
[Twoje imię i nazwisko]
Project: moje-domki-6c77d
```

## Co zrobić, kiedy Google potwierdzi ustawienie

1. **Rejestracja na świeży alias** (np. `wasyl515+akcja@gmail.com`) → sprawdź, dokąd prowadzi
   link w mailu. Ma być `wynajempro.com/auth/action?mode=verifyEmail&oobCode=…`.
2. Kliknij → ma się pokazać nasz ekran potwierdzenia, po polsku, i konto ma przejść w stan
   zweryfikowany (logowanie do panelu bez komunikatu o niepotwierdzonym adresie).
3. **Reset hasła** z ekranu logowania → ten sam ekran, tryb `resetPassword`, zmiana hasła
   przechodzi do końca.
4. Wynik zgłoś — wpis do [[Activity-Log]], domknięcie zlecenia #10, status X19 bez zmian.

⚠️ **Do sprawdzenia przy okazji punktu 1:** strona `/auth/action` pokazuje baner cookies na
pierwszym wejściu. Prawnie tak ma być, ale to pierwszy kontakt klienta z produktem po
rejestracji — warto zobaczyć na własne oczy, czy nie zasłania komunikatu o potwierdzeniu konta.

⚖️ **Znana luka, dziś bez skutków:** `AuthActionHandler` odpowiada na `recoverEmail`
komunikatem „funkcja niedostępna", a trybu `verifyAndChangeEmail` nie zna wcale. Aplikacja
**nie ma ekranu zmiany adresu e-mail**, więc Firebase tych maili nie wysyła i nikt na to nie
trafi. Gdyby zmiana adresu kiedyś powstała — to jest miejsce do uzupełnienia, zanim ruszy.
