#!/usr/bin/env bash
# PreToolUse (Bash) — twarda blokada `npm run deploy`.
#
# PO CO: w package.json `deploy` to `vite build && firebase deploy` BEZ `--only`.
# Jedno polecenie wypycha naraz hosting, reguły Firestore/Storage, functions i indeksy,
# omijając wszystkie bramki opisane przy N2, N3 i w skillu `deploy` (przegląd reguł,
# lustrzany tester, potwierdzenie właściciela). Skill tego zakazuje, ale skill to tekst —
# tu jest egzekwowanie.
#
# Blokada dotyczy WYŁĄCZNIE tego jednego skryptu. `firebase deploy --only ...` przechodzi.

set -uo pipefail

polecenie=$(jq -r '.tool_input.command // empty')
[ -n "$polecenie" ] || exit 0

# npm/pnpm/yarn + „run deploy" jako całe słowo (nie łapie deploy:app, gdyby kiedyś powstał)
if printf '%s' "$polecenie" | grep -Eq '(npm|pnpm|yarn)[[:space:]]+run[[:space:]]+deploy([[:space:]]|$|&|;|\|)'; then
  powod='`npm run deploy` to `vite build && firebase deploy` BEZ --only — jednym ruchem wypycha hosting, reguły, functions i indeksy naraz, omijając bramki z N2/N3 i ze skilla `deploy`. Użyj celu wprost, np. `firebase deploy --only hosting:app`.'
  jq -nc --arg r "$powod" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
fi

exit 0
