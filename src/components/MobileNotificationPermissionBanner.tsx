import React, { useState, useEffect } from 'react';
import { BellRing, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { BackgroundSyncService, BackgroundServiceState } from '../services/backgroundSyncService';
import { SoundNotificationService } from '../services/soundNotificationService';

interface MobileNotificationPermissionBannerProps {
  lang: 'bn' | 'en';
  onOpenSyncModal: () => void;
}

export const MobileNotificationPermissionBanner: React.FC<MobileNotificationPermissionBannerProps> = ({
  lang,
  onOpenSyncModal
}) => {
  const [state, setState] = useState<BackgroundServiceState>(BackgroundSyncService.getState());
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('al_sheikh_notif_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const unsub = BackgroundSyncService.subscribe(setState);
    return () => unsub();
  }, []);

  // Only show if permission is default and not dismissed
  if (state.notificationPermission !== 'default' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    await BackgroundSyncService.requestNotificationPermission();
    SoundNotificationService.playNotificationChime();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('al_sheikh_notif_banner_dismissed', 'true');
  };

  return (
    <aside
      id="mobile-notification-permission-banner"
      aria-label="Mobile push notification alert banner"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-stone-950/95 border border-amber-500/40 text-stone-100 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>{lang === 'bn' ? 'মোবাইলে রিয়েল-টাইম অ্যালার্ট' : 'Real-Time Mobile Alerts'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </h4>
          <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
            {lang === 'bn'
              ? 'অ্যাপ মিনিমাইজ থাকলেও কিচেন ও অর্ডার আপডেট সরাসরি পেতে নোটিফিকেশন চালু করুন।'
              : 'Keep active with kitchen & order alerts even when app is minimized.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleEnable}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          {lang === 'bn' ? 'চালু করুন' : 'Enable'}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          title={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
