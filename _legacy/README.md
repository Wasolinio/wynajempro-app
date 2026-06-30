# 📦 _legacy — kod archiwalny

Ten folder zawiera **starsze, nieużywane wersje** kodu, zachowane wyłącznie jako referencja.
**Nic tutaj nie wchodzi do builda produkcyjnego** — żaden plik z `src/` ani `App.jsx` tego nie importuje.
Folder jest też wyłączony z ESLint (`eslint.config.js → globalIgnores`).

> ⚠️ Import-ścieżki wewnątrz tych plików mogą być nieaktualne (odwołują się do struktury sprzed
> porządkowania). To zamrożone snapshoty — nie naprawiamy ich, nie używamy w produkcji.

## Co tu jest i dlaczego

| Folder | Zawartość | Powód archiwizacji |
|--------|-----------|--------------------|
| `dashboard-original/` | Pierwszy panel zarządzania (`ManagerApp.jsx`) + jego komponenty (`modals/`, `views/`, `StatCard`, `TaxSummaryPanel`, `CalendarView`, `GuideBuilder`, `AddRentalModal`, `utils/accountingExport`) | Zastąpiony przez nowy panel w `src/pages/dashboard/`. **Logika biznesowa została przeniesiona 1:1** do nowej wersji — to tylko stara warstwa UI (Tailwind/slate). |
| `dashboard-gemini/` | Wersja panelu zrobiona przez Gemini (`dashboard_v4/`) | Wczesna, równoległa przebudowa. Niewybrana. |
| `landing-prototypes/` | Stary landing produkcyjny (`LandingPage.jsx`, `LoginPanel.jsx`) + prototypy (`landing_v2`, `landing_v3`, `landing_apple`) + `RoiCalculator` | Zastąpione przez `src/pages/landing/` (identyfikacja v2). |

## Wersja produkcyjna (żywa) żyje w:
- `src/pages/landing/` — landing + logowanie
- `src/pages/dashboard/` — panel zarządzania
- `src/components/` — współdzielone, wciąż używane komponenty (ConsentNotice, PaywallScreen, CompleteProfileScreen, FloatingTaskWidget)

Jeśli któryś z tych plików nie będzie już potrzebny jako referencja — można go bezpiecznie usunąć.
