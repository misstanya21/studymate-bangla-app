import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Send,
  Loader2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { askQuestion } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { HistoryItem } from '../types';

interface QuestionScreenProps {
  initialQuestion?: string;
  initialSubject?: string;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => HistoryItem;
  onToggleFavorite: (id: string) => void;
  favorites: HistoryItem[];
  fontSize?: 'small' | 'medium' | 'large';
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  initialQuestion = '',
  initialSubject = 'সাধারণ',
  onSaveToHistory,
  onToggleFavorite,
  favorites,
  fontSize = 'medium',
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [subject, setSubject] = useState(initialSubject);
  const [gradeLevel, setGradeLevel] = useState('মাধ্যমিক (৯ম-১০ম শ্রেণী)');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI উত্তর তৈরি করছে...');
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentHistoryItem, setCurrentHistoryItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      if (initialSubject) setSubject(initialSubject);
    }
  }, [initialQuestion, initialSubject]);

  const sampleQuestions = [
    'মৌলিক সংখ্যা (Prime Number) চেনার সহজ উপায় কী?',
    'দ্বিঘাত সমীকরণ সমাধানের সূত্রটি উদাহরণসহ ব্যাখ্যা করো।',
    'নিউটনের দ্বিতীয় সূত্র ও $F=ma$ কীভাবে প্রমাণ করব?',
    'ইংরেজি Tense সহজে মনে রাখার টেকনিক কী কী?',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) {
      setError('অনুগ্রহ করে আপনার প্রশ্নটি লিখুন।');
      return;
    }

    setLoading(true);
    setLoadingMessage('AI উত্তর তৈরি করছে...');
    setError(null);
    stopSpeaking();

    const retryNoticeTimer = setTimeout(() => {
      setLoadingMessage('AI সার্ভারে ব্যস্ততা রয়েছে, আবার চেষ্টা করা হচ্ছে...');
    }, 2500);

    try {
      const answer = await askQuestion(q, { gradeLevel, subject });
      clearTimeout(retryNoticeTimer);
      setCurrentAnswer(answer);

      // Save to history
      const savedItem = onSaveToHistory({
        type: 'question',
        title: q.length > 50 ? q.slice(0, 50) + '...' : q,
        query: q,
        content: answer,
        isFavorite: false,
        metadata: {
          subject,
          grade: gradeLevel,
        },
      });
      setCurrentHistoryItem(savedItem);
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

  const handleToggleFav = () => {
    if (currentHistoryItem) {
      onToggleFavorite(currentHistoryItem.id);
    }
  };

  const handleCopy = () => {
    if (!currentAnswer) return;
    navigator.clipboard.writeText(currentAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentAnswer) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `StudyMate বাংলা - ${question}`,
          text: currentAnswer,
        });
      } catch (e) {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  // Text to speech
  const handleSpeak = () => {
    if (!currentAnswer) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।');
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text for speech
    const cleanText = currentAnswer.replace(/[#*`$-]/g, '').slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try finding Bengali voice
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.lang.includes('bd') || v.lang.includes('in'));
    if (bnVoice) {
      utterance.voice = bnVoice;
    }
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            AI প্রশ্ন-উত্তর
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            যেকোনো প্রশ্ন লিখুন, AI সহজ বাংলায় ধাপে ধাপে সমাধান দেবে
          </p>
        </div>
        {currentAnswer && (
          <button
            onClick={() => {
              setCurrentAnswer(null);
              setQuestion('');
              setError(null);
              stopSpeaking();
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>নতুন প্রশ্ন</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        {/* Class and Subject Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              শ্রেণী / স্তর
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="প্রাথমিক (১ম-৫ম শ্রেণী)">প্রাথমিক (১ম-৫ম শ্রেণী)</option>
              <option value="নিম্ন মাধ্যমিক (৬ষ্ঠ-৮ম শ্রেণী)">নিম্ন মাধ্যমিক (৬ষ্ঠ-৮ম শ্রেণী)</option>
              <option value="মাধ্যমিক (৯ম-১০ম শ্রেণী)">মাধ্যমিক (৯ম-১০ম শ্রেণী - SSC)</option>
              <option value="উচ্চ মাধ্যমিক (১১শ-১২শ শ্রেণী)">উচ্চ মাধ্যমিক (১১শ-১২শ - HSC)</option>
              <option value="বিশ্ববিদ্যালয় ও ভর্তি পরীক্ষা">বিশ্ববিদ্যালয় ও ভর্তি পরীক্ষা</option>
              <option value="সাধারণ শিক্ষা / অন্যান্য">সাধারণ শিক্ষা / অন্যান্য</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              বিষয়
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="সাধারণ">সাধারণ (সকল বিষয়)</option>
              <option value="গণিত">গণিত (সাধারণ ও উচ্চতর)</option>
              <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
              <option value="রসায়ন">রসায়ন</option>
              <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
              <option value="বাংলা">বাংলা (১ম ও ২য় পত্র)</option>
              <option value="ইংরেজি">ইংরেজি ব্যাকরণ ও পাঠ্য</option>
              <option value="আইসিটি">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>
              <option value="বাংলাদেশ ও বিশ্বপরিচয়">বাংলাদেশ ও বিশ্বপরিচয় / ইতিহাস</option>
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleAsk();
              }
            }}
            placeholder="আপনার প্রশ্নটি বাংলায় বা ইংরেজিতে লিখুন... (যেমন: সালোকসংশ্লেষণ প্রক্রিয়ার ধাপগুলো ব্যাখ্যা করো)"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Ctrl+Enter চাপলেও সাবমিট হবে
          </span>

          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
              loading || !question.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/25'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingMessage}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>উত্তর দিন</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Question Chips */}
        {!currentAnswer && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              💡 উদাহরণ প্রশ্ন (ট্যাপ করে দেখুন):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    handleAsk(q);
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="leading-relaxed">
            {error}
          </div>
          <button
            onClick={() => handleAsk()}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Answer Output */}
      {currentAnswer && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                StudyMate AI সমাধান
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                {subject}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Readout */}
              <button
                onClick={handleSpeak}
                className={`p-2 rounded-xl transition-colors ${
                  isSpeaking
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
                title={isSpeaking ? 'পড়া বন্ধ করুন' : 'বাংলায় পড়ে শোনান'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Bookmark */}
              <button
                onClick={handleToggleFav}
                className={`p-2 rounded-xl transition-colors ${
                  isFavorite
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
                title={isFavorite ? 'ফেভারিট থেকে মুছুন' : 'ফেভারিটে সংরক্ষণ করুন'}
              >
                {isFavorite ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                title="উত্তর শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Recap */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span className="text-slate-400 font-bold mr-1">প্রশ্ন:</span>
            {question}
          </div>

          {/* Markdown Result */}
          <MarkdownRenderer content={currentAnswer} fontSize={fontSize} />
        </div>
      )}
    </div>
  );
};
