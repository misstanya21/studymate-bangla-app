import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
} from 'lucide-react';
import { summarizeNote } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { HistoryItem } from '../types';

interface NoteScreenProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => HistoryItem;
  onToggleFavorite: (id: string) => void;
  favorites: HistoryItem[];
  fontSize?: 'small' | 'medium' | 'large';
}

const SAMPLE_TEXT_MUKTIJODDHO = `বাংলাদেশের মুক্তিযুদ্ধ ১৯৭১ সালের ২৬ মার্চ শুরু হয়ে ১৬ ডিসেম্বর বিজয়ের মাধ্যমে সমাপ্ত হয়। দীর্ঘ ৯ মাসব্যাপী রক্তক্ষয়ী যুদ্ধে প্রায় ৩০ লক্ষ শহীদ হন এবং দুই লক্ষাধিক মা-বোন আত্মত্যাগ করেন। ১৯৭১ সালের ২৫ মার্চ কালরাতে পাকিস্তানি হানাদার বাহিনী অপারেশন সার্চলাইটের নামে নিরস্ত্র বাঙালিদের ওপর বর্বরোচিত গণহত্যা শুরু করে। ২৬ মার্চের প্রথম প্রহরে জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমান বাংলাদেশের স্বাধীনতা ঘোষণা করেন। ১০ এপ্রিল মুজিবনগর সরকার গঠিত হয় এবং ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলায় প্রথম সরকার শপথ গ্রহণ করে। পুরো বাংলাদেশকে ১১টি সেক্টরে এবং ৩টি নিয়মিত ব্রিগেড ফোর্সে (জেড ফোর্স, কে ফোর্স, এস ফোর্স) ভাগ করে যুদ্ধ পরিচালনা করা হয়। যৌথবাহিনীর তীব্র আক্রমণের মুখে ১৯৭১ সালের ১৬ ডিসেম্বর ঐতিহাসিক রেসকোর্স ময়দানে পাকিস্তানি বাহিনীর ৯৩ হাজার সৈন্য আত্মসমর্পণ করে।`;

const SAMPLE_TEXT_PHOTOSYNTHESIS = `সালোকসংশ্লেষণ হলো একটি জৈব রাসায়নিক প্রক্রিয়া যাতে সবুজ উদ্ভিদ সূর্যালোক ও ক্লোরোফিলের সাহায্যে পরিবেশ থেকে গৃহীত কার্বন ডাই-অক্সাইড এবং মূলরোম দ্বারা শোষিত পানির বিক্রিয়ায় গ্লুকোজ জাতীয় শর্করা খাদ্য প্রস্তুত করে এবং উপজাত হিসেবে অক্সিজেন নির্গত করে। প্রক্রিয়াটি প্রধানত দুটি পর্যায়ে বিভক্ত: আলোক পর্যায় বা আলোক নির্ভর পর্যায় এবং অন্ধকার পর্যায় বা ক্যালভিন চক্র। আলোক পর্যায়ে এটিপি (ATP) ও এনএডিপিএইচ (NADPH) তৈরি হয় যা পরবর্তীতে কার্বন বিজারণে ব্যবহৃত হয়। স্থলজ উদ্ভিদে পাতার মেসোফিল টিস্যুর ক্লোরোপ্লাস্টে এই প্রক্রিয়া সংঘটিত হয়। সালোকসংশ্লেষণ না ঘটলে পৃথিবীর উদ্ভিদ ও প্রাণী জগতের অস্তিত্ব বিলুপ্ত হতো কারণ এটি পৃথিবীর সমস্ত খাদ্যের মূল উৎস এবং বায়ুমণ্ডলে অক্সিজেনের ভারসাম্য রক্ষা করে।`;

