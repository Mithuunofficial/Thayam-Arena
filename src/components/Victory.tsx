import React from 'react';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface VictoryProps {
  winnerName: string;
  winningTeam?: string | null; // e.g. "Team A"
  stats: {
    totalRolls: number;
    captures: number;
    duration: string;
  };
  onPlayAgain: () => void;
  onReturnHome: () => void;
  lang: Language;
  theme?: 'light' | 'dark';
}

export const Victory: React.FC<VictoryProps> = ({
  winnerName,
  winningTeam,
  stats,
  onPlayAgain,
  onReturnHome,
  lang,
  theme = 'light'
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1E1815] border-8 border-amber-900 dark:border-amber-800 rounded-3xl p-6 shadow-2xl relative text-center overflow-hidden transition-all duration-300"
        style={
          isDark
            ? { backgroundImage: 'radial-gradient(circle, #1E1815 0%, #15110E 100%)' }
            : { backgroundImage: 'radial-gradient(circle, #FFFFFF 0%, #FDFBF7 100%)' }
        }
      >
        {/* Confetti border decor */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
        
        {/* Trophy icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 border-2 border-amber-500 flex items-center justify-center my-4 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Victory Header */}
        <h1 className="font-serif text-3xl font-black text-amber-900 dark:text-amber-300 tracking-wider">
          {t.victoryTitle}
        </h1>

        {/* Winner Name */}
        <p className="mt-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          {winningTeam ? `${winningTeam} (${winnerName})` : winnerName}
        </p>
        
        {winningTeam && (
          <span className="inline-block mt-1 px-3 py-1 bg-amber-900 dark:bg-amber-800 text-amber-50 text-xs font-bold uppercase rounded-full">
            {t.teamWin}
          </span>
        )}

        <hr className="my-5 border-stone-200 dark:border-stone-800" />

        {/* Stats Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 tracking-widest uppercase mb-2">
            {t.statistics}
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-stone-400 dark:text-stone-550 block font-semibold">{t.totalRolls}</span>
              <span className="text-base font-black text-stone-800 dark:text-stone-200 mt-1 block">{stats.totalRolls}</span>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-stone-400 dark:text-stone-550 block font-semibold">{t.captures}</span>
              <span className="text-base font-black text-red-650 dark:text-red-400 mt-1 block">{stats.captures}</span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-stone-400 dark:text-stone-550 block font-semibold">{t.gameDuration}</span>
              <span className="text-base font-black text-stone-800 dark:text-stone-200 mt-1 block">{stats.duration}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center space-x-2 bg-amber-900 dark:bg-amber-800 hover:bg-amber-800 dark:hover:bg-amber-700 text-amber-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>
          
          <button
            onClick={onReturnHome}
            className="flex-1 flex items-center justify-center space-x-2 bg-stone-105 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>{t.returnHome}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
