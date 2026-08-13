#!/usr/bin/env bash
# PostToolUse (Edit|Write) — ESLint na świeżo zapisanym pliku aplikacji.
#
# PO CO: konfiguracja projektu ma `--max-warnings 0`, więc ostrzeżenie jest błędem,
# a dowiadywaliśmy się o nim dopiero przed commitem albo przed deployem. Tu wraca
# natychmiast, przy pliku, który jeszcze mamy w głowie.
#
# Zakres celowo wąski: tylko src/**/*.{js,jsx}. Skrypty, testy e2e i konfiguracja
# mają własne reguły, a lintowanie każdego dotkniętego markdowna byłoby hałasem.
#
# Wyjście 2 = błąd blokujący: treść ze stderr wraca do agenta jako informacja zwrotna.

set -uo pipefail

plik=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$plik" ] || exit 0

case "$plik" in
  */src/*.js|*/src/*.jsx) ;;
  *) exit 0 ;;
esac

[ -f "$plik" ] || exit 0

katalog=$(cd "$(dirname "$plik")" && git rev-parse --show-toplevel 2>/dev/null) || exit 0

if ! wynik=$(cd "$katalog" && npx --no-install eslint "$plik" 2>&1); then
  echo "ESLint zgłasza uwagi do $(basename "$plik") — projekt ma --max-warnings 0, więc to blokuje build:" >&2
  echo "$wynik" >&2
  exit 2
fi

exit 0
