import React, { useState, useEffect } from 'react';
import { BatteryLow, Sliders, X } from 'lucide-react';
import { BackgroundSyncService, BackgroundServiceState } from '../services/backgroundSyncService';

interface LowPowerModeBannerProps {
  lang: 'bn' | 'en';
  onOpenSyncModal: () => void;
}

export const LowPowerModeBanner: React.FC<LowPowerModeBannerProps> = ({
  lang,
  onOpenSyncModal
}) => {
  const [state, setState] = useState<BackgroundServiceState>(() => BackgroundSyncService.getState());
  const [minimizedBanner, setMinimizedBanner] = useState<boolean>(false);

  useEffect(() => {
    const unsub = BackgroundSyncService.subscribe(setState);
    return () => unsub();
  }, []);

  if (!state.isLowPowerMode) {
    return null;
  }

  const batteryPct = state.batteryLevel !== null ? Math.round(state.batteryLevel * 100) : null;

  if (minimizedBanner) {
    return (
      <aside
        id="low-power-floating-indicator"
        aria-label="Low Power Mode active pill"
        className="fixed bottom-4 left-4 z-40"
      >
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/90 text-amber-200 border border-amber-500/50 shadow-xl backdrop-blur-md text-xs font-black cursor-pointer hover:bg-amber-900 transition-all active:scale-95"
          title={lang === 'bn' ? 'লো পাওয়ার মোড সেটিংস' : 'Low Power Mode Settings'}
        >
          <BatteryLow className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{lang === 'bn' ? `পাওয়ার সেভার${batteryPct ? ` (${batteryPct}%)` : ''}` : `Saver${batteryPct ? ` (${batteryPct}%)` : ''}`}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      id="low-power-mode-banner"
      aria-label="Low Power Mode Banner"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-amber-950/95 border border-amber-500/60 text-amber-100 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
          <BatteryLow className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black text-amber-200">
              {lang === 'bn' ? 'লো পাওয়ার মোড সক্রিয়' : 'Low Power Mode Active'}
            </h4>
            {batteryPct !== null && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/30 text-amber-300 font-bold">
                {batteryPct}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-200/80 leading-tight mt-0.5">
            {lang === 'bn'
              ? 'চার্জ সাশ্রয়ে স্ক্রিন ডিম, অ্যানিমেশন স্থগিত ও ব্যাকগ্রাউন্ড সিঙ্ক ৩০ সে. করা হয়েছে।'
              : 'UI dimmed, animations halted & sync throttled to 30s to preserve battery.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenSyncModal}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all cursor-pointer shadow-xs"
        >
          {lang === 'bn' ? 'সেটিংস' : 'Settings'}
        </button>
        <button
          onClick={() => setMinimizedBanner(true)}
          className="p-1 rounded-lg hover:bg-amber-900/60 text-amber-300/70 hover:text-amber-200 cursor-pointer"
          aria-label="Minimize low power banner"
          title={lang === 'bn' ? 'মিনিমাইজ' : 'Minimize'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
