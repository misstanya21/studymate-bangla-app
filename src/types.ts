export type TabType = 'home' | 'ask' | 'image' | 'quiz' | 'note' | 'history' | 'favorites' | 'settings';

export interface HistoryItem {
  id: string;
  type: 'question' | 'image' | 'quiz' | 'note';
  title: string;
  query: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  isFavorite: boolean;
  metadata?: {
    subject?: string;
    grade?: string;
    quizScore?: number;
    totalQuestions?: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  quizTitle: string;
  topic: string;
  questions: QuizQuestion[];
}

export interface UserSettings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  languageStyle: 'easy' | 'standard';
  showAdPlaceholders: boolean;
  soundEffects: boolean;
}

export interface AdMobConfig {
  enabled: boolean;
  appId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  isTestMode: boolean;
}
