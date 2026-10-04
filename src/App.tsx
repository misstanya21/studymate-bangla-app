import React, { useState, useEffect } from 'react';
import { TabType, HistoryItem, UserSettings } from './types';
import {
  getStoredHistory,
  saveStoredHistory,
  addHistoryItem,
  toggleFavoriteItem,
  deleteHistoryItem,
  clearAllHistory,
  getStoredSettings,
  saveStoredSettings,
} from './services/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ImageQuestionScreen } from './components/ImageQuestionScreen';
import { QuizScreen } from './components/QuizScreen';
import { NoteScreen } from './components/NoteScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AdBanner } from './components/AdBanner';
import { InterstitialAdModal } from './components/InterstitialAdModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [quickQuestion, setQuickQuestion] = useState<{ query: string; subject?: string } | null>(null);

  // Interstitial Ad State
  const [interstitial, setInterstitial] = useState<{ isOpen: boolean; reason: string }>({
    isOpen: false,
    reason: '',
  });

  // Load stored data on mount
  useEffect(() => {
    const loadedHistory = getStoredHistory();
    setHistory(loadedHistory);
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
  }, []);

  // Sync dark mode class on HTML body
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredSettings(settings);
  }, [settings.darkMode, settings]);

  const handleSaveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem => {
    const saved = addHistoryItem(item);
    setHistory(getStoredHistory());
    return saved;
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteItem(id);
    setHistory(updated);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleSelectQuickPrompt = (query: string, subject?: string) => {
    setQuickQuestion({ query, subject });
    setCurrentTab('ask');
  };

  const handleSelectItemFromHome = (item: HistoryItem) => {
    if (item.type === 'question') {
      setQuickQuestion({ query: item.query, subject: item.metadata?.subject });
      setCurrentTab('ask');
    } else if (item.type === 'image') {
      setCurrentTab('image');
    } else if (item.type === 'quiz') {
      setCurrentTab('history');
    } else {
      setCurrentTab('note');
    }
  };

  const handleTriggerInterstitial = (reason: string) => {
    if (settings.showAdPlaceholders) {
      setInterstitial({ isOpen: true, reason });
    }
  };

  const favoriteCount = history.filter((i) => i.isFavorite).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center selection:bg-emerald-500 selection:text-white font-sans transition-colors duration-200">
      {/* Mobile App Container: Gives realistic Android App layout on desktop, full-width on mobile */}
      <div className="w-full max-w-xl min-h-screen bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative">
        {/* App Header */}
        <Header
          currentTab={currentTab}
          setTab={setCurrentTab}
          darkMode={settings.darkMode}
          setDarkMode={(val) => handleUpdateSettings({ darkMode: val })}
          favoriteCount={favoriteCount}
        />

        {/* Screen Body */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeScreen
              setTab={setCurrentTab}
              recentItems={history}
              onSelectItem={handleSelectItemFromHome}
              onSelectQuickPrompt={handleSelectQuickPrompt}
            />
          )}

          {currentTab === 'ask' && (
            <QuestionScreen
              initialQuestion={quickQuestion?.query}
              initialSubject={quickQuestion?.subject}
              onSaveToHistory={handleSaveToHistory}
              onToggleFavorite={handleToggleFavorite}
              favorites={history.filter((i) => i.isFavorite)}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'image' && (
            <ImageQuestionScreen
              onSaveToHistory={handleSaveToHistory}
              onToggleFavorite={handleToggleFavorite}
              favorites={history.filter((i) => i.isFavorite)}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizScreen
              onSaveToHistory={handleSaveToHistory}
              onShowInterstitialAd={handleTriggerInterstitial}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'note' && (
            <NoteScreen
              onSaveToHistory={handleSaveToHistory}
              onToggleFavorite={handleToggleFavorite}
              favorites={history.filter((i) => i.isFavorite)}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'history' && (
            <HistoryScreen
              items={history}
              defaultTab="history"
              onToggleFavorite={handleToggleFavorite}
              onDeleteItem={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'favorites' && (
            <HistoryScreen
              items={history}
              defaultTab="favorites"
              onToggleFavorite={handleToggleFavorite}
              onDeleteItem={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
              fontSize={settings.fontSize}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearAllHistory}
              historyCount={history.length}
            />
          )}
        </main>

        {/* AdMob Banner Placeholder (Monetization Preview) */}
        <AdBanner visible={settings.showAdPlaceholders} />

        {/* Bottom Navigation */}
        <BottomNav currentTab={currentTab} setTab={setCurrentTab} />

        {/* AdMob Interstitial Dialog Simulator */}
        <InterstitialAdModal
          isOpen={interstitial.isOpen}
          onClose={() => setInterstitial({ isOpen: false, reason: '' })}
          triggerReason={interstitial.reason}
        />
      </div>
    </div>
  );
}
