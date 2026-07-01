import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { BrandStyles } from '../styles/brand';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="wpb">
      <BrandStyles />

      <header className="wpb-topbar">
        <div className="wpb-topbar__in">
          <Link to="/blog" className="wpb-back"><ArrowLeft /> <span>Wróć do Bazy Wiedzy</span></Link>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className="wpb-tag wpb-accent" style={{ color: 'var(--cynober)' }}>{post.category}</span>
            <span className="wpb-meta" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CalendarDays style={{ width: 13, height: 13 }} /> {post.date}
            </span>
            <span className="wpb-meta" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Clock style={{ width: 13, height: 13 }} /> {post.readTime}
            </span>
          </div>
          <h1 className="wpb-h1" style={{ fontSize: 36, margin: 0 }}>{post.title}</h1>
        </div>

        <article className="wpb-prose">
          <p className="wpb-lead" style={{ marginTop: 0, marginBottom: 26 }}>{post.excerpt}</p>
          {post.blocks.map((block, index) => {
            if (block.type === 'h2') return <h2 key={index}>{block.content}</h2>;
            if (block.type === 'p') return <p key={index}>{block.content}</p>;
            if (block.type === 'list') {
              return <ul key={index}>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
            }
            return null;
          })}
        </article>

        <div className="wpb-card" style={{ marginTop: 40, textAlign: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: 19, margin: '0 0 8px' }}>Chcesz wdrożyć tę wiedzę w życie?</h3>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 20px' }}>
            Rozpocznij darmowy test WynajemPRO i zautomatyzuj swój biznes już dziś.
          </p>
          <Link to="/login" className="wpb-btn wpb-btn--primary">Wypróbuj za darmo</Link>
        </div>
      </main>

      <footer className="wpb-footer">
        © {new Date().getFullYear()} WynajemPRO. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
