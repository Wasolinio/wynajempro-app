import React from 'react';
import { Navigate } from 'react-router-dom';
import LegalLayout from './LegalLayout';
import { legalDocs } from '../data/legalDocs';

/*
  Strony /regulamin, /prywatnosc i /dpa renderują dokumenty z src/data/legalDocs.js —
  pliku GENEROWANEGO z docs/legal/*.md (npm run legal:build). Treści nie edytuje się
  tutaj ani w pliku danych: źródłem prawdy jest markdown, który przeszedł ocenę prawną.
  Poprzednie, ręcznie pisane wersje stron (rozjechane ze źródłem) leżą w /_legacy.
*/

// Inline'owy podzbiór markdowna używany przez dokumenty: **b**, *i*, `code`, [t](url).
const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text) {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={i} href={link[2]}>{link[1]}</a>;
    return part;
  });
}

function Block({ block }) {
  switch (block.type) {
    case 'h2': return <h2>{renderInline(block.content)}</h2>;
    case 'h3': return <h3>{renderInline(block.content)}</h3>;
    case 'p': return <p>{renderInline(block.content)}</p>;
    case 'hr': return <hr className="wpb-prose-hr" />;
    case 'ul':
      return <ul>{block.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}</ul>;
    case 'ol':
      return (
        <ol>
          {block.items.map((it, i) => (
            <li key={i} value={it.start}>
              {renderInline(it.text)}
              {it.sub && <ul>{it.sub.map((sb, j) => <li key={j}>{renderInline(sb)}</li>)}</ul>}
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="wpb-prose-quote">
          {block.items.map((line, i) => <p key={i}>{renderInline(line)}</p>)}
        </blockquote>
      );
    case 'table':
      return (
        <div className="wpb-tablewrap">
          <table>
            <thead>
              <tr>{block.header.map((c, i) => <th key={i}>{renderInline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>{row.map((c, j) => <td key={j}>{renderInline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

/*
  Wejście do wycofania zgody na cookies (N6.1, RODO art. 7 ust. 3 — „równie łatwo, jak jej
  udzielić"). Polityka opisuje mechanizm w sekcji o cookies; przycisk jest elementem strony,
  nie treści dokumentu, dlatego renderer wstrzykuje go na końcu tej sekcji zamiast trzymać
  go w markdownie. Zdarzenie wpc:open obsługuje ConsentNotice.
*/
function ConsentButton() {
  return (
    <p>
      <button type="button" className="wpb-btn" onClick={() => window.dispatchEvent(new Event('wpc:open'))}>
        Zmień lub wycofaj zgodę na cookies
      </button>
    </p>
  );
}

export default function LegalDocPage({ slug }) {
  const doc = legalDocs.find((d) => d.slug === slug);
  if (!doc) return <Navigate to="/" />;

  // Koniec sekcji cookies = początek następnego h2 po nagłówku zaczynającym się od „9.".
  let consentAt = -1;
  if (slug === 'prywatnosc') {
    const cookieIdx = doc.blocks.findIndex((b) => b.type === 'h2' && b.content.startsWith('9.'));
    consentAt = doc.blocks.findIndex((b, i) => i > cookieIdx && b.type === 'h2');
    if (cookieIdx === -1) consentAt = -1;
  }

  const meta = [
    doc.version && `Wersja ${doc.version}`,
    `Obowiązuje od: ${doc.effective || 'zostanie podana w dniu publikacji'}`,
  ].filter(Boolean).join(' · ');

  return (
    <LegalLayout title={doc.title} subtitle={doc.subtitle} meta={meta} label={doc.label}>
      {doc.blocks.map((block, i) => (
        <React.Fragment key={i}>
          {i === consentAt && <ConsentButton />}
          <Block block={block} />
        </React.Fragment>
      ))}
      {consentAt === doc.blocks.length && <ConsentButton />}
    </LegalLayout>
  );
}
