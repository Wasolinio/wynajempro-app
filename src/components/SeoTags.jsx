import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/*
  ── TAGI SEO PER TRASA ──
  Aplikacja jest SPA: jeden `index.html` serwowany pod każdym adresem. Statyczny
  <link rel="canonical"> w index.html wskazywałby więc stronę główną na KAŻDEJ podstronie,
  czyli mówiłby Google nieprawdę. Ten komponent (nic nie renderuje, działa jak
  AnalyticsTracker) utrzymuje w <head> aktualne dla bieżącej ścieżki:
    • <link rel="canonical">   — adres kanoniczny na domenie wynajempro.com,
    • <meta property="og:url"> — ten sam adres dla podglądów w social media,
    • <meta name="robots">     — noindex na stronach, których nie chcemy w wynikach.

  Ograniczenie do zapamiętania: tagi wstrzykuje JavaScript, więc widzi je dopiero
  robot renderujący stronę (Googlebot renderuje, część botów nie). Twarde rozwiązanie
  to prerender/SSG początkowego HTML-a — decyzja architektoniczna poza warstwą SEO.
*/

// Domena kanoniczna — decyzja właściciela (2026-07-21): .com, bez www.
export const CANONICAL_ORIGIN = 'https://wynajempro.com';

/*
  Ścieżki wyłączone z indeksowania:
  • /login, /reset-password, /auth — ekrany procesu logowania: zero wartości w wynikach
    wyszukiwania, a w SPA dostałyby tytuł i opis strony głównej (duplikat).
  • /guide, /opinie — publiczne strony per obiekt/gość udostępniane linkiem przez
    gospodarza (hasło WiFi, kod do drzwi, treści dla konkretnego pobytu). Nie mają
    prawa trafić do wyszukiwarki.
  • /dashboard — panel za logowaniem.
  Lustrzana reguła po stronie serwera dla /guide/** i /opinie/**: nagłówek X-Robots-Tag
  w firebase.json — działa niezależnie od tego, czy bot wykona JavaScript.
*/
const NOINDEX_PREFIXES = ['/login', '/reset-password', '/auth', '/guide', '/opinie', '/dashboard'];

// Normalizacja: bez końcowego ukośnika (poza korzeniem), bez query stringu i kotwicy —
// /blog/, /blog?ref=fb i /blog#top to dla wyszukiwarki ten sam adres kanoniczny /blog.
const normalizePath = (pathname) => {
  if (!pathname) return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

const isNoindex = (path) => NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

// Znajdź tag w <head> albo go utwórz (idempotentne — bezpieczne przy podwójnym
// wywołaniu efektu w StrictMode).
const upsertTag = (selector, createTag) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = createTag();
    document.head.appendChild(tag);
  }
  return tag;
};

export default function SeoTags() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const url = `${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`;
    const noindex = isNoindex(path);

    // canonical — tylko dla stron, które mają być indeksowane
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (noindex) {
      if (canonical) canonical.remove();
    } else {
      const tag = canonical || upsertTag('link[rel="canonical"]', () => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        return link;
      });
      tag.setAttribute('href', url);
    }

    // og:url — zawsze rzeczywisty adres bieżącej strony na domenie kanonicznej
    upsertTag('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    }).setAttribute('content', url);

    // meta robots — dodawany tylko tam, gdzie blokujemy indeksowanie
    const robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      const tag = robots || upsertTag('meta[name="robots"]', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        return meta;
      });
      tag.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }
  }, [pathname]);

  return null;
}
