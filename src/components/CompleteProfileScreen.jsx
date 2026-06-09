import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CompleteProfileScreen({ user, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    identifierType: 'NIP',
    taxIdentifier: '',
    address: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'hostProfile'), {
        entityName: formData.name,
        identifierType: formData.identifierType,
        taxIdentifier: formData.taxIdentifier,
        address: formData.address,
        phone: formData.phone,
        email: user.email
      });
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Błąd podczas zapisywania profilu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-[#f8fafc] dark:bg-slate-900 relative selection:bg-blue-200">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-violet-600/10 dark:bg-violet-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none transform-gpu will-change-transform"></div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-500/20">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Dokończ konfigurację konta</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aby w pełni korzystać z narzędzi księgowych, musimy poznać podstawowe dane Twojej działalności.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pełna nazwa podmiotu / Imię i Nazwisko</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-900/50" placeholder="np. Domki Letniskowe Ruś" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Identyfikator</label>
                  <select name="identifierType" value={formData.identifierType} onChange={handleChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
                    <option value="NIP">NIP</option>
                    <option value="PESEL">PESEL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nr NIP / PESEL</label>
                  <input type="text" name="taxIdentifier" required value={formData.taxIdentifier} onChange={handleChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-900/50" placeholder="1234567890" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Adres</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-900/50" placeholder="Ulica, Miasto" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Telefon</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-900/50" placeholder="123 456 789" />
                </div>
              </div>

              <button type="submit" disabled={isLoading || !formData.name || !formData.taxIdentifier} className="w-full mt-8 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Zapisz i przejdź do aplikacji <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
