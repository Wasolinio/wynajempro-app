import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Wifi, Key, BookOpen, Navigation, ExternalLink, Copy, CheckCircle2, AlertCircle, ChevronLeft, Download, FileText, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestGuideView() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const docRef = doc(db, 'guides', guideId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setGuide(docSnap.data());
        } else {
          setError("Ten przewodnik nie istnieje lub został usunięty.");
        }
      } catch (err) {
        console.error("Błąd ładowania przewodnika:", err);
        setError("Wystąpił błąd podczas ładowania przewodnika. Spróbuj ponownie później.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka!', { position: 'top-center' });
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Ładowanie przewodnika...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">Brak Dostępu</h1>
          <p className="text-slate-500 text-sm">{error || "Przewodnik nie został odnaleziony."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* HEADER / COVER */}
      <div className="w-full relative flex flex-col items-center justify-center pt-8 pb-12 px-4 bg-gradient-to-br from-slate-100 to-slate-200 border-b border-slate-200 shadow-sm">
        {guide.coverImage ? (
          <img src={guide.coverImage} alt={guide.name} className="w-11/12 max-w-md aspect-video object-cover rounded-2xl shadow-lg border border-white/50 mb-6" />
        ) : (
          <div className="w-11/12 max-w-md aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl shadow-lg border border-white/50 flex items-center justify-center mb-6">
            <Home className="w-16 h-16 text-slate-400 opacity-50" />
          </div>
        )}
        
        <div className="text-center w-11/12 max-w-md">
           {guide.propertyId && (
             <span className="inline-block bg-white shadow-sm border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
               {guide.propertyId}
             </span>
           )}
           <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
             {guide.name}
           </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 relative z-10 space-y-4">
        
        {/* WIFI & DOORS (QUICK ACCESS) */}
        {(guide.wifiNetwork || guide.doorPin) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {guide.wifiNetwork && (
              <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-slate-800">Sieć Wi-Fi</h2>
                  </div>
                  <div className="text-sm text-slate-500 mb-1">Sieć: <span className="font-bold text-slate-800">{guide.wifiNetwork}</span></div>
                  {guide.wifiPassword && (
                    <div className="text-sm text-slate-500">Hasło: <span className="font-mono font-bold text-slate-800">{guide.wifiPassword}</span></div>
                  )}
                </div>
                {guide.wifiPassword && (
                  <button onClick={() => copyToClipboard(guide.wifiPassword, setCopiedWifi)} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${copiedWifi ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}>
                    {copiedWifi ? <><CheckCircle2 className="w-4 h-4" /> Skopiowano</> : <><Copy className="w-4 h-4" /> Kopiuj Hasło</>}
                  </button>
                )}
              </div>
            )}

            {guide.doorPin && (
              <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-slate-800">Dostęp</h2>
                  </div>
                  <div className="text-sm text-slate-500 mb-1">Kod do drzwi:</div>
                  <div className="text-2xl tracking-[0.2em] font-mono font-black text-slate-800">{guide.doorPin}</div>
                </div>
                <button onClick={() => copyToClipboard(guide.doorPin, setCopiedPin)} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${copiedPin ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}>
                  {copiedPin ? <><CheckCircle2 className="w-4 h-4" /> Skopiowano</> : <><Copy className="w-4 h-4" /> Kopiuj Kod</>}
                </button>
              </div>
            )}
            
          </div>
        )}

        {/* CHECK-IN INSTRUCTIONS */}
        {guide.checkInInfo && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              Wskazówki Dotarcia i Zameldowania
            </h2>
            <div className="prose prose-slate prose-sm sm:prose-base whitespace-pre-wrap text-slate-600 leading-relaxed">
              {guide.checkInInfo}
            </div>
          </div>
        )}

        {/* HOUSE RULES */}
        {(guide.houseRules || guide.houseRulesFile) && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-500" />
              Ważne Zasady / Regulamin
            </h2>
            {guide.houseRules && (
              <div className="prose prose-slate prose-sm sm:prose-base whitespace-pre-wrap text-slate-600 leading-relaxed mb-4">
                {guide.houseRules}
              </div>
            )}
            
            {guide.houseRulesFile && (
              <a href={guide.houseRulesFile.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-rose-500 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-800 truncate">Pobierz Regulamin Obiektu</h3>
                  <p className="text-xs text-slate-500 truncate">{guide.houseRulesFile.name}</p>
                </div>
                <Download className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </a>
            )}
          </div>
        )}

        {/* ATTRACTIONS */}
        {guide.attractions && guide.attractions.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-500" />
              Polecane Miejsca
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.attractions.map((attr, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base mb-1">{attr.name}</h3>
                  {attr.description && <p className="text-sm text-slate-500 mb-4 line-clamp-3">{attr.description}</p>}
                  {attr.link && (
                    <a href={attr.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      Sprawdź <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-slate-400 font-medium">Stworzono za pomocą WynajemPRO</p>
        </div>

      </div>
    </div>
  );
}
