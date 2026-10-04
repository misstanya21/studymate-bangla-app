import React from 'react';
import { Sparkles, Moon, Sun, Bookmark, GraduationCap, ShieldCheck } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  setTab,
  darkMode,
  setDarkMode,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-2.5 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                StudyMate <span className="text-emerald-600 dark:text-emerald-400">বাংলা</span>
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              স্মার্ট শিক্ষামূলক অ্যাসিস্ট্যান্ট
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Favorite Quick Button */}
          <button
            onClick={() => setTab('favorites')}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="সংরক্ষিত ফেভারিট সমূহ"
          >
            <Bookmark className="w-5 h-5" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 animate-in spin-in-90 duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
