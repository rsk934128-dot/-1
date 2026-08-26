import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Volume2, 
  Store,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { PushNotificationPayload } from '../services/notificationService';
import { playNotificationChime } from '../utils/notificationSound';

interface BrowserPushNotificationToastProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  onViewOrder: (orderId?: string) => void;
  lang: 'bn' | 'en';
}

export const BrowserPushNotificationToast: React.FC<BrowserPushNotificationToastProps> = ({
  notification,
  onDismiss,
  onViewOrder,
  lang,
}) => {
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const duration = 9000; // 9 seconds
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(dismissTimer);
    };
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <aside 
      aria-label="Browser Push Notification"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 text-stone-100 ring-4 ring-amber-500/20"
    >
      {/* Browser Notification System Header Bar */}
      <div className="bg-stone-950/90 px-3.5 py-2 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Store className="w-3 h-3" />
          </div>
          <span className="font-semibold text-stone-200 text-[11px] truncate">
            {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ • পুশ নোটিফিকেশন' : 'Hotel Al Sheikh Farid • Push Alert'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playNotificationChime()}
            className="p-1 hover:text-amber-300 text-stone-400 transition-colors"
            title="শব্দ পুনরায় শুনুন"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-stone-400 font-mono">
            {notification.timestamp}
          </span>
          <button
            onClick={onDismiss}
            className="p-1 hover:text-white text-stone-400 rounded-md transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Notification Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar / Icon */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-stone-950 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">
                ✓
              </span>
            </span>
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-black text-amber-200 font-serif">
                {notification.title}
              </h4>
              {notification.orderId && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {notification.orderId}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              {notification.body}
            </p>

            {notification.statusText && (
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                <Sparkles className="w-3 h-3" />
                <span>{notification.statusText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onViewOrder(notification.orderId);
              onDismiss();
            }}
            className="flex-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অর্ডার বিস্তারিত দেখুন' : 'View Order Details'}</span>
          </button>

          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Dismiss'}
          </button>
        </div>
      </div>

      {/* Auto-Dismiss Linear Progress Bar */}
      <div className="h-1 w-full bg-stone-800">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};
