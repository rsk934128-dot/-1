import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Share2, 
  QrCode, 
  Smartphone, 
  Download, 
  Printer, 
  Copy, 
  CheckCheck, 
  X, 
  MessageCircle, 
  Send, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Crown,
  Laptop,
  Apple,
  ArrowRight,
  Info,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HOTEL_INFO } from '../data/initialData';

export interface AppShareAndInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const AppShareAndInstallModal: React.FC<AppShareAndInstallModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [flyerQrUrl, setFlyerQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'social' | 'guide' | 'flyer'>('qr');
  const [selectedPlatformGuide, setSelectedPlatformGuide] = useState<'android' | 'ios' | 'pc'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // App Share URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hotel-al-sheikh-farid.app';
  
  const shareTitleBn = `হোটেল আল শেখ ফরিদ - অনলাইন ফুড অর্ডার ও ডিজিটাল সার্ভিস অ্যাপ`;
  const shareTitleEn = `Hotel Al Sheikh Farid - Online Food Order & Digital Dining App`;

  const shareTextBn = `🏨 হোটেল আল শেখ ফরিদ (Hotel Al Sheikh Farid) - ঐতিহ্যবাহী বাঙালি খাবার, স্পেশাল বিরিয়ানি ও দেশি মিষ্টান্নের বিশ্বস্ত ঠিকানা! অনলাইনে দ্রুত খাবার অর্ডার করতে বা মোবাইল অ্যাপ ইন্সটল করতে নিচের লিংকে ক্লিক করুন:\n👉 ${appUrl}`;
  const shareTextEn = `🏨 Hotel Al Sheikh Farid - Authentic traditional Bengali cuisine, Biryani & sweets in Mirsharai! Order delicious meals or install our mobile web app now:\n👉 ${appUrl}`;

  // Catch PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Generate QR Code data URL
  useEffect(() => {
    if (!isOpen) return;

    // Direct app URL for instant scanning
    QRCode.toDataURL(appUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrCodeUrl(url);
        setFlyerQrUrl(url);
      })
      .catch((err) => console.error('Error generating App QR Code:', err));
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#fbbf24'],
      });
    } catch {}
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'bn' ? shareTitleBn : shareTitleEn,
          text: lang === 'bn' ? shareTextBn : shareTextEn,
          url: appUrl,
        });
      } catch (error) {
        console.log('Share canceled or error:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `Hotel-Al-Sheikh-Farid-App-Install-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTableFlyer = () => {
    window.print();
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAppInstalled(true);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
      setDeferredPrompt(null);
    } else {
      setActiveTab('guide');
    }
  };

  // Social Share URLs
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedText = encodeURIComponent(lang === 'bn' ? shareTextBn : shareTextEn);

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Messenger',
      icon: <Send className="w-5 h-5 text-sky-400" />,
      color: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
      url: `fb-messenger://share/?link=${encodedUrl}`,
      fallbackUrl: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=29149441919&redirect_uri=${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: <Send className="w-5 h-5 text-sky-300" />,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5 text-stone-200" />,
      color: 'bg-stone-800 hover:bg-stone-700 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5 text-blue-300" />,
      color: 'bg-sky-700 hover:bg-sky-800 text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'SMS',
      icon: <Smartphone className="w-5 h-5 text-amber-300" />,
      color: 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700',
      url: `sms:?body=${encodedText}`,
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5 text-purple-300" />,
      color: 'bg-purple-700 hover:bg-purple-800 text-white',
      url: `mailto:?subject=${encodeURIComponent(lang === 'bn' ? shareTitleBn : shareTitleEn)}&body=${encodedText}`,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 shadow-2xl text-white overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 pb-3 border-b border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <QrCode className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                  {lang === 'bn' ? 'অ্যাপ শেয়ার ও কিউআর কোড স্ক্যানার' : 'App Share & QR Code Scanner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'bn' 
                  ? 'যেকোনো মোবাইল দিয়ে কিউআর কোড স্ক্যান করে অ্যাপ ইন্সটল ও বিভিন্ন সোশ্যাল মিডিয়ায় শেয়ার করুন'
                  : 'Scan QR code from any smartphone to install app & share across media platforms'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 sm:px-6 gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কিউআর কোড স্ক্যান' : 'QR Scan & Install'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'মিডিয়া ও সোশ্যাল শেয়ার' : 'Media Share'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ইন্সটল গাইড' : 'Install Guide'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flyer')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'flyer'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'টেবিল স্ট্যান্ড পোস্টার' : 'Table Stand Flyer'}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: QR CODE SCAN & INSTANT INSTALL */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-center gap-5">
                {/* Scannable High-Definition QR Code */}
                <div className="relative group shrink-0">
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl border-4 border-amber-500/70 flex items-center justify-center relative overflow-hidden">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="App Install QR Code" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-12 h-12 text-stone-800 animate-pulse" />
                    )}

                    {/* Corner Target Markers */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600 pointer-events-none" />
                  </div>
                </div>

                {/* Instructions and Quick Actions */}
                <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 mb-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'bn' ? 'সরাসরি মোবাইল ক্যামেরা স্ক্যান' : 'Direct Camera Scan'}</span>
                    </span>
                    <h4 className="text-base font-bold text-white font-serif">
                      {lang === 'bn' ? 'মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন' : 'Scan with Any Phone Camera'}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      {lang === 'bn'
                        ? 'আপনার অ্যান্ড্রয়েড বা আইফোনের ক্যামেরা চালু করে এই কিউআর কোডের দিকে তাক করলেই অ্যাপ চালু হবে এবং সরাসরি হোম স্ক্রিনে ইন্সটল করার অপশন পাবেন।'
                        : 'Point your phone camera (Android/iPhone) at the QR code to open the app instantly and install to home screen.'}
                    </p>
                  </div>

                  {/* App Link Box */}
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-300 font-mono truncate select-all">{appUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-stone-700"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'কপি লিংক' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কিউআর ছবি ডাউনলোড' : 'Save QR Image'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার' : 'Share to Apps'}</span>
                    </button>

                    {!isAppInstalled && (
                      <button
                        type="button"
                        onClick={handleTriggerInstall}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'এই ডিভাইসে ইন্সটল' : 'Install on This Device'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-PLATFORM SOCIAL MEDIA SHARING */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-200 font-serif">
                    {lang === 'bn' ? 'এক ক্লিকে সোশ্যাল মিডিয়ায় শেয়ার করুন' : '1-Click Social Media Sharing'}
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    {lang === 'bn' ? 'গ্রাহক ও বন্ধুবান্ধবদের পাঠান' : 'Send to friends & family'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {socialLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-center ${item.color}`}
                    >
                      {item.icon}
                      <span className="text-xs font-bold">{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Native System Share & Pre-formatted Message */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">
                    {lang === 'bn' ? 'প্রি-মেড মেসেজ টেক্সট' : 'Pre-Formatted Share Message'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (lang === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (lang === 'bn' ? 'মেসেজ কপি করুন' : 'Copy Message')}</span>
                  </button>
                </div>

                <p className="p-3 rounded-xl bg-stone-900 text-xs text-stone-300 leading-relaxed font-sans select-all whitespace-pre-line border border-stone-800">
                  {lang === 'bn' ? shareTextBn : shareTextEn}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'মোবাইলের সকল অ্যাপে শেয়ার (Share Sheet)' : 'Open Native Device Share Sheet'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP SCAN & INSTALL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              {/* Platform Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setSelectedPlatformGuide('android')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedPlatformGuide === 'android'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android (Chrome)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformGuide('ios')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedPlatformGuide === 'ios'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformGuide('pc')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedPlatformGuide === 'pc'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop / PC</span>
                </button>
              </div>

              {/* Android Guide */}
              {selectedPlatformGuide === 'android' && (
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <h5 className="text-xs font-bold text-emerald-300">
                      {lang === 'bn' ? 'অ্যান্ড্রয়েড ফোনে কিউআর স্ক্যান ও ইন্সটল নিয়ম' : 'Android Chrome Installation Steps'}
                    </h5>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                      <div>
                        <p className="font-bold text-white">কিউআর কোড স্ক্যান করুন</p>
                        <p className="text-stone-400 text-[11px]">ক্যামেরা বা Google Lens দিয়ে কিউআর স্ক্যান করে Chrome ব্রাউজারে লিংক ওপেন করুন।</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                      <div>
                        <p className="font-bold text-white">"অ্যাপ ইন্সটল করুন" ব্যানার বা ৩-ডট মেনু</p>
                        <p className="text-stone-400 text-[11px]">স্ক্রিনের নিচে আসা <span className="text-amber-300 font-bold">Install App</span> ব্যানারে চাপ দিন অথবা উপরে ৩-ডট (⋮) চেপে <span className="text-amber-300 font-bold">"Add to Home screen"</span> দিন।</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">৩</span>
                      <div>
                        <p className="font-bold text-emerald-300">ইনস্ট্যান্ট অ্যাপ হিসেবে সেভ</p>
                        <p className="text-stone-400 text-[11px]">মোবাইলের হোম স্ক্রিনে সরাসরি অ্যাপের আইকন চলে আসবে এবং নেট ছাড়াও দ্রুত কাজ করবে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* iOS Guide */}
              {selectedPlatformGuide === 'ios' && (
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-sky-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
                      <Apple className="w-4 h-4" />
                    </span>
                    <h5 className="text-xs font-bold text-sky-300">
                      {lang === 'bn' ? 'আইফোন / আইপ্যাডে (Safari) ইন্সটল নিয়ম' : 'iPhone Safari Installation Steps'}
                    </h5>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                      <div>
                        <p className="font-bold text-white">iPhone Camera দিয়ে স্ক্যান করুন</p>
                        <p className="text-stone-400 text-[11px]">আইফোনের ক্যামেরা অ্যাপ অন করে কিউআর স্ক্যান করে Safari ব্রাউজারে লিংক ওপেন করুন।</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                      <div>
                        <p className="font-bold text-white">Share (শেয়ার) আইকনে চাপ দিন</p>
                        <p className="text-stone-400 text-[11px]">Safari-র নিচে থাকা স্কয়ার তীরের <span className="text-amber-300 font-bold">Share</span> আইকনে চাপুন।</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">৩</span>
                      <div>
                        <p className="font-bold text-sky-300">"Add to Home Screen" নির্বাচন করুন</p>
                        <p className="text-stone-400 text-[11px]">মেনু থেকে <span className="text-amber-300 font-bold">Add to Home Screen</span> চাপুন এবং উপরে ডানপাশে <span className="text-emerald-400 font-bold">Add</span> বাটনে চাপ দিন।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PC Guide */}
              {selectedPlatformGuide === 'pc' && (
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                      <Laptop className="w-4 h-4" />
                    </span>
                    <h5 className="text-xs font-bold text-purple-300">
                      {lang === 'bn' ? 'কম্পিউটার বা ল্যাপটপে ইন্সটল নিয়ম' : 'Desktop / PC Installation Steps'}
                    </h5>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                      <div>
                        <p className="font-bold text-white">Google Chrome বা Edge ব্রাউজারে লিংক ওপেন করুন</p>
                        <p className="text-stone-400 text-[11px]">কম্পিউটারে ওয়েবসাইটটি ভিজিট করুন।</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                      <div>
                        <p className="font-bold text-white">অ্যাড্রেস বারের Install বাটনে ক্লিক করুন</p>
                        <p className="text-stone-400 text-[11px]">URL বারের ডানপাশে থাকা <span className="text-amber-300 font-bold">"Install Hotel Al Sheikh Farid"</span> আইকনে চাপুন।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRINTABLE RESTAURANT TABLE STAND / FLYER */}
          {activeTab === 'flyer' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-white text-stone-900 border-2 border-amber-500/60 shadow-xl space-y-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-md">
                  <Crown className="w-6 h-6 text-stone-950" />
                </div>

                <div>
                  <h3 className="text-lg font-black font-serif text-stone-950">{HOTEL_INFO.nameBn}</h3>
                  <p className="text-xs text-amber-800 font-bold tracking-wider">{HOTEL_INFO.taglineBn}</p>
                </div>

                {/* Table Stand Flyer QR */}
                <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-200 inline-block mx-auto shadow-inner">
                  {flyerQrUrl ? (
                    <img 
                      src={flyerQrUrl} 
                      alt="Table Stand QR Code" 
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <QrCode className="w-44 h-44 text-stone-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-950 font-serif">
                    📱 মোবাইল দিয়ে স্ক্যান করে খাবার অর্ডার ও অ্যাপ ইন্সটল করুন
                  </p>
                  <p className="text-xs text-stone-600">
                    টেবিলে বসে সরাসরি মেনু দেখুন, স্পেশাল আইটেম পছন্দ করুন এবং বিল ট্র্যাক করুন।
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono font-semibold pt-1">
                    {HOTEL_INFO.locationBn} | হেল্পলাইন: {HOTEL_INFO.phone1}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>কিউআর ইমেজ ডাউনলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintTableFlyer}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>প্রিন্ট করুন (Print Poster)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{lang === 'bn' ? 'সরাসরি ক্লাউড সিঙ্ক ও পিডব্লিউএ সাপোর্ট' : 'Cloud Sync & PWA Ready'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
