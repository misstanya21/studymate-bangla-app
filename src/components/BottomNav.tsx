import React from 'react';
import { Home, HelpCircle, Camera, CheckSquare, FileText, Clock, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'হোম', icon: Home },
    { id: 'ask' as TabType, label: 'প্রশ্ন', icon: HelpCircle },
    { id: 'image' as TabType, label: 'ছবি প্রশ্ন', icon: Camera },
    { id: 'quiz' as TabType, label: 'কুইজ', icon: CheckSquare },
    { id: 'note' as TabType, label: 'নোট', icon: FileText },
    { id: 'history' as TabType, label: 'ইতিহাস', icon: Clock },
    { id: 'settings' as TabType, label: 'সেটিংস', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
