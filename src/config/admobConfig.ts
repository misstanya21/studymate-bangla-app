import { AdMobConfig } from '../types';

/**
 * Google AdMob Configuration
 *
 * NOTE: Google AdMob Official Test Ad Unit IDs are used below so that developers
 * can test their monetization integration without violating Google AdMob policies.
 * When preparing for production release on Google Play:
 * 1. Create your app in Google AdMob Console.
 * 2. Replace test IDs with your real Production Ad Unit IDs.
 * 3. Never use live production ad unit IDs during development or testing!
 */
export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  enabled: true,
  isTestMode: true,
  // Official Android Test App ID from Google AdMob documentation
  appId: 'ca-app-pub-3940256099942544~3347511713',
  // Official Android Banner Test Ad Unit ID
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  // Official Android Interstitial Test Ad Unit ID
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  // Official Android Rewarded Test Ad Unit ID
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
};

export const MONETIZATION_TIPS = [
  'ব্যানার বিজ্ঞাপন সাধারণত হোম স্ক্রিন বা ফলাফল স্ক্রিনের নিচে দেখানো সেরা।',
  'ইন্টারস্টিশিয়াল বিজ্ঞাপন কুইজ সমাপ্তির পর অথবা নোট সেভ করার পর পরিমিতভাবে দেখানো উচিত।',
  'শিক্ষার্থীদের বিরক্তি এড়াতে প্রতি ৩-৪টি কুইজ পর একবার ফুলস্ক্রিন অ্যাড দেখানো ভালো নীতি।',
];
