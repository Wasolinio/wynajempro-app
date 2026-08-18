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
