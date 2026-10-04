import React from 'react';
import { Megaphone, ExternalLink, ShieldCheck } from 'lucide-react';
import { DEFAULT_ADMOB_CONFIG } from '../config/admobConfig';

interface AdBannerProps {
  visible?: boolean;
  position?: 'bottom' | 'inline';
}

export const AdBanner: React.FC<AdBannerProps> = ({ visible = true, position = 'bottom' }) => {
  if (!visible) return null;

  return (
    <div
      className={`w-full border-t border-slate-200 dark:border-slate-800 bg-amber-50/70 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-1 select-none ${
        position === 'bottom' ? 'sticky bottom-16 z-20 shadow-sm' : 'my-4 rounded-xl border border-dashed'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          বিজ্ঞাপন
        </span>
        <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
          <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 inline" />
          Google AdMob টেস্ট ব্যানার প্লেসহোল্ডার
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="hidden sm:inline font-mono text-[10px] bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded">
          {DEFAULT_ADMOB_CONFIG.bannerAdUnitId.slice(0, 20)}...
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3 h-3" /> Monetization Ready
        </span>
      </div>
    </div>
  );
};
