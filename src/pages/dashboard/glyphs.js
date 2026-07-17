import {
  Zap, Droplets, Flame, ThermometerSun, SprayCan, ShoppingBag, Wrench, Wifi,
  Shield, CreditCard, Tag, BedDouble, House, Globe, Share2, Heart, Handshake,
} from 'lucide-react';

/*
  Ikony liniowe per kategoria kosztu i per źródło rezerwacji (X15) — zwracają
  referencje komponentów lucide (nie JSX → plik .js). Świadomie lucide, nie emoji:
  design system WynajemPRO ma udokumentowane „zero emoji"; ten sam język 1px co
  reszta panelu. Dopasowanie po słowie kluczowym (bez diakrytyków) obejmuje też
  kategorie własne i nietypowe nazwy źródeł. Kolor nadaje miejsce użycia (tokeny).
*/
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function categoryIcon(name) {
  const s = norm(name);
  if (/prad|energ|elektr/.test(s)) return Zap;
  if (/wod/.test(s)) return Droplets;
  if (/gaz/.test(s)) return Flame;
  if (/ogrzew|ciepl|klima|\bco\b/.test(s)) return ThermometerSun;
  if (/sprzat/.test(s)) return SprayCan;
  if (/srodki|czyst|chemia|higien|posciel|reczn/.test(s)) return ShoppingBag;
  if (/napraw|remont|serwis|awari|konserw/.test(s)) return Wrench;
  if (/internet|wifi|\bnet\b|telewiz|\btv\b/.test(s)) return Wifi;
  if (/ubezpiecz|polisa/.test(s)) return Shield;
  if (/abonament|subskryp|licenc|oprogram|prowizj|oplata|rata/.test(s)) return CreditCard;
  return Tag;
}

export function sourceIcon(name) {
  const s = norm(name);
  if (/booking/.test(s)) return BedDouble;
  if (/airbnb/.test(s)) return House;
  if (/nocowanie/.test(s)) return BedDouble;
  if (/facebook|\bfb\b|social|instagram|meta/.test(s)) return Share2;
  if (/strona|www|web|portal/.test(s)) return Globe;
  if (/polec|rekomend|znajom|stali|powracaj/.test(s)) return Heart;
  if (/bezposred|direct|osobis|telefon|mail/.test(s)) return Handshake;
  return Tag;
}
