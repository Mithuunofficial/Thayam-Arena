import React from 'react';
import { Play, BookOpen, Award, Languages, Sun, Moon, LogOut } from 'lucide-react';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import { useAuth } from '../supabase/AuthContext';
import { useRouter } from './Router';

interface LandingPageProps {
  onPlayNow: () => void;
  lang: Language;
  onLanguageToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayNow,
  lang,
  onLanguageToggle,
  theme,
  onThemeToggle
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();

  return (
    <div 
      className="min-h-screen text-stone-850 dark:text-stone-200 selection:bg-amber-100 dark:selection:bg-amber-950 flex flex-col font-sans select-none transition-colors duration-300"
      style={
        isDark
          ? {
              backgroundColor: '#120F0D',
              backgroundImage: 'radial-gradient(circle at center, #1C1714 0%, #0D0B0A 100%)'
            }
          : {
              backgroundColor: '#FAF8F5',
              backgroundImage: 'radial-gradient(circle at center, #FFFFFF 0%, #F5EFEB 100%)'
            }
      }
    >
      
      {/* 1. Header (Navbar) */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-stone-950/95 backdrop-blur border-b-4 border-amber-900 dark:border-amber-700 px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <img src="/Thayam-logo.png" alt="Thayam Logo" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-serif text-lg font-black tracking-widest text-amber-950 dark:text-amber-100 block leading-none">
              {t.title}
            </span>
            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-bold tracking-widest uppercase mt-0.5 block">
              {t.subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Authenticated user profile badge */}
          {user && (
            <button 
              onClick={() => navigate('/profile')}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFF0C2] to-[#F5B041] flex items-center justify-center text-black font-extrabold text-[9px] shadow-[0_0_4px_#F5B041] select-none">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 font-sans tracking-wide">
                {user.displayName} (🪙 {user.coins ?? 1000})
              </span>
            </button>
          )}

          <button 
            onClick={onLanguageToggle}
            className="flex items-center space-x-1 px-3 py-1.5 border border-amber-900/30 dark:border-amber-700/50 hover:border-amber-950 dark:hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase transition"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          <button 
            onClick={onThemeToggle}
            className="p-1.5 border border-amber-900/30 dark:border-amber-700/50 hover:border-amber-950 dark:hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl text-amber-900 dark:text-amber-100 transition"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={onPlayNow}
            className="font-bold text-xs tracking-wider bg-amber-900 dark:bg-amber-800 hover:bg-amber-850 dark:hover:bg-amber-750 text-amber-50 px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 uppercase"
          >
            {t.playOnline}
          </button>

          {user ? (
            /* Secure Logout CTA */
            <button 
              onClick={() => signOut()}
              className="p-1.5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/5 rounded-xl text-red-700 dark:text-red-400 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          ) : (
            /* Sign In CTA */
            <button
              onClick={() => navigate('/auth/signin')}
              className="text-xs font-bold tracking-wider border border-amber-900/30 dark:border-amber-700/50 hover:border-amber-950 dark:hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-stone-900 px-4 py-2.5 rounded-xl transition text-amber-900 dark:text-amber-100 uppercase cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative px-6 py-12 md:py-20 flex items-center justify-center overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{
               backgroundImage: isDark ? 'radial-gradient(#d97706 2px, transparent 2px)' : 'radial-gradient(#78350f 2px, transparent 2px)',
               backgroundSize: '30px 30px'
             }} 
        />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Description */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-600/20 bg-amber-500/5">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-amber-800 dark:text-amber-400 uppercase">
                {t.classicBattleArena}
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-6xl font-black leading-tight text-amber-950 dark:text-amber-100">
              {t.title}
            </h1>
            <p className="font-serif text-lg sm:text-xl tracking-wider text-amber-850 dark:text-amber-300 font-bold">
              {t.subtitle}
            </p>
            
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed max-w-lg">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={onPlayNow}
                className="flex items-center space-x-2 font-bold text-xs tracking-wider bg-amber-900 dark:bg-amber-800 hover:bg-amber-850 dark:hover:bg-amber-700 text-amber-50 px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 uppercase"
              >
                <Play className="w-4 h-4 fill-amber-50" />
                <span>{t.playOnline}</span>
              </button>
              
              <a 
                href="#how-to-play"
                className="flex items-center space-x-2 font-bold text-xs tracking-wider border-2 border-stone-300 dark:border-stone-700 hover:border-amber-900 dark:hover:border-amber-500 px-8 py-3 rounded-xl transition text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-100 bg-white dark:bg-stone-900"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.howToPlay}</span>
              </a>
            </div>
          </div>

          {/* Right Hero Artwork Teaser */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div 
              className="relative w-full max-w-[420px] aspect-square rounded-3xl border-[10px] border-amber-900 dark:border-amber-800 bg-amber-50 dark:bg-[#1E1815] p-6 flex items-center justify-center shadow-2xl overflow-hidden"
              style={
                isDark
                  ? { backgroundImage: 'radial-gradient(ellipse at center, #231B17 0%, #15110E 100%)' }
                  : { backgroundImage: 'radial-gradient(ellipse at center, #FFFFFF 0%, #FAF5ED 100%)' }
              }
            >
              {/* Board mockup */}
              <div className="w-full h-full border border-stone-300 dark:border-stone-800 rounded relative flex flex-col justify-between p-4 opacity-70">
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="border border-stone-200 dark:border-stone-900/40 flex items-center justify-center">
                      {(i === 2 || i === 10 || i === 12 || i === 14 || i === 22) && (
                        <div className="text-red-650 text-[10px] font-bold font-mono">X</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-amber-600/30 flex items-center justify-center">
                  <span className="font-serif text-[10px] text-amber-950 dark:text-amber-200 font-black tracking-widest">{t.home}</span>
                </div>
              </div>

              {/* Floating aesthetic coins and dice */}
              <div className="absolute top-12 left-12 w-6 h-6 rounded-full bg-red-500 border border-stone-800 dark:border-stone-950 shadow-md animate-bounce" />
              <div className="absolute bottom-16 right-16 w-6 h-6 rounded-full bg-blue-500 border border-stone-800 dark:border-stone-950 shadow-md" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-stone-900 border-2 border-amber-900 dark:border-amber-700 rounded-xl shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-650" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mechanics Section (How to Play) */}
      <section id="how-to-play" className="py-16 px-6 bg-white dark:bg-stone-950 border-t border-b border-stone-200 dark:border-stone-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-black text-amber-950 dark:text-amber-100 tracking-wider">
              {t.howToPlay}
            </h2>
            <div className="w-16 h-1 bg-amber-600 mx-auto" />
            <p className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider">
              {t.mechanicsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-amber-50/40 dark:bg-[#1E1815]/40 border border-amber-900/10 dark:border-amber-700/20 rounded-2xl p-5 text-left space-y-3">
              <span className="w-8 h-8 rounded-lg bg-amber-900 dark:bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm">1</span>
              <h4 className="font-serif font-bold text-amber-950 dark:text-amber-200">{t.rule1Title}</h4>
              <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                {t.rule1Desc}
              </p>
            </div>

            <div className="bg-amber-50/40 dark:bg-[#1E1815]/40 border border-amber-900/10 dark:border-amber-700/20 rounded-2xl p-5 text-left space-y-3">
              <span className="w-8 h-8 rounded-lg bg-amber-900 dark:bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm">2</span>
              <h4 className="font-serif font-bold text-amber-950 dark:text-amber-200">{t.rule2Title}</h4>
              <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                {t.rule2Desc}
              </p>
            </div>

            <div className="bg-amber-50/40 dark:bg-[#1E1815]/40 border border-amber-900/10 dark:border-amber-700/20 rounded-2xl p-5 text-left space-y-3">
              <span className="w-8 h-8 rounded-lg bg-amber-900 dark:bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm">3</span>
              <h4 className="font-serif font-bold text-amber-950 dark:text-amber-200">{t.rule3Title}</h4>
              <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                {t.rule3Desc}
              </p>
            </div>

            <div className="bg-amber-50/40 dark:bg-[#1E1815]/40 border border-amber-900/10 dark:border-amber-700/20 rounded-2xl p-5 text-left space-y-3">
              <span className="w-8 h-8 rounded-lg bg-amber-900 dark:bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm">4</span>
              <h4 className="font-serif font-bold text-amber-950 dark:text-amber-200">{t.rule4Title}</h4>
              <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                {t.rule4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Heritage section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-left">
          <div className="flex-1 space-y-4">
            <h2 className="font-serif text-2xl font-black text-amber-950 dark:text-amber-100 tracking-wider">
              {t.heritageTitle}
            </h2>
            <div className="w-16 h-0.5 bg-amber-600" />
            <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
              {t.heritageDesc1}
            </p>
            <p className="text-stone-650 dark:text-stone-450 text-xs leading-relaxed italic">
              "{t.heritageDesc2}"
            </p>
          </div>
          <div className="flex-shrink-0 w-48 h-48 rounded-full border-[6px] border-amber-900 dark:border-amber-850 bg-amber-50 dark:bg-[#1E1815] flex items-center justify-center shadow-lg text-center p-4">
            <div>
              <Award className="w-12 h-12 text-amber-800 dark:text-amber-400 mx-auto mb-2 animate-pulse" />
              <span className="font-serif text-sm font-black text-amber-950 dark:text-amber-100 block">{t.estdBce}</span>
              <span className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-widest mt-0.5 block">{t.tamilNadu}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 mt-auto border-t-4 border-amber-900 dark:border-amber-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src="/Thayam-logo.png" alt="Thayam Logo" className="h-8 w-auto object-contain brightness-90" />
            <div>
              <span className="font-serif font-black text-white tracking-widest">{t.title}</span>
              <p className="text-[9px] text-stone-500 tracking-wider uppercase mt-0.5">{t.ancientStrategyReborn}</p>
            </div>
          </div>

          <div className="flex space-x-6">
            <a href="#how-to-play" className="hover:text-white transition">{t.howToPlay}</a>
            <span className="opacity-30">|</span>
            <span className="text-stone-500">© 2026 {t.ancientStrategyReborn}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
