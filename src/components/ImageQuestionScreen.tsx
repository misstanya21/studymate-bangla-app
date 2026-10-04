import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Share2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { askWithImage } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { HistoryItem } from '../types';

interface ImageQuestionScreenProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => HistoryItem;
  onToggleFavorite: (id: string) => void;
  favorites: HistoryItem[];
  fontSize?: 'small' | 'medium' | 'large';
}

// Built-in sample educational diagrams (SVG encoded as data URLs) for 1-click testing
const SAMPLE_DIAGRAM_MATH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23ffffff"><rect width="600" height="400" fill="%23f8fafc"/><text x="30" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">গণিত প্রশ্ন: ত্রিভুজের ক্ষেত্রফল ও পিথাগোরাস</text><polygon points="100,320 400,320 100,120" fill="%23ecfdf5" stroke="%23059669" stroke-width="4"/><line x1="100" y1="320" x2="400" y2="320" stroke="%23059669" stroke-width="4"/><line x1="100" y1="120" x2="100" y2="320" stroke="%23059669" stroke-width="4"/><line x1="100" y1="120" x2="400" y2="320" stroke="%23059669" stroke-width="4"/><text x="240" y="350" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23047857">ভূমি = 4 cm</text><text x="40" y="220" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23047857">উচ্চতা = 3 cm</text><text x="260" y="200" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23dc2626">অতিভুজ x = ?</text><rect x="100" y="300" width="20" height="20" fill="none" stroke="%23059669" stroke-width="2"/><text x="30" y="380" font-family="sans-serif" font-size="16" fill="%23475569">প্রশ্ন: অতিভুজ x এর মান কত এবং ত্রিভুজের ক্ষেত্রফল নির্ণয় করো।</text></svg>`;

const SAMPLE_DIAGRAM_PHYSICS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" fill="%23ffffff"><rect width="600" height="350" fill="%23f8fafc"/><text x="30" y="45" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">পদার্থবিজ্ঞান: ওহমের সূত্র ও বর্তনী (Circuit)</text><rect x="80" y="100" width="440" height="160" fill="none" stroke="%232563eb" stroke-width="4" rx="10"/><rect x="250" y="85" width="100" height="30" fill="%23dbeafe" stroke="%232563eb" stroke-width="3"/><text x="270" y="105" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231e40af">R = 5 Ω</text><circle cx="120" cy="180" r="24" fill="%23fef3c7" stroke="%23d97706" stroke-width="3"/><text x="105" y="186" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2392400e">10V</text><text x="30" y="310" font-family="sans-serif" font-size="16" fill="%23475569">প্রশ্ন: বর্তনীতে তড়িৎ প্রবাহমাত্রা (Current I) কত হবে নির্ণয় করো।</text></svg>`;

export const ImageQuestionScreen: React.FC<ImageQuestionScreenProps> = ({
  onSaveToHistory,
  onToggleFavorite,
  favorites,
  fontSize = 'medium',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI উত্তর তৈরি করছে...');
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentHistoryItem, setCurrentHistoryItem] = useState<HistoryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('অনুগ্রহ করে একটি সঠিক ছবির ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ছবির আকার ১০ মেগাবাইটের কম হতে হবে।');
      return;
    }

    setError(null);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSolution(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleUrl: string, mime: string = 'image/svg+xml') => {
    setSelectedImage(sampleUrl);
    setImageMime(mime);
    setSolution(null);
    setError(null);
  };

  const handleSolve = async () => {
    if (!selectedImage) {
      setError('অনুগ্রহ করে ক্যামেরা বা গ্যালারি থেকে একটি ছবি দিন।');
      return;
    }

    setLoading(true);
    setLoadingMessage('AI উত্তর তৈরি করছে...');
    setError(null);

    const retryNoticeTimer = setTimeout(() => {
      setLoadingMessage('AI সার্ভারে ব্যস্ততা রয়েছে, আবার চেষ্টা করা হচ্ছে...');
    }, 2500);

    try {
      const answer = await askWithImage(selectedImage, customPrompt, imageMime);
      clearTimeout(retryNoticeTimer);
      setSolution(answer);

      const saved = onSaveToHistory({
        type: 'image',
        title: 'ছবি থেকে সমাধান',
        query: customPrompt || 'ছবিতে থাকা প্রশ্নের সমাধান',
        content: answer,
        imageUrl: selectedImage.slice(0, 1000), // preview snippet
        isFavorite: false,
        metadata: {
          subject: 'ছবি বিশ্লেষণ / OCR',
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

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ছবি দিয়ে প্রশ্ন করুন
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            বই বা প্রশ্নপত্রের ছবি তুলুন, AI শনাক্ত করে বাংলায় সমাধান করবে
          </p>
        </div>

        {solution && (
          <button
            onClick={() => {
              setSolution(null);
              setSelectedImage(null);
              setCustomPrompt('');
              setError(null);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>নতুন ছবি</span>
          </button>
        )}
      </div>

      {/* Main Upload Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        {/* Hidden Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-800/40"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              ক্যামেরা দিয়ে ছবি তুলুন বা গ্যালারি থেকে সিলেক্ট করুন
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              বইয়ের পাতা, জ্যামিতি বা যেকোনো অংকের পরিষ্কার ছবি দিন (JPG, PNG)
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700">
              <Upload className="w-4 h-4" />
              <span>ছবি নির্বাচন করুন</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 max-h-72 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Selected problem"
                className="max-h-72 w-auto object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSolution(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-colors"
                title="ছবি মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Optional extra prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                অতিরিক্ত নির্দেশনা (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="যেমন: ৩ নং অংকটি সমাধান করে দাও বা ক্ষেত্রফল বের করো"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Solve Action Button */}
            <button
              onClick={handleSolve}
              disabled={loading}
              className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                loading
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-[0.99]'
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
                  <span>AI সমাধান বের করুন</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick Sample Image Buttons */}
        {!solution && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              💡 ছবি নেই? ডেমো নমুনা ছবি দিয়ে টেস্ট করুন:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectSample(SAMPLE_DIAGRAM_MATH)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-left transition-colors flex items-center gap-2.5 text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  📐
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    জ্যামিতি ও পিথাগোরাস ডায়াগ্রাম
                  </span>
                  <span className="text-[10px] text-slate-400">ভূমি ৪ সেমি, উচ্চতা ৩ সেমি</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectSample(SAMPLE_DIAGRAM_PHYSICS)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-left transition-colors flex items-center gap-2.5 text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    পদার্থবিজ্ঞান বর্তনী (Circuit)
                  </span>
                  <span className="text-[10px] text-slate-400">R=5Ω, V=10V তড়িৎ প্রবাহ নির্ণয়</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          <button
            onClick={() => handleSolve()}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Solution Display */}
      {solution && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                ছবি থেকে AI বিশ্লেষণ ও সমাধান
              </span>
            </div>

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

          <MarkdownRenderer content={solution} fontSize={fontSize} />
        </div>
      )}
    </div>
  );
};
