import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Bookmark,
} from 'lucide-react';
import { generateQuiz } from '../services/api';
import { QuizData, HistoryItem } from '../types';

interface QuizScreenProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => HistoryItem;
  onShowInterstitialAd?: (reason: string) => void;
  fontSize?: 'small' | 'medium' | 'large';
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  onSaveToHistory,
  onShowInterstitialAd,
  fontSize = 'medium',
}) => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('MCQ প্রশ্ন তৈরি হচ্ছে...');
  const [error, setError] = useState<string | null>(null);

  // Active Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleTopics = [
    'বাংলাদেশের মুক্তিযুদ্ধ ও ইতিহাস',
    'পদার্থবিজ্ঞান: আলোর প্রতিফলন ও প্রতিসরণ',
    'জীববিজ্ঞান: মানবদেহের পরিপাকতন্ত্র',
    'বাংলা ব্যাকরণ: কারক ও সমাস',
    'ICT: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
  ];

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) {
      setError('অনুগ্রহ করে কুইজের বিষয় লিখুন।');
      return;
    }

    setLoading(true);
    setLoadingMessage('MCQ প্রশ্ন তৈরি হচ্ছে...');
    setError(null);
    setQuizData(null);
    setSelectedAnswers({});
    setIsSubmitted(false);

    const retryNoticeTimer = setTimeout(() => {
      setLoadingMessage('AI সার্ভারে ব্যস্ততা রয়েছে, আবার চেষ্টা করা হচ্ছে...');
    }, 2500);

    try {
      const data = await generateQuiz(t, questionCount, difficulty);
      clearTimeout(retryNoticeTimer);
      if (!data.questions || data.questions.length === 0) {
        throw new Error('কুইজের প্রশ্ন তৈরি করা সম্ভব হয়নি। অন্য বিষয় দিয়ে চেষ্টা করুন।');
      }
      setQuizData(data);
    } catch (err: any) {
      clearTimeout(retryNoticeTimer);
      setError(err.message || 'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।');
    } finally {
      clearTimeout(retryNoticeTimer);
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 0 };
    let score = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return { score, total: quizData.questions.length };
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    setIsSubmitted(true);

    const { score, total } = calculateScore();

    // Trigger Interstitial Ad preview for monetization
    if (onShowInterstitialAd) {
      onShowInterstitialAd(`কুইজ সমাপ্ত! স্কোর: ${score}/${total}`);
    }

    // Save result to History
    onSaveToHistory({
      type: 'quiz',
      title: quizData.quizTitle || quizData.topic,
      query: `কুইজ স্কোর: ${score}/${total} (${Math.round((score / total) * 100)}%)`,
      content: `বিষয়: ${quizData.topic}\nকঠিনতার স্তর: ${
        difficulty === 'easy' ? 'সহজ' : difficulty === 'hard' ? 'কঠিন' : 'মাঝারি'
      }\nমোট প্রশ্ন: ${total} টি\nসঠিক উত্তর: ${score} টি`,
      isFavorite: false,
      metadata: {
        subject: quizData.topic,
        quizScore: score,
        totalQuestions: total,
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { score, total } = calculateScore();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI কুইজ জেনারেটর
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            যেকোনো বিষয়ে কুইজ তৈরি করে নিজের প্রস্তুতি যাচাই করুন
          </p>
        </div>

        {quizData && (
          <button
            onClick={() => {
              setQuizData(null);
              setSelectedAnswers({});
              setIsSubmitted(false);
              setTopic('');
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>নতুন কুইজ</span>
          </button>
        )}
      </div>

      {/* Generator Configuration (Shown when no active quiz) */}
      {!quizData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              কুইজের বিষয় বা অধ্যায়
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="যেমন: বাংলাদেশের মুক্তিযুদ্ধ, সালোকসংশ্লেষণ, পর্যায় সারণি..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                প্রশ্নের সংখ্যা
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={5}>৫ টি প্রশ্ন (ঝটপট কুইজ)</option>
                <option value={10}>১০ টি প্রশ্ন (স্ট্যান্ডার্ড)</option>
                <option value={15}>১৫ টি প্রশ্ন (পূর্ণাঙ্গ)</option>
                <option value={20}>২০ টি প্রশ্ন (চ্যালেঞ্জ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                কঠিনতার স্তর
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">সহজ (প্রাথমিক/নিম্ন মাধ্যমিক)</option>
                <option value="medium">মাঝারি (মাধ্যমিক/SSC)</option>
                <option value="hard">কঠিন (উচ্চ মাধ্যমিক/কলেজ)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              loading || !topic.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 active:scale-[0.99]'
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
                <span>কুইজ তৈরি করুন</span>
              </>
            )}
          </button>

          {/* Sample Topic Chips */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              💡 জনপ্রিয় কুইজ বিষয় (ট্যাপ করে শুরু করুন):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((top, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(top);
                    handleGenerate(top);
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-transparent hover:border-purple-300 transition-colors text-left"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="leading-relaxed">
            {error}
          </div>
          <button
            onClick={() => handleGenerate()}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Active Quiz Test UI */}
      {quizData && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Result Score Card (When Submitted) */}
          {isSubmitted && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 text-white shadow-xl shadow-purple-600/20 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-amber-300">
                <Award className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black">
                {percentage >= 80 ? '🎉 অসাধারণ সাফল্য!' : percentage >= 50 ? '👏 বেশ ভালো প্রস্তুতি!' : '💪 আরও কিছুটা অনুশীলন প্রয়োজন!'}
              </h3>
              <p className="text-sm text-purple-100">
                কুইজ বিষয়: {quizData.topic}
              </p>

              <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-2xl backdrop-blur-md font-bold text-lg">
                <span>প্রাপ্ত স্কোর: {score} / {total}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-amber-300">{percentage}%</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setIsSubmitted(false);
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-purple-900 font-bold text-xs shadow hover:bg-purple-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  পুনরায় কুইজ দিন
                </button>
              </div>
            </div>
          )}

          {/* Quiz Header Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                {quizData.quizTitle || quizData.topic}
              </h3>
              <p className="text-xs text-slate-400">
                মোট প্রশ্ন: {quizData.questions.length} টি • সঠিক বিকল্পটি বেছে নিন
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                উত্তর দেওয়া হয়েছে: {Object.keys(selectedAnswers).length}/{quizData.questions.length}
              </span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {quizData.questions.map((q, qIndex) => {
              const userAnswer = selectedAnswers[q.id];
              const isAnswered = userAnswer !== undefined;

              return (
                <div
                  key={q.id || qIndex}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border transition-all ${
                    isSubmitted
                      ? userAnswer === q.correctIndex
                        ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-red-400/80 bg-red-50/20 dark:bg-red-950/10'
                      : 'border-slate-200/90 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex items-start gap-2.5 mb-3.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIndex + 1}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {/* 4 Options */}
                  <div className="space-y-2 pl-2 sm:pl-8">
                    {q.options.map((option, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle =
                        'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200';

                      if (isSelected) {
                        btnStyle =
                          'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100 font-semibold ring-2 ring-purple-500/20';
                      }

                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/30';
                        } else if (isSelected && !isCorrect) {
                          btnStyle =
                            'border-red-500 bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-100 font-bold';
                        } else {
                          btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                              {['ক', 'খ', 'গ', 'ঘ'][optIdx]}
                            </span>
                            <span>{option}</span>
                          </div>

                          {isSubmitted && (
                            <div>
                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Shown when submitted) */}
                  {isSubmitted && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        ব্যাখ্যা:
                      </div>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="sticky bottom-20 z-20 pt-2">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>উত্তর সাবমিট করুন ও ফলাফল দেখুন</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
