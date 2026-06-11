import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            to="/blog" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do Bazy Wiedzy
          </Link>
          <Link to="/" className="flex items-center gap-2 font-black text-slate-800 text-lg tracking-tight">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Wynajem<span className="text-blue-600">PRO</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          {/* Header (Banner) */}
          <div className={`h-48 md:h-64 w-full ${post.image} flex items-end p-6 md:p-10 relative`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 w-full">
               <div className="flex items-center gap-3 text-xs font-bold text-white/80 mb-3">
                 <span className="bg-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm text-white">{post.category}</span>
                 <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {post.date}</span>
                 <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime}</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                 {post.title}
               </h1>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-10">
            <div className="prose prose-slate prose-blue max-w-none prose-headings:font-extrabold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:font-medium prose-p:leading-relaxed prose-li:font-medium">
               <p className="text-lg md:text-xl text-slate-500 font-medium mb-8 leading-relaxed">
                 {post.excerpt}
               </p>
               
               {post.blocks.map((block, index) => {
                 if (block.type === 'h2') {
                   return <h2 key={index} className="text-2xl font-extrabold text-slate-900 mt-10 mb-4">{block.content}</h2>;
                 }
                 if (block.type === 'p') {
                   return <p key={index} className="text-slate-600 font-medium leading-relaxed mb-6">{block.content}</p>;
                 }
                 if (block.type === 'list') {
                   return (
                     <ul key={index} className="list-disc pl-5 space-y-2 mb-6 text-slate-600 font-medium">
                       {block.items.map((item, i) => <li key={i}>{item}</li>)}
                     </ul>
                   );
                 }
                 return null;
               })}
            </div>

            {/* Call to Action CTA */}
            <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Chcesz wdrożyć tę wiedzę w życie?</h3>
              <p className="text-slate-600 font-medium mb-6">Rozpocznij darmowy test WynajemPRO i zautomatyzuj swój biznes już dziś.</p>
              <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                Wypróbuj za darmo
              </Link>
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-6">
          © {new Date().getFullYear()} WynajemPRO. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
