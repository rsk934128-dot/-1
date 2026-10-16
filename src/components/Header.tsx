import React from 'react';
import { 
  Phone, 
  Video, 
  PhoneCall,
  MessageSquare, 
  Mail, 
  ShoppingBag, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Menu, 
  X,
  Store,
  CheckCircle2,
  Mic,
  WifiOff,
  Database,
  UtensilsCrossed,
  Trophy,
  QrCode,
  Share2,
  Camera,
  Crown,
  Laptop,
  Palette,
  ChefHat,
  Flame,
  ScanLine,
  Radio,
  BatteryLow,
  Eye
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { ActiveTableSession, UserProfile } from '../types';
import { SeasonalThemeId, SEASONAL_THEMES } from '../utils/seasonalTheme';
import { BackgroundSyncService } from '../services/backgroundSyncService';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenTableBooking: () => void;
  onOpenTableQrScanner?: () => void;
  activeTableSession?: ActiveTableSession | null;
  onOpenShopLocationMap?: () => void;
  onOpenBackgroundSync?: () => void;
  onOpenShareAndQr?: () => void;
  onOpenSaaSMarketplace?: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenCallHistory?: () => void;
  onOpenChat: () => void;
  onOpenEmail: () => void;
  onOpenAi: () => void;
  onOpenLeaderboard?: () => void;
  onOpenBkashSms?: () => void;
  onOpenFoodGallery?: () => void;
  onOpenThemeModal?: () => void;
  onToggleVoiceCommand?: () => void;
  isVoiceListening?: boolean;
  unreadSmsCount?: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenAdminAuth?: () => void;
  adminViewMode?: 'admin' | 'customer_preview';
  onToggleAdminViewMode?: () => void;
  onExitAdmin?: () => void;
  isStaffMode?: boolean;
  onToggleStaffMode?: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  user?: UserProfile;
  isGoogleSignedIn?: boolean;
  isCachedMode?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
  currentThemeId?: SeasonalThemeId;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAccount,
  onOpenTableBooking,
  onOpenTableQrScanner,
  activeTableSession,
  onOpenShopLocationMap,
  onOpenBackgroundSync,
  onOpenShareAndQr,
  onOpenSaaSMarketplace,
  onStartCall,
  onOpenCallHistory,
  onOpenChat,
  onOpenEmail,
  onOpenAi,
  onOpenLeaderboard,
  onOpenBkashSms,
  onOpenFoodGallery,
  onOpenThemeModal,
  onToggleVoiceCommand,
  isVoiceListening = false,
  unreadSmsCount = 0,
  isAdmin,
  onToggleAdmin,
  onOpenAdminAuth,
  adminViewMode = 'admin',
  onToggleAdminViewMode,
  onExitAdmin,
  isStaffMode = false,
  onToggleStaffMode,
  lang,
  onToggleLang,
  user,
  isGoogleSignedIn = false,
  isCachedMode = false,
  isSimulatedOffline = false,
  onToggleSimulatedOffline,
  currentThemeId = 'classic',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLowPower, setIsLowPower] = React.useState<boolean>(() => BackgroundSyncService.getState().isLowPowerMode);
  const currentTheme = SEASONAL_THEMES[currentThemeId] || SEASONAL_THEMES.classic;

  React.useEffect(() => {
    const unsub = BackgroundSyncService.subscribe(st => setIsLowPower(st.isLowPowerMode));
    return () => unsub();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors duration-300">
      {/* Top Notice Bar with Seasonal Festival Theme Gradient */}
      <div className={`bg-gradient-to-r ${currentTheme.topNoticeGradient} text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 transition-all duration-500 shadow-inner`}>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {onOpenShopLocationMap ? (
            <button
              onClick={onOpenShopLocationMap}
              className="flex items-center gap-1.5 font-medium hover:text-amber-200 transition-colors cursor-pointer group text-left"
              title={lang === 'bn' ? 'দোকানের অবস্থান ও ম্যাপ দেখুন' : 'View Shop Location & Map'}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-amber-300/40 decoration-dashed underline-offset-2">
                {lang === 'bn' ? HOTEL_INFO.locationBn : HOTEL_INFO.locationEn}
              </span>
              <span className="hidden sm:inline-block bg-white/20 hover:bg-white/30 px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-100 ml-1">
                {lang === 'bn' ? '🗺️ ম্যাপ' : '🗺️ Map'}
              </span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{lang === 'bn' ? HOTEL_INFO.locationBn : HOTEL_INFO.locationEn}</span>
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5 text-white/90">
            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span>{lang === 'bn' ? HOTEL_INFO.openingHoursBn : HOTEL_INFO.openingHoursEn}</span>
          </span>
          {/* Active Festival Motif Icons Ribbon */}
          <span className="hidden lg:inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-[11px] border border-white/20">
            <span className="text-amber-300">{currentTheme.emoji}</span>
            <span className="font-medium">{lang === 'bn' ? currentTheme.taglineBn : currentTheme.taglineEn}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Seasonal Theme Switcher Trigger Pill in Top Bar */}
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer shadow-xs active:scale-95 group"
              title={lang === 'bn' ? 'মৌসুমি ও উৎসবের থিম পরিবর্তন করুন' : 'Change Seasonal & Festival Theme'}
            >
              <Palette className="w-3 h-3 text-amber-300 group-hover:rotate-45 transition-transform" />
              <span>{currentTheme.emoji}</span>
              <span className="hidden sm:inline">{lang === 'bn' ? currentTheme.nameBn : currentTheme.nameEn}</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full text-amber-200">
                {lang === 'bn' ? 'থিম' : 'Theme'}
              </span>
            </button>
          )}

          {/* Offline / Cached Mode Indicator Pill */}
          {isCachedMode && (
            <button
              onClick={onToggleSimulatedOffline}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 hover:bg-amber-950 text-amber-300 border border-amber-400/60 transition-all animate-pulse cursor-pointer shadow-xs"
              title={lang === 'bn' ? 'অফলাইন ক্যাশ মোড সক্রিয় (ক্লিক করে টগল করুন)' : 'Offline Cached Mode active (Click to toggle)'}
            >
              <WifiOff className="w-3 h-3 text-amber-300" />
              <span>{lang === 'bn' ? 'অফলাইন / ক্যাশ' : 'Offline / Cached'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </button>
          )}

          {/* Active Table Check-in or Table QR Scanner Trigger in Top Bar */}
          {onOpenTableQrScanner && (
            <button
              id="header-table-qr-scanner-pill"
              onClick={onOpenTableQrScanner}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 ${
                activeTableSession
                  ? 'bg-emerald-500 text-stone-950 ring-2 ring-emerald-300 shadow-md font-black animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 hover:from-amber-400 hover:to-orange-400 font-black'
              }`}
              title={lang === 'bn' ? 'টেবিল কিউআর স্ক্যান করে দ্রুত অর্ডার ও চেক-ইন করুন' : 'Scan Table QR for Instant Dine-In Ordering'}
            >
              <ScanLine className="w-3 h-3 text-stone-950" />
              <span>
                {activeTableSession
                  ? (lang === 'bn' ? `📍 ${activeTableSession.tableNumber}` : `📍 ${activeTableSession.tableNumber}`)
                  : (lang === 'bn' ? '📷 টেবিল কিউআর' : '📷 Table QR')}
              </span>
              {activeTableSession && <span className="w-1.5 h-1.5 rounded-full bg-stone-950"></span>}
            </button>
          )}

          {/* Real-time Background Sync & Always Active Pill in Top Bar */}
          {onOpenBackgroundSync && (
            <button
              id="header-background-sync-pill"
              onClick={onOpenBackgroundSync}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-xs cursor-pointer active:scale-95 transition-all ${
                isLowPower
                  ? 'bg-amber-600 hover:bg-amber-500 text-amber-100 border-amber-300/60 ring-1 ring-amber-300/30'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/50'
              }`}
              title={lang === 'bn' ? (isLowPower ? 'লো পাওয়ার মোড সক্রিয় (ব্যাটারি সেভার)' : 'অলওয়েজ একটিভ ও রিয়েল-টাইম ব্যাকগ্রাউন্ড সিঙ্ক সেটিংস') : (isLowPower ? 'Low Power Mode Active' : 'Always Active & Background Sync Settings')}
            >
              {isLowPower ? (
                <>
                  <BatteryLow className="w-3 h-3 text-amber-200 animate-pulse" />
                  <span>{lang === 'bn' ? 'পাওয়ার সেভার' : 'Low Power'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                  <span>{lang === 'bn' ? 'লাইভ একটিভ' : 'Live Active'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                </>
              )}
            </button>
          )}

          <a 
            href={`tel:${HOTEL_INFO.phone2}`}
            className="hidden md:inline-flex items-center gap-1.5 bg-black/25 hover:bg-black/40 px-2.5 py-0.5 rounded-full text-[11px] border border-white/25 text-amber-200 hover:text-white transition-all shadow-2xs"
            title={lang === 'bn' ? 'হোটেল মালিককে সরাসরি কল দিন' : 'Call Hotel Owner'}
          >
            <Phone className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>{lang === 'bn' ? `মালিক: ${HOTEL_INFO.proprietorBn} (${HOTEL_INFO.phone2})` : `Owner: ${HOTEL_INFO.proprietorEn} (${HOTEL_INFO.phone2})`}</span>
          </a>
          {/* Staff Mode Toggle Pill in Top Bar (Admin Only) */}
          {isAdmin && onToggleStaffMode && (
            <button
              id="header-staff-mode-toggle"
              onClick={onToggleStaffMode}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                isStaffMode
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-white/70 shadow-md font-black'
                  : 'bg-black/30 text-amber-200 hover:bg-black/50 hover:text-white border border-white/20'
              }`}
              title={lang === 'bn' ? 'কিচেন ও স্টাফ মোড চালু/বন্ধ করুন (অ্যাডমিন ড্যাশবোর্ডে দ্রুত রান্নার টুল দেখায়)' : 'Toggle Staff Mode (Reveals kitchen management tools in Admin Dashboard)'}
            >
              <ChefHat className={`w-3.5 h-3.5 ${isStaffMode ? 'text-stone-950 animate-bounce' : 'text-amber-300'}`} />
              <span>{isStaffMode ? (lang === 'bn' ? '👨‍🍳 স্টাফ মোড চালু' : '👨‍🍳 Staff Mode ON') : (lang === 'bn' ? 'স্টাফ মোড' : 'Staff Mode')}</span>
              {isStaffMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>}
            </button>
          )}

          {/* Admin & Role Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleAdmin}
                className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title={lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড প্রদর্শন করুন' : 'Toggle Admin Dashboard'}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
              </button>

              {onToggleAdminViewMode && (
                <button
                  type="button"
                  onClick={onToggleAdminViewMode}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    adminViewMode === 'customer_preview'
                      ? 'bg-amber-400 text-stone-950 font-black ring-1 ring-white/60'
                      : 'bg-black/30 text-amber-200 hover:bg-black/50 hover:text-white'
                  }`}
                  title={adminViewMode === 'customer_preview' ? 'কাস্টমার প্রিভিউ চলছে (অ্যাডমিন ভিউতে ফিরুন)' : 'কাস্টমাররা কী দেখতে পান তা প্রিভিউ করুন'}
                >
                  <Eye className="w-3 h-3" />
                  <span>{adminViewMode === 'customer_preview' ? (lang === 'bn' ? 'কাস্টমার প্রিভিউ' : 'Customer View') : (lang === 'bn' ? 'কাস্টমার প্রিভিউ' : 'Preview Customer')}</span>
                </button>
              )}

              {onExitAdmin && (
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-600/80 hover:bg-red-600 text-white transition-all cursor-pointer"
                  title="অ্যাডমিন মোড থেকে প্রস্থান করুন"
                >
                  {lang === 'bn' ? 'প্রস্থান' : 'Exit'}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminAuth}
              className="bg-black/30 hover:bg-black/50 text-amber-200 hover:text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer border border-white/15"
              title="হোটেল মালিক ও অ্যাডমিন লগইন"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span>{lang === 'bn' ? 'এডমিন লগইন' : 'Admin Login'}</span>
            </button>
          )}
          <button
            onClick={onToggleLang}
            className="bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded text-[11px] font-bold border border-white/20 text-white"
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          {/* Logo & Hotel Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md shadow-amber-500/20 border-2 border-amber-300 bg-stone-900 flex items-center justify-center shrink-0">
              <img 
                src="/icon.svg" 
                alt="Hotel Al Sheikh Farid Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-serif">
                  {lang === 'bn' ? HOTEL_INFO.nameBn : HOTEL_INFO.nameEn}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {lang === 'bn' ? 'স্টেশন' : 'Station'}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium line-clamp-1">
                {lang === 'bn' 
                  ? `মালিক: ${HOTEL_INFO.proprietorBn} (${HOTEL_INFO.phone2}) | 📞 হেল্পলাইন ও WhatsApp: ${HOTEL_INFO.phone1}` 
                  : `Owner: ${HOTEL_INFO.proprietorEn} (${HOTEL_INFO.phone2}) | 📞 Helpline & WhatsApp: ${HOTEL_INFO.phone1}`}
              </p>
            </div>
          </div>

          {/* Center Call & Communication Quick Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-200">
            {/* Voice Command Quick Toggle in Header */}
            {onToggleVoiceCommand && (
              <button
                onClick={onToggleVoiceCommand}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isVoiceListening
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse ring-2 ring-red-400'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:text-amber-900 border border-stone-200'
                }`}
                title={lang === 'bn' ? 'ভয়েস কমান্ড সহকারী চালু করুন' : 'Voice Command Navigation'}
              >
                <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-white' : 'text-amber-600'}`} />
                <span>{isVoiceListening ? (lang === 'bn' ? 'শুনছি...' : 'Listening...') : (lang === 'bn' ? 'ভয়েস কমান্ড' : 'Voice')}</span>
              </button>
            )}

            <button
              onClick={() => onStartCall('audio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all cursor-pointer active:scale-95"
              title="হোটেল মালিককে সরাসরি লাইভ কল করুন (রিংটোন সহ সংযোগ)"
            >
              <Phone className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>{lang === 'bn' ? 'মালিককে কল করুন' : 'Call Owner'}</span>
            </button>

            <button
              onClick={() => onStartCall('video')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border border-blue-200 shadow-xs transition-colors cursor-pointer"
              title="হোটেল কাউন্টারে সরাসরি ভিডিও কল করুন"
            >
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}</span>
            </button>

            {onOpenCallHistory && (
              <button
                onClick={onOpenCallHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-300 shadow-xs transition-colors cursor-pointer"
                title={lang === 'bn' ? 'অডিও ও ভিডিও কল হিস্ট্রি দেখুন' : 'View Call History'}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'bn' ? 'কল হিস্ট্রি' : 'Call History'}</span>
              </button>
            )}

            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-amber-800 hover:bg-amber-50 hover:text-amber-900 border border-amber-200 shadow-xs transition-colors"
              title="হোটেলের সাথে মেসেজিং করুন"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'bn' ? 'মেসেজ' : 'Chat'}</span>
            </button>

            {onOpenBkashSms && (
              <button
                onClick={onOpenBkashSms}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-50 text-pink-800 hover:bg-pink-100 hover:text-pink-900 border border-pink-300 shadow-xs transition-colors cursor-pointer"
                title="বিকাশ এসএমএস লেটার ও পেমেন্ট ভেরিফিকেশন"
              >
                <div className="w-3.5 h-3.5 rounded bg-pink-600 text-white text-[9px] font-black flex items-center justify-center">
                  bK
                </div>
                <span>{lang === 'bn' ? 'বিকাশ SMS' : 'bKash SMS'}</span>
                {unreadSmsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white animate-pulse">
                    {unreadSmsCount}
                  </span>
                )}
              </button>
            )}

            {/* Shop Location Map Desktop Button */}
            {onOpenShopLocationMap && (
              <button
                id="desktop-shop-location-map-btn"
                onClick={onOpenShopLocationMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-xs transition-all cursor-pointer ring-1 ring-amber-400/80 active:scale-95"
                title={lang === 'bn' ? 'দোকানের ম্যাপ, লোকেশন ও সেলফ পিক-আপ গাইড' : 'View Shop Location, Map & Directions'}
              >
                <MapPin className="w-3.5 h-3.5 text-stone-950 animate-bounce" />
                <span>{lang === 'bn' ? '🗺️ দোকানের ম্যাপ' : '🗺️ Shop Map'}</span>
              </button>
            )}

            {onOpenTableBooking && (
              <button
                onClick={onOpenTableBooking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 shadow-xs transition-colors cursor-pointer"
                title="টেবিল ও সিট রিজার্ভেশন"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'bn' ? 'টেবিল বুকিং' : 'Book Table'}</span>
              </button>
            )}

            {/* Table QR Code Scanner Desktop Button */}
            {onOpenTableQrScanner && (
              <button
                id="desktop-table-qr-scanner-btn"
                onClick={onOpenTableQrScanner}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 ${
                  activeTableSession
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-stone-950 ring-2 ring-emerald-300 shadow-md animate-pulse'
                    : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/50'
                }`}
                title={lang === 'bn' ? 'মোবাইল ক্যামেরা দিয়ে টেবিল কিউআর কোড স্ক্যান করুন' : 'Scan table QR code with camera for dine-in'}
              >
                <ScanLine className={`w-3.5 h-3.5 ${activeTableSession ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>
                  {activeTableSession
                    ? (lang === 'bn' ? `📍 ${activeTableSession.tableNumber}` : `📍 ${activeTableSession.tableNumber}`)
                    : (lang === 'bn' ? '📷 টেবিল QR স্ক্যান' : '📷 Table QR')}
                </span>
              </button>
            )}

            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-stone-950 shadow-xs transition-all cursor-pointer ring-1 ring-amber-400"
                title="লয়ালটি লিডারবোর্ড - শীর্ষ ৫ নিয়মিত কাস্টমার"
              >
                <Trophy className="w-3.5 h-3.5 text-stone-950 animate-bounce" />
                <span>{lang === 'bn' ? '🏆 লিডারবোর্ড' : '🏆 Leaderboard'}</span>
              </button>
            )}

            {/* Staff Mode Desktop Toggle Button (Admin Only) */}
            {isAdmin && onToggleStaffMode && (
              <button
                id="desktop-staff-mode-btn"
                onClick={onToggleStaffMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 ${
                  isStaffMode
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 ring-2 ring-amber-400 font-black shadow-md'
                    : 'bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200'
                }`}
                title={lang === 'bn' ? 'কিচেন ও স্টাফ মোড (অর্ডার কার্ডে দ্রুত রান্নার টুল দেখায়)' : 'Kitchen Staff Mode (Shows quick kitchen tools in orders)'}
              >
                <ChefHat className={`w-3.5 h-3.5 ${isStaffMode ? 'text-stone-950 animate-bounce' : 'text-amber-600'}`} />
                <span>{isStaffMode ? (lang === 'bn' ? '👨‍🍳 স্টাফ মোড' : '👨‍🍳 Staff Mode') : (lang === 'bn' ? 'স্টাফ মোড' : 'Staff Mode')}</span>
                <span className={`text-[10px] px-1 rounded font-mono ${isStaffMode ? 'bg-black/20 text-stone-950 font-bold' : 'bg-stone-100 text-stone-600'}`}>
                  {isStaffMode ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {onOpenFoodGallery && (
              <button
                onClick={onOpenFoodGallery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 shadow-xs transition-all cursor-pointer ring-1 ring-amber-400"
                title="৮K ফুড গ্যালালি ও লাইভ ভিডিও সেল"
              >
                <Camera className="w-3.5 h-3.5 text-amber-200" />
                <span>{lang === 'bn' ? '📸 ৮K গ্যালালি' : '📸 8K Gallery'}</span>
              </button>
            )}

            {onOpenSaaSMarketplace && (
              <button
                onClick={onOpenSaaSMarketplace}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all cursor-pointer ring-1 ring-emerald-300 animate-pulse"
                title="আপনার রেস্তোরাঁর জন্য SaaS সফটওয়্যার কিনুন"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'bn' ? '💼 SaaS কিনুন' : '💼 Buy SaaS'}</span>
              </button>
            )}

            {onOpenShareAndQr && (
              <button
                onClick={onOpenShareAndQr}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 shadow-xs transition-all cursor-pointer"
                title="অ্যাপ শেয়ার ও কিউআর কোড স্ক্যানার"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? '📲 অ্যাপ শেয়ার ও QR' : '📲 Share & QR'}</span>
              </button>
            )}

            {/* Seasonal Festive Theme Quick Trigger Button (Desktop) */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 shadow-xs transition-all cursor-pointer ring-1 ring-amber-400/40 group active:scale-95"
                title={lang === 'bn' ? `উৎসবের থিম পরিবর্তন করুন (বর্তমান: ${currentTheme.nameBn})` : `Switch Seasonal Theme (Current: ${currentTheme.nameEn})`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="text-sm">{currentTheme.emoji}</span>
                <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-extrabold">
                  {lang === 'bn' ? 'উৎসব থিম' : 'Festival Theme'}
                </span>
              </button>
            )}

            <button
              onClick={onOpenEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800 border border-purple-200 shadow-xs transition-colors"
              title="ইমেইল পাঠান"
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
            </button>

            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-xs transition-all"
              title="শেফ বারিক এআই সহকারী"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span>{lang === 'bn' ? 'এআই শেফ' : 'AI Chef'}</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Account Profile Button */}
            <button
              onClick={onOpenAccount}
              className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isGoogleSignedIn
                  ? 'bg-amber-100/90 text-amber-950 border border-amber-300 shadow-2xs hover:bg-amber-200'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              title={isGoogleSignedIn ? `${user?.name} (Google Verified)` : 'আপনার অ্যাকাউন্ট বা গুগল সাইন ইন'}
            >
              {user?.photoURL || user?.avatar ? (
                <img 
                  src={user.photoURL || user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-lg object-cover border border-amber-500"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              
              <span className="hidden md:inline max-w-[100px] truncate">
                {isGoogleSignedIn ? user?.name?.split(' ')[0] : (lang === 'bn' ? 'সাইন ইন' : 'Sign In')}
              </span>

              {isGoogleSignedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-sm transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'অর্ডার ব্যাগ' : 'Bag'}</span>
              {cartCount > 0 && (
                <span className="bg-white text-orange-700 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for communication tools */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {onToggleVoiceCommand && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onToggleVoiceCommand();
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold ${
                  isVoiceListening
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <Mic className="w-4 h-4 text-amber-600" />
                <span>{lang === 'bn' ? 'ভয়েস কমান্ড' : 'Voice Command'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartCall('audio');
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-white animate-bounce" />
              <span>{lang === 'bn' ? 'মালিককে কল করুন' : 'Call Owner'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartCall('video');
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold"
            >
              <Video className="w-4 h-4 text-blue-600" />
              <span>{lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}</span>
            </button>

            {onOpenCallHistory && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCallHistory();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
              >
                <PhoneCall className="w-4 h-4 text-amber-700" />
                <span>{lang === 'bn' ? 'কল হিস্ট্রি' : 'Call History'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>{lang === 'bn' ? 'মেসেজ' : 'Live Chat'}</span>
            </button>

            {onOpenBkashSms && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBkashSms();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-pink-50 text-pink-900 border border-pink-300 text-xs font-bold"
              >
                <div className="w-4 h-4 rounded bg-pink-600 text-white text-[10px] font-black flex items-center justify-center">
                  bK
                </div>
                <span>{lang === 'bn' ? 'বিকাশ SMS' : 'bKash SMS'}</span>
                {unreadSmsCount > 0 && (
                  <span className="bg-pink-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadSmsCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Shop Location Map Button */}
            {onOpenShopLocationMap && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShopLocationMap();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500 text-stone-950 border border-amber-400 text-xs font-black shadow-xs active:scale-95"
              >
                <MapPin className="w-4 h-4 text-stone-950 animate-bounce" />
                <span>{lang === 'bn' ? '🗺️ দোকানের ম্যাপ' : '🗺️ Shop Map'}</span>
              </button>
            )}

            {onOpenTableBooking && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTableBooking();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                <span>{lang === 'bn' ? 'টেবিল বুকিং' : 'Table Booking'}</span>
              </button>
            )}

            {/* Mobile Table QR Scanner Button */}
            {onOpenTableQrScanner && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTableQrScanner();
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTableSession
                    ? 'bg-emerald-500 text-stone-950 border border-emerald-400 shadow-md animate-pulse'
                    : 'bg-stone-900 text-amber-300 border border-amber-500/50'
                }`}
              >
                <ScanLine className={`w-4 h-4 ${activeTableSession ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>
                  {activeTableSession
                    ? (lang === 'bn' ? `📍 ${activeTableSession.tableNumber}` : `📍 ${activeTableSession.tableNumber}`)
                    : (lang === 'bn' ? '📷 টেবিল QR স্ক্যান' : '📷 Table QR')}
                </span>
              </button>
            )}

            {/* Mobile Background Sync & Always Active Button */}
            {onOpenBackgroundSync && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBackgroundSync();
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black shadow-xs active:scale-95 transition-all ${
                  isLowPower
                    ? 'bg-amber-950/90 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {isLowPower ? (
                  <>
                    <BatteryLow className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>{lang === 'bn' ? '🪫 লো পাওয়ার মোড সক্রিয়' : '🪫 Low Power Mode Active'}</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>{lang === 'bn' ? '⚡ অলওয়েজ একটিভ সিঙ্ক' : '⚡ Always Active'}</span>
                  </>
                )}
              </button>
            )}

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLeaderboard();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black shadow-xs"
              >
                <Trophy className="w-4 h-4 text-stone-950" />
                <span>{lang === 'bn' ? '🏆 লিডারবোর্ড' : '🏆 Leaderboard'}</span>
              </button>
            )}

            {/* Mobile Staff Mode Button (Admin Only) */}
            {isAdmin && onToggleStaffMode && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onToggleStaffMode();
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black transition-all ${
                  isStaffMode
                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm ring-1 ring-white'
                    : 'bg-stone-50 text-stone-800 border-stone-300'
                }`}
              >
                <ChefHat className={`w-4 h-4 ${isStaffMode ? 'text-stone-950 animate-bounce' : 'text-amber-600'}`} />
                <span>{isStaffMode ? (lang === 'bn' ? '👨‍🍳 স্টাফ মোড (ON)' : '👨‍🍳 Staff Mode (ON)') : (lang === 'bn' ? '👨‍🍳 স্টাফ মোড' : '👨‍🍳 Staff Mode')}</span>
              </button>
            )}

            {onOpenFoodGallery && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenFoodGallery();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-black shadow-xs"
              >
                <Camera className="w-4 h-4 text-amber-200" />
                <span>{lang === 'bn' ? '📸 ৮K গ্যালালি' : '📸 8K Gallery'}</span>
              </button>
            )}

            {onOpenSaaSMarketplace && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSaaSMarketplace();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-xs ring-1 ring-emerald-300"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>{lang === 'bn' ? '💼 SaaS হিসেবে কিনুন' : '💼 Buy SaaS Suite'}</span>
              </button>
            )}

            {onOpenShareAndQr && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShareAndQr();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-900 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-xs"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? '📲 অ্যাপ শেয়ার ও QR' : '📲 Share & QR'}</span>
              </button>
            )}

            {onOpenThemeModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenThemeModal();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-amber-300 text-xs font-bold shadow-xs"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{currentTheme.emoji} {lang === 'bn' ? 'উৎসব থিম' : 'Festive Theme'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEmail();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold"
            >
              <Mail className="w-4 h-4 text-purple-600" />
              <span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAi();
              }}
              className="col-span-2 sm:col-span-4 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{lang === 'bn' ? 'শেফ বারিক এআই সহকারী (খাবার পরামর্শ)' : 'Chef Barik AI Assistant'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
