import { Compass, RefreshCw, List, BarChart3, BookOpen, Star, CreditCard, LifeBuoy } from 'lucide-react';

/**
 * Ikona artykułu pomocy per slug. Tam, gdzie artykuł opisuje moduł panelu, celowo
 * powtarzamy ikonę z nawigacji (`ManagerApp.NAV`) — użytkownik widzi ten sam znak
 * w pomocy i w aplikacji. Zero emoji, ikony liniowe lucide (decyzja z X15).
 *
 * Mapa jest osobno od danych, bo `helpArticles.js` jest generowany z markdownu
 * i ma zostać czystą treścią.
 */
export const HELP_ICONS = {
  'pierwsze-kroki': Compass,
  'synchronizacja-ical': RefreshCw,
  'rezerwacje-koszty-zadania': List,
  'finanse-i-raporty': BarChart3,
  'przewodnik-goscia': BookOpen,
  'strona-opinii': Star,
  'konto-i-subskrypcja': CreditCard,
  'rozwiazywanie-problemow': LifeBuoy,
};
