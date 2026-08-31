# Banery social i reklamowe — stały zestaw marki

Komplet formatów z handoffu identyfikacji v2 (C2 w [[Projects/Roadmap]]), wyeksportowany
z dokumentu `_design-reference/design_handoff_identyfikacja_v2/Identyfikacja WynajemPRO.dc.html`.

**Regeneracja:** `npm run banery:build` — skrypt `scripts/build-social-banners.mjs`
renderuje wszystko od nowa (także odcinki serii „NOWE W PANELU" z `../grafiki/src/`).
Świadome odstępstwa od dokumentu identyfikacji (znak W zamiast starych pasków,
nazewnictwo X24, strefa „Przesuń w górę" w story) są opisane w nagłówku skryptu —
to skrypt jest źródłem prawdy o tym, czym eksport różni się od dokumentu.

| Plik | Rozmiar | Gdzie tego używać |
|---|---|---|
| `og-data.png` | 1200 × 630 | podgląd linku podstron produktowych (og:image) |
| `ig-post.png` | 1080 × 1080 | post Instagram |
| `ig-story.png` | 1080 × 1920 | story Instagram; dolne 250 px wolne pod pasek „Przesuń w górę" |
| `fb-cover.png` | 1640 × 624 | cover strony Facebook |
| `fb-post.png` | 1080 × 1080 | post Facebook |
| `li-cover.png` | 1128 × 191 | cover strony LinkedIn; lewe 290 px puste — zasłania je awatar |
| `li-post.png` | 1200 × 627 | grafika do posta LinkedIn |
| `ad-300x250.png` | 300 × 250 | Google Ads kwadrat |
| `ad-160x600.png` | 160 × 600 | Google Ads pion (jedyny format z liczbą dowodową) |
| `ad-728x90.png` | 728 × 90 | Google Ads leaderboard |

**Czego tu celowo nie ma:**

- `og-typo` (baner OG strony głównej) = `public/og-image.png`, własny generator
  `npm run og:build` — bo jego podtytuł MUSI być zgodny z leadem hero landingu,
  a wersja w dokumencie identyfikacji niesie lead sprzed X24.
- Hero i pas CTA landingu — to C1: żywe sekcje HTML, nie obrazki.
- Wizytówka, papier firmowy, sygnatura — to C3: czekają na dane właściciela.
- Odcinki serii „NOWE W PANELU" — mieszkają w `../grafiki/` (datowane, per odcinek).

**Pułapki przy użyciu:**

- ⚠️ **`fb-cover` na telefonie jest przycinany do środkowych 820 × 312 px** — a projekt
  z handoffu trzyma logo i początek nagłówka POZA tym polem (dziedzictwo dokumentu,
  jego własny overlay pola bezpiecznego tego nie wyłapał). Na desktopie wygląda dobrze;
  jeśli po ustawieniu covera podgląd mobilny będzie ucinał tekst, format wymaga osobnej
  przeróbki projektowej, nie tylko re-eksportu.
- Story i cover FB są w wersji **typograficzno-danowej** (`photoSlots:false`), bo nie mamy
  licencjonowanych zdjęć obiektów. Handoff przewiduje warianty ze zdjęciem — gdy będą
  zdjęcia, wystarczy przestawić przełącznik w skrypcie i podłożyć pliki.
- Dane na banerach są **przykładowe** (Domek nad jeziorem, Apartament Centrum, Studio
  Rynek) i policzone spójnie (suma obiektów = zysk netto; ryczałt 8,5% × przychód).
  Zmieniasz jedną liczbę → przelicz pozostałe, bo ktoś to sprawdzi.
