import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare, ArrowRight, QrCode } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallBannerProps {
  lang: 'bn' | 'en';
  onOpenShareAndQr?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ lang, onOpenShareAndQr }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating or Inline PWA Installation Card */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-stone-900 border-2 border-amber-400/80 overflow-hidden shadow-md shrink-0 flex items-center justify-center p-0.5">
            <img 
              src="/icon-192.png" 
              alt="App Icon" 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // fallback to svg
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-serif text-amber-200">
                {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ অ্যাপ' : 'Hotel Al Sheikh Farid App'}
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                PWA Fast
              </span>
            </div>
            <p className="text-[11px] text-stone-300 line-clamp-1">
              {lang === 'bn' 
                ? 'মোবাইলে সরাসরি ইন্সটল করে অফলাইন মোড ও দ্রুত অর্ডারের সুবিধা নিন।' 
                : 'Install on your mobile phone for fast orders and offline access.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-end">
          {onOpenShareAndQr && (
            <button
              type="button"
              onClick={onOpenShareAndQr}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
              title={lang === 'bn' ? 'কিউআর কোড স্ক্যান বা শেয়ার করুন' : 'Share QR or App Link'}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'QR ও শেয়ার' : 'QR & Share'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-950" />
            <span>{lang === 'bn' ? 'অ্যাপ ইন্সটল করুন' : 'Install App'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={lang === 'bn' ? 'লুকান' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-stone-900 border border-amber-500/40 p-5 text-white shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 shrink-0">
                <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 font-serif">
                  {lang === 'bn' ? 'আইফোন / আইপ্যাডে ইন্সটল নিয়ম' : 'Install on iPhone / iPad'}
                </h3>
                <p className="text-xs text-stone-400">Safari Browser</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-stone-300 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <p>Safari ব্রাউজারের নিচে থাকা <span className="text-amber-300 font-bold">Share (শেয়ার)</span> আইকনে চাপ দিন।</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <p>মেনু থেকে <span className="text-amber-300 font-bold">Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</span> সিলেক্ট করুন।</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <p>উপরে ডানপাশে <span className="text-emerald-400 font-bold">Add</span> চাপলে অ্যাপটি হোম স্ক্রিনে যোগ হবে।</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs text-center transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
