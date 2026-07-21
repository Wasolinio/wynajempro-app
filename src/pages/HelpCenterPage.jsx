import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { helpArticles } from '../data/helpArticles';
import { HELP_ICONS } from './helpIcons';
import LegalLayout from './LegalLayout';

export default function HelpCenterPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <LegalLayout
      label="Pomoc"
      title="Centrum pomocy"
      subtitle="Krótkie, praktyczne instrukcje do wszystkich części systemu. Każdy artykuł prowadzi krok po kroku i kończy się odpowiedziami na najczęstsze pytania."
      bare
      wide
    >
      <div className="wpb-grid">
        {helpArticles.map((article) => {
          const Icon = HELP_ICONS[article.slug];
          return (
            <Link key={article.slug} to={`/pomoc/${article.slug}`} className="wpb-post">
              <div className="wpb-post__cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icon && <Icon style={{ width: 30, height: 30, color: 'var(--muted)' }} strokeWidth={1} aria-hidden="true" />}
              </div>
              <div className="wpb-post__body">
                <h2 className="wpb-post__title">{article.title}</h2>
                <p className="wpb-post__excerpt">{article.excerpt}</p>
                <span className="wpb-post__more" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Czytaj <ArrowRight style={{ width: 13, height: 13 }} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="wpb-card" style={{ marginTop: 40, textAlign: 'center' }}>
        <h3 style={{ fontWeight: 700, fontSize: 19, margin: '0 0 8px' }}>Nie znajdujesz odpowiedzi?</h3>
        <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 20px' }}>
          Napisz do nas — staramy się odpowiadać w ciągu 24–48 godzin roboczych.
        </p>
        <Link to="/kontakt" className="wpb-btn wpb-btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Mail style={{ width: 15, height: 15 }} /> Napisz do nas
        </Link>
      </div>
    </LegalLayout>
  );
}
