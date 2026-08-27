/**
 * Strażnik zgłoszeń: co kilka godzin sprawdza, czy w `contact_messages` pojawiły się
 * nowe dokumenty, i powiadamia właściciela natywnym powiadomieniem macOS.
 *
 * PO CO: kanał wsparcia jest zawieszony dla danych osobowych (2026-08-26 — plan Claude
 * konsumencki, bez DPA), więc zgłoszenia czyta wyłącznie właściciel w panelu /admin.
 * Ten skrypt daje mu sygnał „jest coś nowego" BEZ dotykania treści:
 *   - rozmawia bezpośrednio z serwerem `firebase mcp` (auth = zalogowane firebase CLI),
 *   - pobiera listę z MASKĄ PÓL `createdAt, source, adminStatus` — identyfikatory
 *     dokumentów są automatyczne, więc odpowiedź nie zawiera ŻADNYCH danych osobowych,
 *   - niczego nie wysyła do żadnego modelu ani usługi poza Firestore.
 *
 * Uruchamianie: LaunchAgent `com.wynajempro.msgcheck` (co 3 h, 07:47–22:47) albo ręcznie:
 *   node scripts/check-messages.mjs            — normalny przebieg
 *   node scripts/check-messages.mjs --baseline — ustaw stan na „teraz" bez powiadomienia
 *
 * Stan (znacznik czasu ostatnio widzianego zgłoszenia) żyje poza repo:
 *   ~/.claude/projects/-Users-wasolinio-Desktop-WynajemPRO-App/msgcheck-state.json
 * Pierwszy przebieg bez pliku stanu zachowuje się jak --baseline (nie straszy zaległościami).
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATE_DIR = join(homedir(), '.claude', 'projects', '-Users-wasolinio-Desktop-WynajemPRO-App');
const STATE_FILE = join(STATE_DIR, 'msgcheck-state.json');
const LOG_FILE = join(homedir(), 'Library', 'Logs', 'wynajempro-msgcheck.log');
const PARENT = 'projects/moje-domki-6c77d/databases/(default)/documents';

const log = (msg) => {
  const line = `${new Date().toISOString()} ${msg}\n`;
  try { appendFileSync(LOG_FILE, line); } catch { /* log nie może wywrócić przebiegu */ }
};

function readState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}
function writeState(state) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/** Jedno wywołanie narzędzia przez MCP stdio (JSON-RPC, komunikaty rozdzielane \n). */
function mcpCall(toolName, args) {
  return new Promise((resolve, reject) => {
    // process.execPath zamiast bin-shima: launchd ma minimalny PATH i shebang
    // `#!/usr/bin/env node` nie znajduje node'a — pełna ścieżka jest odporna.
    const child = spawn(process.execPath,
      [join(ROOT, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js'),
        'mcp', '--tools', 'firestore_list_documents'], { cwd: ROOT });
    const timer = setTimeout(() => { child.kill(); reject(new Error('timeout MCP (60s)')); }, 60000);

    let buf = '';
    const send = (obj) => child.stdin.write(JSON.stringify(obj) + '\n');
    child.stdout.on('data', (d) => {
      buf += d.toString();
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
        if (!line.trim()) continue;
        let msg; try { msg = JSON.parse(line); } catch { continue; }
        if (msg.id === 1) { // initialize -> initialized -> call
          send({ jsonrpc: '2.0', method: 'notifications/initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: toolName, arguments: args } });
        } else if (msg.id === 2) {
          clearTimeout(timer); child.kill();
          if (msg.error) return reject(new Error(JSON.stringify(msg.error)));
          resolve(msg.result);
        }
      }
    });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
      protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'wynajempro-msgcheck', version: '1.0' } } });
  });
}

function notify(title, body) {
  const esc = (s) => s.replace(/["\\]/g, '');
  spawn('/usr/bin/osascript', ['-e',
    `display notification "${esc(body)}" with title "${esc(title)}" sound name "Glass"`]);
}

const baselineOnly = process.argv.includes('--baseline');

try {
  const result = await mcpCall('firestore_list_documents', {
    parent: PARENT,
    collectionId: 'contact_messages',
    mask: { fieldPaths: ['createdAt', 'source', 'adminStatus'] },
    orderBy: 'createdAt desc',
    pageSize: 25,
  });

  // Wynik narzędzia przychodzi jako content[0].text z JSON-em w środku.
  const payload = JSON.parse(result?.content?.[0]?.text ?? '{}');
  const docs = (payload.documents ?? []).map((d) => ({
    createdAt: d.fields?.createdAt?.timestampValue ?? d.createTime,
    source: d.fields?.source?.stringValue ?? '',
  })).filter((d) => d.createdAt);

  const newest = docs.reduce((a, d) => (d.createdAt > a ? d.createdAt : a), '');
  const state = readState();

  if (baselineOnly || !state) {
    writeState({ lastSeenCreatedAt: newest || new Date().toISOString() });
    log(`baseline ustawiony na ${newest || 'teraz'} (dokumentów w oknie: ${docs.length})`);
    process.exit(0);
  }

  const fresh = docs.filter((d) => d.createdAt > state.lastSeenCreatedAt);
  const realne = fresh.filter((d) => d.source !== 'kontakt-test').length;
  const testowe = fresh.length - realne;

  if (fresh.length === 0) {
    log('bez zmian');
    process.exit(0);
  }

  const czesci = [];
  if (realne) czesci.push(`${realne} ${realne === 1 ? 'nowe zgłoszenie' : 'nowe zgłoszenia'}`);
  if (testowe) czesci.push(`${testowe} testowe`);
  notify('WynajemPRO — zgłoszenia', `${czesci.join(' + ')}. Otwórz panel /admin.`);
  log(`powiadomienie: ${czesci.join(' + ')} (nowy znacznik: ${newest})`);
  writeState({ lastSeenCreatedAt: newest });
} catch (err) {
  log(`BŁĄD: ${err.message}`);
  // Awaria sprawdzenia też zasługuje na sygnał — cisza wyglądałaby jak „brak zgłoszeń".
  notify('WynajemPRO — strażnik zgłoszeń', `Sprawdzenie nie powiodło się: ${String(err.message).slice(0, 80)}`);
  process.exit(1);
}
