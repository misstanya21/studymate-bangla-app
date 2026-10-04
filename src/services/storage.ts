import { HistoryItem, UserSettings } from '../types';

const HISTORY_KEY = 'studymate_history_v1';
const SETTINGS_KEY = 'studymate_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  fontSize: 'medium',
  languageStyle: 'easy',
  showAdPlaceholders: true,
  soundEffects: true,
};

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'sample-1',
    type: 'question',
    title: 'সালোকসংশ্লেষণ কী এবং এর গুরুত্ব?',
    query: 'সালোকসংশ্লেষণ কাকে বলে? এর সমীকরণ এবং উদ্ভিদের জন্য গুরুত্ব কী?',
    content: `### 📌 মূল উত্তর
সালোকসংশ্লেষণ (Photosynthesis) হলো উদ্ভিদের এমন একটি শারীরবৃত্তীয় জৈব-রাসায়নিক প্রক্রিয়া, যার মাধ্যমে সবুজ উদ্ভিদ সূর্যালোকের উপস্থিতিতে ক্লোরোফিলের সাহায্যে পরিবেশ থেকে কার্বন ডাই-অক্সাইড ($CO_2$) এবং মূলের মাধ্যমে পানি ($H_2O$) শোষণ করে গ্লুকোজ জাতীয় শর্করা খাদ্য প্রস্তুত করে এবং উপজাত হিসেবে অক্সিজেন ($O_2$) নির্গত করে।

---

### 🔍 রাসায়নিক সমীকরণ
$$6CO_2 + 12H_2O \\xrightarrow[ক্লোরোফিল]{সূর্যালোক} C_6H_{12}O_6 + 6H_2O + 6O_2$$

- **বিক্রিয়ক:** কার্বন ডাই-অক্সাইড ($CO_2$) এবং পানি ($H_2O$)
- **প্রভাবক:** সূর্যের আলো এবং ক্লোরোফিল
- **উৎপাদ:** গ্লুকোজ ($C_6H_{12}O_6$), পানি ও অক্সিজেন ($O_2$)

---

### 💡 মানবজীবন ও পরিবেশের গুরুত্ব
1. **খাদ্য উৎপাদন:** পৃথিবীর সমস্ত প্রাণীকূল খাদ্যের জন্য প্রত্যক্ষ বা পরোক্ষভাবে উদ্ভিদের ওপর নির্ভরশীল।
2. **প্রাণবায়ু সরবরাহ:** বায়ুমণ্ডলে শ্বসনের জন্য প্রয়োজনীয় অক্সিজেন জোগায়।
3. **পরিবেশের ভারসাম্য:** ক্ষতিকারক কার্বন ডাই-অক্সাইড শোষণ করে গ্রিনহাউস প্রভাব কমায়।

---

### 📝 মনে রাখার সহজ টিপস
পরীক্ষায় সবসময় সমীকরণের উপরে সূর্যালোক এবং নিচে ক্লোরোফিল উল্লেখ করতে ভুলবেন না!`,
    timestamp: Date.now() - 3600000 * 2,
    isFavorite: true,
    metadata: {
      subject: 'বিজ্ঞান / জীববিজ্ঞান',
      grade: 'Class 9-10',
    },
  },
  {
    id: 'sample-2',
    type: 'quiz',
    title: 'বাংলাদেশের মুক্তিযুদ্ধ ও স্বাধীনতা',
    query: 'কুইজ স্কোর: ৫ এর মধ্যে ৪',
    content: 'বাংলাদেশের স্বাধীনতা সংগ্রাম, ঐতিহাসিক ৭ই মার্চ ভাষণ এবং মুক্তিযুদ্ধের উপর কুইজ সম্পন্ন করা হয়েছে।',
    timestamp: Date.now() - 3600000 * 5,
    isFavorite: false,
    metadata: {
      subject: 'বাংলাদেশ ও বিশ্বপরিচয়',
      quizScore: 4,
      totalQuestions: 5,
    },
  },
];

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      saveStoredHistory(INITIAL_HISTORY);
      return INITIAL_HISTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read history from localStorage', e);
    return INITIAL_HISTORY;
  }
}

export function saveStoredHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const current = getStoredHistory();
  const newItem: HistoryItem = {
    ...item,
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  const updated = [newItem, ...current.slice(0, 49)]; // keep max 50 items
  saveStoredHistory(updated);
  return newItem;
}

export function toggleFavoriteItem(id: string): HistoryItem[] {
  const current = getStoredHistory();
  const updated = current.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  saveStoredHistory(updated);
  return updated;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const current = getStoredHistory();
  const updated = current.filter((item) => item.id !== id);
  saveStoredHistory(updated);
  return updated;
}

export function clearAllHistory(): void {
  saveStoredHistory([]);
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
