import React, { useState } from 'react';
import { 
  WifiOff, 
  Wifi, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  HardDrive, 
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface OfflineCachedBannerProps {
  isCachedMode: boolean;
  isSimulatedOffline: boolean;
  lastSyncTime: Date | null;
  justReconnected: boolean;
  onRetryConnection: () => Promise<boolean>;
  onToggleSimulatedOffline: () => void;
  lang: 'bn' | 'en';
}

export const OfflineCachedBanner: React.FC<OfflineCachedBannerProps> = ({
  isCachedMode,
  isSimulatedOffline,
  lastSyncTime,
  justReconnected,
  onRetryConnection,
  onToggleSimulatedOffline,
  lang,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const ok = await onRetryConnection();
      if (ok) {
        setCheckResult(lang === 'bn' ? '✓ সফলভাবে অনলাইন সংযুক্ত হয়েছে!' : '✓ Connected online successfully!');
      } else {
        setCheckResult(lang === 'bn' ? 'ইন্টারনেট এখনো বিচ্ছিন্ন রয়েছে (ক্যাশ ডাটা সক্রিয়)' : 'Still offline (Cached data active)');
      }
    } catch {
      setCheckResult(lang === 'bn' ? 'সংযোগ স্থাপন করা যায়নি' : 'Unable to connect');
    } finally {
      setIsChecking(false);
      setTimeout(() => setCheckResult(null), 3500);
    }
  };

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : (lang === 'bn' ? 'সাম্প্রতিক' : 'Recent');

  // If back online recently, show temporary green banner
  if (justReconnected && !isCachedMode) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm animate-fadeIn z-40 transition-all border-b border-emerald-700">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="p-1 rounded-full bg-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            </span>
            <span>
              {lang === 'bn' 
                ? 'ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে! রিয়েলটাইম মোড ও লাইভ ডাটা সক্রিয়।' 
                : 'Internet connection restored! Live real-time mode active.'}
            </span>
          </div>
          <span className="text-[11px] bg-emerald-800/60 px-2.5 py-0.5 rounded-full font-medium">
            {lang === 'bn' ? 'অনলাইন' : 'Online'}
          </span>
        </div>
      </div>
    );
  }

  // If not cached mode and not reconnected, render nothing
  if (!isCachedMode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white shadow-lg border-b-2 border-amber-400 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          {/* Main Status & Message */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
              <WifiOff className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-200 text-xs font-black border border-amber-400/50 uppercase tracking-wider">
                  <Database className="w-3 h-3 text-amber-300" />
                  {lang === 'bn' ? 'ক্যাশ মোড সক্রিয়' : 'Cached Mode Active'}
                </span>

                {isSimulatedOffline && (
                  <span className="px-2 py-0.5 rounded-full bg-red-950/70 text-red-200 text-[10px] font-bold border border-red-400/40">
                    {lang === 'bn' ? 'অফলাইন টেস্ট সক্রিয়' : 'Simulated Offline'}
                  </span>
                )}

                <span className="text-xs text-amber-100 hidden md:inline-flex items-center gap-1 opacity-90">
                  <HardDrive className="w-3 h-3 text-amber-300" />
                  {lang === 'bn' ? `সর্বশেষ ক্যাশ সিঙ্ক: ${formattedTime}` : `Last cached: ${formattedTime}`}
                </span>
              </div>

              <p className="text-xs text-amber-50 mt-0.5 font-medium leading-relaxed">
                {lang === 'bn' 
                  ? 'ইন্টারনেট সংযোগ অনির্ভরযোগ্য। আপনি বর্তমানে লোকাল ডিভাইসে সংরক্ষিত মেনু ডাটা দেখছেন। অফলাইনেও অর্ডার ব্যাগে খাবার যোগ করা যাবে।'
                  : 'Internet is unstable or offline. You are currently viewing locally cached menu data. You can still add items to your cart.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Retry Button */}
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-xl bg-white text-amber-900 hover:bg-amber-100 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              title={lang === 'bn' ? 'ইন্টারনেট সংযোগ পুনরায় চেক করুন' : 'Test and retry connection'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-700' : 'text-amber-700'}`} />
              <span>{isChecking ? (lang === 'bn' ? 'যাচাই হচ্ছে...' : 'Checking...') : (lang === 'bn' ? 'পুনরায় সংযোগ যাচাই' : 'Retry')}</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={onToggleSimulatedOffline}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-950 text-amber-200 hover:text-white font-semibold text-xs border border-amber-400/40 transition-all cursor-pointer"
              title={lang === 'bn' ? 'সিমুলেশন মোড চালু/বন্ধ করুন' : 'Toggle offline simulation mode'}
            >
              {isSimulatedOffline 
                ? (lang === 'bn' ? 'অনলাইন মোডে ফিরুন' : 'Exit Offline Sim') 
                : (lang === 'bn' ? 'সিমুলেশন' : 'Simulate')}
            </button>

            {/* Expand Details Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-950 text-amber-200 border border-amber-400/30 cursor-pointer"
              title={lang === 'bn' ? 'ক্যাশ মোড বিবরণী' : 'Cache Details'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Check Result Toast Feedback */}
        {checkResult && (
          <div className="mt-2 text-xs bg-amber-950/80 text-amber-100 px-3 py-1.5 rounded-lg border border-amber-400/30 font-medium flex items-center gap-2 animate-fadeIn">
            <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{checkResult}</span>
          </div>
        )}

        {/* Expanded Info Drawer */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-amber-100 animate-fadeIn">
            <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-400/20">
              <span className="font-bold text-white block mb-0.5">📦 {lang === 'bn' ? 'ক্যাশ ডাটা সুরক্ষা' : 'Cache Resilience'}</span>
              <p className="text-[11px] text-amber-200 leading-tight">
                {lang === 'bn' ? 'মেনুর সব আইটেম, ছবি ও দাম লোকাল স্টোরেজে সুরক্ষিত।' : 'All menu items, images, and prices are cached safely locally.'}
              </p>
            </div>
            <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-400/20">
              <span className="font-bold text-white block mb-0.5">🛒 {lang === 'bn' ? 'অফলাইন অর্ডার ব্যাকআপ' : 'Offline Order Storage'}</span>
              <p className="text-[11px] text-amber-200 leading-tight">
                {lang === 'bn' ? 'সংযোগ না থাকলেও কার্টে খাবার যোগ ও ড্রাফট তৈরি সম্ভব।' : 'You can create orders and add meals offline without losing items.'}
              </p>
            </div>
            <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-400/20">
              <span className="font-bold text-white block mb-0.5">⚡ {lang === 'bn' ? 'স্বয়ংক্রিয় সিঙ্ক' : 'Auto Sync Engine'}</span>
              <p className="text-[11px] text-amber-200 leading-tight">
                {lang === 'bn' ? 'নেটওয়ার্ক ফিরে আসলেই সার্ভার ও অর্ডারের সাথে স্বয়ংক্রিয় সিঙ্ক হবে।' : 'Syncs with cloud database instantly once internet reconnects.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
