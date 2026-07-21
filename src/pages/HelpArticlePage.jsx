import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { helpArticles } from '../data/helpArticles';
import { HELP_ICONS } from './helpIcons';
import { BrandStyles } from '../styles/brand';

function Block({ block }) {
  if (block.type === 'h2') return <h2>{block.content}</h2>;
  if (block.type === 'h3') return <h3>{block.content}</h3>;
  if (block.type === 'p') return <p>{block.content}</p>;
  if (block.type === 'list') return <ul>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  if (block.type === 'steps') return <ol>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ol>;
  if (block.type === 'faq') {
    return (
      <>
        {block.items.map((item, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>{item.q}</h3>
            <p style={{ marginBottom: 0 }}>{item.a}</p>
          </div>
        ))}
      </>
    );
  }
  return null;
}

export default function HelpArticlePage() {
  const { slug } = useParams();
  const index = helpArticles.findIndex((a) => a.slug === slug);
  const article = helpArticles[index];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!article) return <Navigate to="/pomoc" replace />;

  const Icon = HELP_ICONS[article.slug];
  const prev = helpArticles[index - 1];
  const next = helpArticles[index + 1];

  return (
    <div className="wpb">
      <BrandStyles />

      <header className="wpb-topbar">
        <div className="wpb-topbar__in">
          <Link to="/pomoc" className="wpb-back"><ArrowLeft /> <span>Wróć do Centrum pomocy</span></Link>
          <div className="wpb-topbar__nav">
            <Link to="/kontakt" className="wpb-link">Kontakt</Link>
            <Link to="/" className="wpb-logo">
              <span className="wpb-logo__word">Wynajem</span><span className="wpb-logo__pro">PRO</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="wpb-container wpb-narrow">
        <div className="wpb-head">
          <span className="wpb-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Icon && <Icon style={{ width: 14, height: 14 }} strokeWidth={1.5} aria-hidden="true" />} Pomoc
          </span>
          <h1 className="wpb-h1" style={{ fontSize: 36, margin: 0 }}>{article.title}</h1>
        </div>

        <article className="wpb-prose">
          {article.lead && <p className="wpb-lead" style={{ marginTop: 0, marginBottom: 26 }}>{article.lead}</p>}
          {article.blocks.map((block, i) => <Block key={i} block={block} />)}
        </article>

        {(prev || next) && (
          <nav className="wpb-hr" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', paddingTop: 24, marginTop: 32 }} aria-label="Kolejne artykuły pomocy">
            {prev ? (
              <Link to={`/pomoc/${prev.slug}`} className="wpb-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '48%' }}>
                <ArrowLeft style={{ width: 14, height: 14, flexShrink: 0 }} /> {prev.title}
              </Link>
            ) : <span />}
            {next && (
              <Link to={`/pomoc/${next.slug}`} className="wpb-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '48%', textAlign: 'right' }}>
                {next.title} <ArrowRight style={{ width: 14, height: 14, flexShrink: 0 }} />
              </Link>
            )}
          </nav>
        )}

        <div className="wpb-card" style={{ marginTop: 40, textAlign: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: 19, margin: '0 0 8px' }}>Ten artykuł nie rozwiązał sprawy?</h3>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 20px' }}>
            Napisz do nas — staramy się odpowiadać w ciągu 24–48 godzin roboczych.
          </p>
          <Link to="/kontakt" className="wpb-btn wpb-btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Mail style={{ width: 15, height: 15 }} /> Napisz do nas
          </Link>
        </div>
      </main>

      <footer className="wpb-footer">
        © {new Date().getFullYear()} WynajemPRO. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
