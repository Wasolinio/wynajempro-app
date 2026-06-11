import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export default function BlogListPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do strony głównej
          </Link>
          <div className="flex items-center gap-2 font-black text-slate-800 text-lg tracking-tight">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Wynajem<span className="text-blue-600">PRO</span> Baza Wiedzy
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Blog & Szkolenia
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Poradniki, triki i strategie dla gospodarzy wynajmu krótkoterminowego. Naucz się automatyzować swój biznes i zwiększać zyski.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              <div className={`h-48 w-full ${post.image} flex items-center justify-center p-6 relative overflow-hidden`}>
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                 <h3 className="text-white font-extrabold text-xl text-center relative z-10">{post.title}</h3>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-4">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{post.category}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-slate-600 text-sm font-medium leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  Czytaj dalej <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-6">
          © {new Date().getFullYear()} WynajemPRO. Baza wiedzy dla gospodarzy.
        </div>
      </footer>
    </div>
  );
}
