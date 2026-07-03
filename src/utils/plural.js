/* Polska odmiana rzeczownika po liczebniku: plural(3, ['doba', 'doby', 'dób']) → 'doby' */
export const plural = (n, [f1, f24, f5]) => {
  if (n === 1) return f1;
  const t = n % 100; const o = n % 10;
  return o >= 2 && o <= 4 && !(t >= 12 && t <= 14) ? f24 : f5;
};
