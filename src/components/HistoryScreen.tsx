import React, { useState } from 'react';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  Search,
  Trash2,
  ChevronRight,
  HelpCircle,
  Camera,
  CheckSquare,
  FileText,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface HistoryScreenProps {
  items: HistoryItem[];
  defaultTab?: 'history' | 'favorites';
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  fontSize?: 'small' | 'medium' | 'large';
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  items,
  defaultTab = 'history',
  onToggleFavorite,
  onDeleteItem,
  onClearAll,
  fontSize = 'medium',
}) => {
  const [tab, setTab] = useState<'history' | 'favorites'>(defaultTab);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filteredItems = items
    .filter((item) => (tab === 'favorites' ? item.isFavorite : true))
    .filter((item) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(s) ||
        item.query.toLowerCase().includes(s) ||
        item.content.toLowerCase().includes(s)
      );
    });

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'এইমাত্র';
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    const days = Math.floor(hours / 24);
    return `${days} দিন আগে`;
  };

  const getIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <Camera className="w-4 h-4 text-emerald-500" />;
      case 'quiz':
        return <CheckSquare className="w-4 h-4 text-purple-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  const getTypeLabel = (type: HistoryItem['type']) => {
    switch (type) {
      case 'question':
        return 'প্রশ্ন-উত্তর';
      case 'image':
        return 'ছবি প্রশ্ন';
      case 'quiz':
        return 'কুইজ';
      case 'note':
        return 'নোট';
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {tab === 'history' ? (
              <>
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                পড়াশোনার ইতিহাস
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5 text-amber-500" />
                সংরক্ষিত ফেভারিট সমূহ
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            পূর্বের সমস্ত প্রশ্ন, উত্তর ও কুইজের ফলাফল সহজে খুঁজে নিন
          </p>
        </div>

        {tab === 'history' && items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('আপনি কি নিশ্চিতভাবে সমস্ত ইতিহাস মুছে ফেলতে চান?')) {
                onClearAll();
              }
            }}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 dark:bg-red-950/60 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>মুছে ফেলুন</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'history'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>ইতিহাস ({items.length})</span>
        </button>

        <button
          onClick={() => setTab('favorites')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'favorites'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>ফেভারিট ({items.filter((i) => i.isFavorite).length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="প্রশ্ন বা বিষয় দিয়ে অনুসন্ধান করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            {tab === 'favorites' ? <Bookmark className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {tab === 'favorites' ? 'কোনো ফেভারিট সংরক্ষণ করা হয়নি' : 'কোনো ইতিহাস পাওয়া যায়নি'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {tab === 'favorites'
              ? 'গুরুত্বপূর্ণ প্রশ্নের উত্তরের ডান পাশের বুকমার্ক আইকনটিতে চাপ দিলে এখানে জমা হবে।'
              : 'নতুন কোনো প্রশ্ন বা কুইজ তৈরি করলে তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত থাকবে।'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getIcon(item.type)}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                    title="ফেভারিট টগল"
                  >
                    {item.isFavorite ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4
                  onClick={() => setSelectedItem(item)}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer line-clamp-1"
                >
                  {item.title || item.query}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.content.replace(/[#*`$-]/g, '')}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400">
                  {item.metadata?.subject || 'সাধারণ'}
                </span>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>সম্পূর্ণ দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {getTypeLabel(selectedItem.type)}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold mr-1">মূল অনুসন্ধান:</span>
                {selectedItem.query}
              </div>

              <MarkdownRenderer content={selectedItem.content} fontSize={fontSize} />
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
