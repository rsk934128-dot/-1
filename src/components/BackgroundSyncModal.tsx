import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Bell,
  BellRing,
  Smartphone,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  RefreshCw,
  Sun,
  Eye,
  EyeOff,
  Radio,
  Battery,
  BatteryCharging,
  BatteryLow,
  Moon
} from 'lucide-react';
import { BackgroundSyncService, BackgroundServiceState } from '../services/backgroundSyncService';
import { SoundNotificationService } from '../services/soundNotificationService';

interface BackgroundSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const BackgroundSyncModal: React.FC<BackgroundSyncModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [state, setState] = useState<BackgroundServiceState>(BackgroundSyncService.getState());
  const [testCountdown, setTestCountdown] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isInstalledApp, setIsInstalledApp] = useState<boolean>(false);

  useEffect(() => {
    const unsub = BackgroundSyncService.subscribe(setState);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalledApp(isStandalone);
    }
  }, []);

  // Countdown timer for test push
  useEffect(() => {
    if (testCountdown === null) return;
    if (testCountdown <= 0) {
      setTestCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setTestCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [testCountdown]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    await BackgroundSyncService.requestNotificationPermission();
    SoundNotificationService.playNotificationChime();
  };

  const handleToggleWakeLock = async () => {
    await BackgroundSyncService.toggleWakeLock();
    SoundNotificationService.playNotificationChime();
  };

  const handleStartMinimizationTest = () => {
    BackgroundSyncService.scheduleTestPush(4, lang);
    setTestCountdown(4);
    SoundNotificationService.playNotificationChime();
  };

  const handleMeasurePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch('/favicon.svg?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      const latency = Math.round(performance.now() - start);
      setPingLatency(latency);
    } catch {
      setPingLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  const isNotificationGranted = state.notificationPermission === 'granted';

  return (
    <div
      id="background-sync-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-stone-900 border border-amber-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-900/60 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-2">
                {lang === 'bn' ? 'অলওয়েজ একটিভ ও ব্যাকগ্রাউন্ড সিঙ্ক' : 'Always Active & Background Sync'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {state.isOnline ? (lang === 'bn' ? 'অনলাইন' : 'Online') : (lang === 'bn' ? 'অফলাইন' : 'Offline')}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                {lang === 'bn'
                  ? 'মোবাইল ডিভাইস মিনিমাইজ থাকলেও সকল সময় রিয়েল-টাইমে সক্রিয়'
                  : 'Stays connected in real time even when minimized or locked'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-stone-200">
          {/* Main Status Hero Card */}
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? 'সিস্টেম কানেক্টিভিটি স্ট্যাটাস' : 'System Connectivity Status'}
              </span>
              <button
                onClick={handleMeasurePing}
                disabled={isPinging}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>
                  {pingLatency !== null
                    ? `${pingLatency} ms`
                    : lang === 'bn' ? 'লেটেন্সি মাপুন' : 'Check Ping'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Online Network */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${state.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {state.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'ইন্টারনেট' : 'Internet'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.isOnline ? (lang === 'bn' ? 'সংযুক্ত ✓' : 'Connected ✓') : (lang === 'bn' ? 'বিচ্ছিন্ন ✗' : 'Offline ✗')}
                  </span>
                </div>
              </div>

              {/* Service Worker */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${state.swRegistered ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'সার্ভিস ওয়ার্কার' : 'Worker Engine'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.swRegistered ? (lang === 'bn' ? 'সক্রিয় ✓' : 'Active ✓') : (lang === 'bn' ? 'লোড হচ্ছে' : 'Pending')}
                  </span>
                </div>
              </div>

              {/* App View */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${state.isAppMinimized ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {state.isAppMinimized ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'ভিউ' : 'View'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.isAppMinimized
                      ? (lang === 'bn' ? 'মিনিমাইজ' : 'Minimized')
                      : (lang === 'bn' ? 'ওপেন' : 'Foreground')}
                  </span>
                </div>
              </div>

              {/* Low Power Mode Status */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${state.isLowPowerMode ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {state.isLowPowerMode ? <BatteryLow className="w-4 h-4 animate-pulse" /> : <Battery className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'পাওয়ার মোড' : 'Power Mode'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.isLowPowerMode ? (lang === 'bn' ? 'সেভার অন' : 'Low Power') : (lang === 'bn' ? 'স্বাভাবিক' : 'Standard')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Setting 1: System Mobile Notifications */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isNotificationGranted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100">
                    {lang === 'bn' ? 'মোবাইল সিস্টেম পুশ নোটিফিকেশন' : 'Native Mobile Push Notifications'}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    {lang === 'bn'
                      ? 'অ্যাপ মিনিমাইজ বা স্ক্রিন লক থাকলেও নতুন অর্ডার, কিচেন আপডেট ও ডেলিভারি স্ট্যাটাস সরাসরি ফোনের নোটিফিকেশন শেডে আসবে।'
                      : 'Delivers system alerts to your phone notification drawer & lock screen even when minimized.'}
                  </p>
                </div>
              </div>

              {isNotificationGranted ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'অনুমোদিত' : 'Granted'}
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition-all shrink-0 cursor-pointer"
                >
                  {lang === 'bn' ? 'অনুমতি দিন' : 'Enable'}
                </button>
              )}
            </div>
          </div>

          {/* Setting 2: Screen WakeLock (Always-On Display) */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${state.isWakeLockActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-stone-800 text-stone-400'}`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                    {lang === 'bn' ? 'স্ক্রিন অলওয়েজ অন (Wake Lock)' : 'Screen Always-On (Wake Lock)'}
                    {state.isWakeLockActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    {lang === 'bn'
                      ? 'অর্ডার প্রস্তুত বা টেবিলে বসে থাকার সময় মোবাইলের স্ক্রিন স্বয়ংক্রিয়ভাবে স্লিপ/লক হওয়া প্রতিহত করে।'
                      : 'Prevents your phone display from auto-dimming or sleeping while tracking active orders.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleWakeLock}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
                  state.isWakeLockActive
                    ? 'bg-amber-500 text-stone-950 shadow-amber-500/30 shadow-md'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                {state.isWakeLockActive
                  ? (lang === 'bn' ? 'চালু আছে ✓' : 'ON ✓')
                  : (lang === 'bn' ? 'চালু করুন' : 'Turn ON')}
              </button>
            </div>
          </div>

          {/* Setting 3: Low Power Mode (Battery Saver & Screen Dimmer) */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            state.isLowPowerMode
              ? 'bg-amber-950/40 border-amber-500/50 shadow-inner'
              : 'bg-stone-950/60 border-stone-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  state.isLowPowerMode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {state.isCharging ? (
                    <BatteryCharging className="w-5 h-5 text-emerald-400" />
                  ) : state.isLowPowerMode ? (
                    <BatteryLow className="w-5 h-5 text-amber-400 animate-pulse" />
                  ) : (
                    <Battery className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                      {lang === 'bn' ? 'লো পাওয়ার মোড (ব্যাটারি সেভার)' : 'Low Power Mode (Battery Saver)'}
                    </h4>
                    {state.isLowPowerMode && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {lang === 'bn' ? 'সক্রিয় (UI ডিমড)' : 'Active (Dimmed)'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    {lang === 'bn'
                      ? 'মোবাইল ব্যাটারি ২০% বা তার নিচে নামলে স্বয়ংক্রিয়ভাবে ভারী অ্যানিমেশন বন্ধ করে, স্ক্রিন ডিম করে এবং ব্যাকগ্রাউন্ড সিঙ্ক ৩০ সেকেন্ডে নামিয়ে চার্জ দীর্ঘস্থায়ী করে।'
                      : 'Automatically disables non-essential animations, dims the UI, and reduces background sync to 30s when battery is low.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Battery Level, Sync Frequency, & Animation Status */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  {state.isCharging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Battery className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'ব্যাটারি লেভেল' : 'Battery Level'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.batteryLevel !== null ? `${Math.round(state.batteryLevel * 100)}%` : (lang === 'bn' ? 'শনাক্ত' : 'Standard')}
                    {state.isCharging ? ` (${lang === 'bn' ? 'চার্জিং' : 'Charging'})` : ''}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'সিঙ্ক বিরতি' : 'Sync Interval'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.syncIntervalMs / 1000}s ({state.isLowPowerMode ? (lang === 'bn' ? 'সাশ্রয়ী' : 'Throttled') : (lang === 'bn' ? 'লাইভ' : 'High Speed')})
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'অ্যানিমেশন ও আলো' : 'Animations & Dim'}</span>
                  <span className="text-xs font-black text-stone-100">
                    {state.isLowPowerMode ? (lang === 'bn' ? 'বন্ধ ও ডিমড' : 'Halted & Dim') : (lang === 'bn' ? 'পূর্ণ সক্রিয়' : 'Full / Smooth')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Preferences & Battery Simulation Tester */}
            <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => {
                    BackgroundSyncService.setLowPowerModePreference('auto');
                    SoundNotificationService.playNotificationChime();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    state.lowPowerModePreference === 'auto'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'স্বয়ংক্রিয় (Auto)' : 'Auto (≤20%)'}
                </button>
                <button
                  onClick={() => {
                    BackgroundSyncService.setLowPowerModePreference('enabled');
                    SoundNotificationService.playNotificationChime();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    state.lowPowerModePreference === 'enabled'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'চালু (ON)' : 'Always ON'}
                </button>
                <button
                  onClick={() => {
                    BackgroundSyncService.setLowPowerModePreference('disabled');
                    SoundNotificationService.playNotificationChime();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    state.lowPowerModePreference === 'disabled'
                      ? 'bg-stone-700 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'বন্ধ (OFF)' : 'OFF'}
                </button>
              </div>

              {/* Simulation test button */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (state.batteryLevel !== null && state.batteryLevel <= 0.15) {
                      BackgroundSyncService.resetBatterySimulation();
                    } else {
                      BackgroundSyncService.simulateBattery(0.14, false);
                    }
                    SoundNotificationService.playNotificationChime();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold border border-stone-700 transition-colors cursor-pointer"
                  title={lang === 'bn' ? '১৪% ব্যাটারি লেভেল সিমুলেট করে লো পাওয়ার মোড পরীক্ষা করুন' : 'Simulate 14% low battery to test'}
                >
                  {state.batteryLevel !== null && state.batteryLevel <= 0.15
                    ? (lang === 'bn' ? 'রিসেট করুন ↺' : 'Reset Battery ↺')
                    : (lang === 'bn' ? '🧪 টেস্ট: ১৪% ব্যাটারি' : '🧪 Test: 14% Low Battery')}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Live Minimized Test */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  {lang === 'bn' ? 'মিনিমাইজ টেস্ট পরীক্ষা' : 'Test Background Minimized Push'}
                </h4>
              </div>
              <span className="text-[10px] text-amber-400 font-medium">
                {lang === 'bn' ? 'সাউন্ড ও ভাইব্রেশন সহ' : 'Sound & Vibration'}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'bn'
                ? 'নিচের বাটনে চাপ দিয়ে সঙ্গে সঙ্গে আপনার মোবাইলের হোম বাটন চেপে অ্যাপ মিনিমাইজ করুন। ৪ সেকেন্ডের মধ্যে রিয়েল-টাইম নোটিফিকেশন ফোনের পর্দায় হাজির হবে!'
                : 'Click the button below and immediately minimize the app (press Home). A real background notification with audio & vibration will pop up in 4 seconds!'}
            </p>

            {testCountdown !== null ? (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center space-y-1">
                <span className="text-lg font-black text-amber-300 animate-pulse block">
                  {lang === 'bn' ? `এখন অ্যাপ মিনিমাইজ করুন! (${testCountdown}s)` : `Minimize App Now! (${testCountdown}s)`}
                </span>
                <p className="text-[11px] text-stone-300">
                  {lang === 'bn' ? 'হোম বাটন চাপুন বা অন্য অ্যাপে যান...' : 'Press your phone Home button...'}
                </p>
              </div>
            ) : (
              <button
                onClick={handleStartMinimizationTest}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>
                  {lang === 'bn' ? 'টেস্ট শুরু করুন (৪ সেকেন্ডে ব্যাকগ্রাউন্ড পুশ)' : 'Start 4s Background Push Test'}
                </span>
              </button>
            )}
          </div>

          {/* Sound & Vibration Diagnostic Test */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/40 border border-stone-800 text-xs">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              {lang === 'bn' ? 'কিচেন বেল ও ভাইব্রেশন পরীক্ষা' : 'Kitchen Bell & Vibration Test'}
            </span>
            <button
              onClick={() => {
                SoundNotificationService.testSound('new_order');
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate([200, 100, 200, 100, 300]); } catch {}
                }
              }}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold cursor-pointer"
            >
              {lang === 'bn' ? 'রিং বাজান 🔔' : 'Ring Bell 🔔'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ PWA ক্লাউড সিঙ্ক' : 'Al Sheikh Farid PWA Cloud Sync'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