export const NoteScreen: React.FC<NoteScreenProps> = ({
  onSaveToHistory,
  onToggleFavorite,
  favorites,
  fontSize = 'medium',
}) => {
  const [inputText, setInputText] = useState('');
  const [format, setFormat] = useState<'standard' | 'bullet' | 'qa'>('standard');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('নোট সাজানো হচ্ছে...');
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentHistoryItem, setCurrentHistoryItem] = useState<HistoryItem | null>(null);

  const handleGenerateNote = async (textToUse?: string) => {
    const text = (textToUse || inputText).trim();
    if (!text) {
      setError('অনুগ্রহ করে নোট তৈরির জন্য পাঠ্য বা অধ্যায় পেস্ট করুন।');
      return;
    }

    setLoading(true);
    setLoadingMessage('নোট সাজানো হচ্ছে...');
    setError(null);

    const retryNoticeTimer = setTimeout(() => {
      setLoadingMessage('AI সার্ভারে ব্যস্ততা রয়েছে, আবার চেষ্টা করা হচ্ছে...');
    }, 2500);

    try {
      const note = await summarizeNote(text, format);
      clearTimeout(retryNoticeTimer);
      setGeneratedNote(note);

      // Extract a nice title from note
      const firstLine = note.split('\n')[0].replace(/[#*]/g, '').trim() || 'অধ্যায়ের সংক্ষিপ্ত নোট';

      const saved = onSaveToHistory({
        type: 'note',
        title: firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine,
        query: text.slice(0, 80) + '...',
        content: note,
        isFavorite: false,
        metadata: {
          subject: 'সংক্ষিপ্ত নোট ও সারসংক্ষেপ',
        },
      });
      setCurrentHistoryItem(saved);
    } catch (err: any) {
      clearTimeout(retryNoticeTimer);
      setError(err.message || 'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।');
    } finally {
      clearTimeout(retryNoticeTimer);
      setLoading(false);
    }
  };

  const isFavorite = currentHistoryItem
    ? favorites.some((f) => f.id === currentHistoryItem.id)
    : false;

  const handleDownloadTxt = () => {
    if (!generatedNote) return;
    const blob = new Blob([generatedNote], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyMate_নোট_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            AI নোট জেনারেটর
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            বড় পাঠ্য বা অধ্যায় পেস্ট করুন, AI পরীক্ষার জন্য গোছানো শর্ট নোট বানাবে
          </p>
        </div>

        {generatedNote && (
          <button
            onClick={() => {
              setGeneratedNote(null);
              setInputText('');
              setError(null);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>নতুন নোট</span>
          </button>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            অধ্যায়ের মূল লেখা বা লেকচার পেস্ট করুন:
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="এখানে পাঠ্যপুস্তকের কোনো পরিচ্ছেদ, আর্টিকেল বা ক্লাসের লেকচার পেস্ট করুন..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            শব্দ সংখ্যা: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} টি
          </span>

          <button
            onClick={() => handleGenerateNote()}
            disabled={loading || !inputText.trim()}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
              loading || !inputText.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingMessage}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>শর্ট নোট তৈরি করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Demo text samples */}
        {!generatedNote && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              💡 কোনো লেখা নেই? ডেমো টেক্সট দিয়ে পরীক্ষা করুন:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setInputText(SAMPLE_TEXT_MUKTIJODDHO);
                  handleGenerateNote(SAMPLE_TEXT_MUKTIJODDHO);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-transparent hover:border-amber-300 transition-colors"
              >
                📜 বাংলাদেশের মুক্তিযুদ্ধ ১৯৭১
              </button>

              <button
                onClick={() => {
                  setInputText(SAMPLE_TEXT_PHOTOSYNTHESIS);
                  handleGenerateNote(SAMPLE_TEXT_PHOTOSYNTHESIS);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-transparent hover:border-amber-300 transition-colors"
              >
                🌿 সালোকসংশ্লেষণ প্রক্রিয়া
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="leading-relaxed">
            {error}
          </div>
          <button
            onClick={() => handleGenerateNote()}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Resulting Note */}
      {generatedNote && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                গোছানো পরীক্ষার শর্ট নোট
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadTxt}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                title="নোট ডাউনলোড করুন"
              >
                <Download className="w-4 h-4" />
              </button>

              {currentHistoryItem && (
                <button
                  onClick={() => onToggleFavorite(currentHistoryItem.id)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                  title="ফেভারিট সংরক্ষণ"
                >
                  {isFavorite ? (
                    <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <MarkdownRenderer content={generatedNote} fontSize={fontSize} />
        </div>
      )}
    </div>
  );
};
