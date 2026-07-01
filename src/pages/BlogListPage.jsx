import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import LegalLayout from './LegalLayout';

export default function BlogListPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <LegalLayout
      label="Baza wiedzy"
      title="Blog & Szkolenia"
      subtitle="Poradniki, triki i strategie dla gospodarzy wynajmu krótkoterminowego — automatyzuj swój biznes i zwiększaj zyski."
      bare
      wide
    >
      <div className="wpb-grid">
        {blogPosts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="wpb-post">
            <div className="wpb-post__cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: 20, color: 'var(--muted)', textAlign: 'center' }}>
                {post.category}
              </span>
            </div>
            <div className="wpb-post__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="wpb-tag">{post.category}</span>
                <span className="wpb-meta" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CalendarDays style={{ width: 12, height: 12 }} /> {post.date}
                </span>
                <span className="wpb-meta" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Clock style={{ width: 12, height: 12 }} /> {post.readTime}
                </span>
              </div>
              <h2 className="wpb-post__title">{post.title}</h2>
              <p className="wpb-post__excerpt">{post.excerpt}</p>
              <span className="wpb-post__more" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Czytaj dalej <ArrowRight style={{ width: 13, height: 13 }} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </LegalLayout>
  );
}
