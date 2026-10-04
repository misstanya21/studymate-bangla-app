import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Trash2,
  Shield,
  HelpCircle,
  Megaphone,
  Smartphone,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Code,
  FileCheck,
} from 'lucide-react';
import { UserSettings } from '../types';
import { DEFAULT_ADMOB_CONFIG } from '../config/admobConfig';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  historyCount,
}) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showAdMobGuide, setShowAdMobGuide] = useState(false);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          অ্যাপ সেটিংস ও সহায়তা
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          অ্যাপের রূপরেখা, ভাষা এবং ডেভেলপমেন্ট অপশন কনফিগার করুন
        </p>
      </div>

      {/* General Settings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          সাধারণ সেটিংস
        </h3>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ডার্ক মোড (Dark Theme)
              </h4>
              <p className="text-xs text-slate-400">রাতের বেলায় চোখের প্রশান্তির জন্য</p>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.darkMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </button>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                অক্ষরের আকার (Font Size)
              </h4>
              <p className="text-xs text-slate-400">পড়ার সুবিধার্থে টেক্সট সাইজ নির্ধারণ করুন</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.fontSize === size
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {size === 'small' ? 'ছোট' : size === 'medium' ? 'মাঝারি' : 'বড়'}
              </button>
            ))}
          </div>
        </div>

        {/* Language Style */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ভাষার ধরন (Language Tone)
            </h4>
            <p className="text-xs text-slate-400">AI ব্যাখ্যার সাবলীলতা স্তর</p>
          </div>
          <select
            value={settings.languageStyle}
            onChange={(e) => onUpdateSettings({ languageStyle: e.target.value as any })}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="easy">সহজ ও প্রাঞ্জল বাংলা</option>
            <option value="standard">প্রমিত ব্যাকরণ ও পাঠ্য বাংলা</option>
          </select>
        </div>

        {/* Clear History */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
              ইতিহাস মুছে ফেলুন
            </h4>
            <p className="text-xs text-slate-400">
              বর্তমান সংরক্ষিত {historyCount}টি প্রশ্ন ও ফলাফল পরিষ্কার করুন
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('আপনি কি সমস্ত ইতিহাস মুছে ফেলতে নিশ্চিত?')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/50 text-red-600 text-xs font-bold transition-colors"
          >
            ক্লিয়ার করুন
          </button>
        </div>
      </div>

      {/* Monetization / AdMob Configuration Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              বিজ্ঞাপন ও মনিটাইজেশন কনফিগারেশন
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            AdMob Ready
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              টেস্ট বিজ্ঞাপন প্রিভিউ প্রদর্শন করুন
            </h4>
            <p className="text-xs text-slate-400">অ্যাপ স্ক্রিনে AdMob ব্যানার প্রিভিউ দেখায়</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ showAdPlaceholders: !settings.showAdPlaceholders })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.showAdPlaceholders ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        <button
          onClick={() => setShowAdMobGuide(!showAdMobGuide)}
          className="w-full p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                ভবিষ্যতে কীভাবে আসল AdMob ID বসাবেন?
              </h5>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                Google Play স্টোরে পাবলিশ করার সময় করণীয়
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-amber-600 transition-transform ${
              showAdMobGuide ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showAdMobGuide && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs space-y-2.5 text-slate-700 dark:text-slate-300 animate-in fade-in">
            <p className="font-semibold text-slate-900 dark:text-white">
              Google AdMob সংযোগ করার ৪টি সহজ ধাপ:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
              <li>
                <strong className="text-slate-900 dark:text-white">admob.google.com</strong>-এ একটি অ্যাকাউন্ট তৈরি করে নতুন Android অ্যাপ যুক্ত করুন।
              </li>
              <li>
                একটি <strong>Banner Ad Unit</strong> এবং একটি <strong>Interstitial Ad Unit</strong> তৈরি করুন।
              </li>
              <li>
                আমাদের প্রজেক্টের <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">src/config/admobConfig.ts</code> ফাইলে আপনার আসল Ad Unit ID-গুলো প্রতিস্থাপন করুন।
              </li>
              <li>
                কখনো ডেভেলপমেন্ট চলাকালীন নিজের আসল আইডি টেস্ট করবেন না—সবসময় অফিসিয়াল টেস্ট আইডি ব্যবহার করবেন।
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Android Play Store & AAB Packaging Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <button
          onClick={() => setShowAndroidGuide(!showAndroidGuide)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Android App Bundle (.aab) কীভাবে তৈরি করবেন?
              </h4>
              <p className="text-xs text-slate-400">Play Store requirements এবং প্যাকেজিং গাইড</p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showAndroidGuide ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showAndroidGuide && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                🚀 আধুনিক Capacitor বা TWA মেথড:
              </span>
              Google Play স্টোরে বর্তমান নিয়ম অনুযায়ী সব অ্যাপ <strong>.aab</strong> (Android App Bundle) এবং <strong>API Level 34+</strong> টার্গেট করতে হয়।
            </div>

            <p><strong>ধাপ ১:</strong> টার্মিনালে Capacitor কমান্ড রান করুন:</p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm install @capacitor/core @capacitor/cli @capacitor/android{'\n'}
              npx cap init "StudyMate বাংলা" "com.studymate.bangla"{'\n'}
              npm run build{'\n'}
              npx cap add android{'\n'}
              npx cap open android
            </pre>

            <p>
              <strong>ধাপ ২:</strong> Android Studio ওপেন হলে <em>Build &gt; Generate Signed Bundle / APK</em> নির্বাচন করে .aab ফাইল এক্সপোর্ট করুন।
            </p>
          </div>
        )}
      </div>

      {/* Information & Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        {/* About App */}
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-full flex items-center justify-between text-left py-1"
        >
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              অ্যাপ পরিচিতি (About StudyMate বাংলা)
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${showAbout ? 'rotate-90' : ''}`}
          />
        </button>

        {showAbout && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in">
            <p>
              <strong>StudyMate বাংলা</strong> হলো বাংলাভাষী স্কুল ও কলেজ শিক্ষার্থীদের জন্য একটি অত্যাধুনিক AI শিক্ষা সহায়ক প্ল্যাটফর্ম। এটি শিক্ষার্থীদের জটিল গাণিতিক সমস্যার সমাধান, বইয়ের ছবি স্ক্যান করে উত্তর জানা, কুইজের মাধ্যমে আত্মবিশ্বাস বৃদ্ধি এবং লম্বা অধ্যায় সহজে রিভিশন করতে সহায়তা করে।
            </p>
            <p>
              <strong>সংস্করণ:</strong> v1.0.0 (MVP) • <strong>AI ইঞ্জিন:</strong> Gemini 3.8 Flash
            </p>
          </div>
        )}

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Privacy Policy */}
        <button
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="w-full flex items-center justify-between text-left py-1"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              গোপনীয়তা নীতি (Privacy Policy)
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${showPrivacy ? 'rotate-90' : ''}`}
          />
        </button>

        {showPrivacy && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in">
            <p className="font-semibold text-slate-900 dark:text-white">
              শিক্ষার্থীদের গোপনীয়তা আমাদের সর্বোচ্চ অগ্রাধিকার:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>আমরা শিক্ষার্থীদের কোনো ব্যক্তিগত তথ্য বা পাসওয়ার্ড সংগ্রহ করি না।</li>
              <li>সমস্ত প্রশ্ন ও নোট আপনার ডিভাইসের ব্রাউজার/লোকাল স্টোরেজে থাকে।</li>
              <li>Gemini API কি শুধুমাত্র সার্ভার-সাইডে সুরক্ষিত রাখা হয়।</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
