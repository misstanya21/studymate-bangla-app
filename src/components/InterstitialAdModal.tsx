import React, { useState, useEffect } from 'react';
import { X, Sparkles, Megaphone, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ADMOB_CONFIG } from '../config/admobConfig';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  onClose,
  triggerReason = 'কুইজ সম্পন্ন হয়েছে!',
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded uppercase">
              বিজ্ঞাপন
            </span>
            <span className="text-xs text-slate-300">Google AdMob Interstitial Preview</span>
          </div>

          {canClose ? (
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-full transition-colors flex items-center gap-1 text-xs px-2.5 py-1 font-medium"
            >
              <span>বন্ধ করুন</span>
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
              বিজ্ঞাপন বন্ধ হতে: {countdown}s
            </span>
          )}
        </div>

        {/* Ad Body Simulation */}
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              StudyMate Pro বাংলা
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {triggerReason}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              দৈনিক অসীমিত প্রশ্ন, অফলাইন কুইজ ডাউনলোড এবং দ্রুততম AI সমাধান পেতে আজই যুক্ত থাকুন।
            </p>
          </div>

          {/* Test Ad Unit Info */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-left text-xs space-y-1">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              ডেভেলপার নোট (Monetization Info):
            </div>
            <p className="text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
              Google AdMob Interstitial Ad প্লেসহোল্ডার সফলভাবে ট্রিগার হয়েছে। আসল Android বিল্ডে
              <code className="font-mono text-[10px] mx-1 bg-amber-200/50 dark:bg-amber-900/80 px-1 py-0.5 rounded">
                {DEFAULT_ADMOB_CONFIG.interstitialAdUnitId}
              </code>
              ব্যবহার করে বিজ্ঞাপন প্রদর্শিত হবে।
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              disabled={!canClose}
              className={`w-full py-3 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                canClose
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canClose ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ফলাফলে ফিরে যান
                </>
              ) : (
                `অপেক্ষা করুন (${countdown}s)`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
