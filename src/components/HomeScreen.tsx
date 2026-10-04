import React from 'react';
import {
  HelpCircle,
  Camera,
  CheckSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Calculator,
  Atom,
  Languages,
  History as HistoryIcon,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { TabType, HistoryItem } from '../types';

interface HomeScreenProps {
  setTab: (tab: TabType) => void;
  recentItems: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onSelectQuickPrompt: (query: string, subject?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setTab,
  recentItems,
  onSelectItem,
  onSelectQuickPrompt,
}) => {
  const quickSubjects = [
    { name: 'গণিত', icon: Calculator, color: 'from-blue-500 to-cyan-400', query: 'পিথাগোরাসের উপপাদ্যটি সহজ উদাহরণসহ বুঝিয়ে দাও।' },
    { name: 'বিজ্ঞান', icon: Atom, color: 'from-emerald-500 to-teal-400', query: 'নিউটনের গতির ৩টি সূত্র বাস্তব উদাহরণসহ ব্যাখ্যা করো।' },
    { name: 'বাংলা', icon: BookOpen, color: 'from-rose-500 to-orange-400', query: 'কারক ও বিভক্তি চেনার সহজ নিয়মগুলো কী কী?' },
    { name: 'ইংরেজি', icon: Languages, color: 'from-indigo-500 to-purple-400', query: 'Right form of verbs-এর সবচেয়ে গুরুত্বপূর্ণ ৫টি নিয়ম সহজ বাংলায় শেখাও।' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 shadow-xl shadow-emerald-700/15">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-emerald-50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>শিক্ষার্থীদের বিশ্বস্ত AI টিউটর</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            পড়াশোনায় যেকোনো সমস্যায়, <br />
            সহজ সমাধান <span className="text-amber-300">বাংলায়!</span>
          </h2>

          <p className="text-emerald-50/90 text-sm leading-relaxed max-w-md">
            স্কুল-কলেজের গণিত, বিজ্ঞান বা যেকোনো কঠিন বিষয় এখন সহজে বোঝো নিজের মাতৃভাষায়।
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setTab('ask')}
              className="px-5 py-2.5 rounded-2xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>প্রশ্ন করুন</span>
            </button>
            <button
              onClick={() => setTab('image')}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>ছবি দিয়ে প্রশ্ন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 4 Feature Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            মূল ফিচারসমূহ
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">সহজ এক ক্লিকে</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Ask Question */}
          <button
            onClick={() => setTab('ask')}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              প্রশ্ন করুন
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              বাংলা বা ইংরেজিতে প্রশ্ন লিখে ধাপে ধাপে সমাধান নিন
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span>শুরু করুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Image Question */}
          <button
            onClick={() => setTab('image')}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              ছবি দিয়ে প্রশ্ন
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              বই বা খাতার ছবির তাত্ক্ষণিক AI সমাধান পান
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>ছবি তুলুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Quiz Generator */}
          <button
            onClick={() => setTab('quiz')}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Quiz তৈরি করুন
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              যে কোনো বিষয়ে ৫/১০টি MCQ বানিয়ে নিজেকে যাচাই করুন
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <span>কুইজ দিন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Note Generator */}
          <button
            onClick={() => setTab('note')}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all text-left shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              নোট তৈরি করুন
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              বড় অধ্যায় পেস্ট করে পরীক্ষার জন্য ছোট গোছানো নোট
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span>নোট বানান</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Subject Starters */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between px-1">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            জনপ্রিয় পাঠ্য বিষয়
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">ট্যাপ করে প্রশ্ন করুন</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickSubjects.map((sub, idx) => {
            const Icon = sub.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectQuickPrompt(sub.query, sub.name)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 flex items-center gap-2.5 transition-all text-left shadow-sm group active:scale-95"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {sub.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">নমুনা প্রশ্ন</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Questions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            সাম্প্রতিক প্রশ্ন ও সমাধান
          </h3>
          <button
            onClick={() => setTab('history')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>সবগুলো দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            এখনো কোনো প্রশ্ন করেননি। উপরের বাটনগুলো ব্যবহার করে প্রথম প্রশ্নটি করুন!
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm hover:shadow flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {item.type === 'question'
                        ? 'প্রশ্ন-উত্তর'
                        : item.type === 'image'
                        ? 'ছবি সমাধান'
                        : item.type === 'quiz'
                        ? 'কুইজ'
                        : 'নোট'}
                    </span>
                    {item.metadata?.subject && (
                      <span className="text-[11px] text-slate-400 truncate">
                        {item.metadata.subject}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title || item.query}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.content.replace(/[#*`$-]/g, '').slice(0, 80)}...
                  </p>
                </div>
                <div className="flex items-center gap-1 self-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  {item.isFavorite && (
                    <Bookmark className="w-4 h-4 fill-amber-400 text-amber-500" />
                  )}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-3">
        <span className="text-2xl">🌱</span>
        <div>
          <p className="font-semibold leading-relaxed">
            "আজকের একটি ছোট্ট প্রচেষ্টা আগামীকালের বড় সাফল্যের ভিত্তি।"
          </p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
            নিয়মিত অনুশীলন করো, StudyMate বাংলা সবসময় তোমার সাথে আছে।
          </span>
        </div>
      </div>
    </div>
  );
};
