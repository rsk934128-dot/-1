import React from 'react';
import { 
  Phone, 
  Video, 
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
  Laptop
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { UserProfile } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenTableBooking?: () => void;
  onOpenShareAndQr?: () => void;
  onOpenSaaSMarketplace?: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenChat: () => void;
  onOpenEmail: () => void;
  onOpenAi: () => void;
  onOpenLeaderboard?: () => void;
  onOpenBkashSms?: () => void;
  onOpenFoodGallery?: () => void;
  onToggleVoiceCommand?: () => void;
  isVoiceListening?: boolean;
  unreadSmsCount?: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  user?: UserProfile;
  isGoogleSignedIn?: boolean;
  isCachedMode?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAccount,
  onOpenTableBooking,
  onOpenShareAndQr,
  onOpenSaaSMarketplace,
  onStartCall,
  onOpenChat,
  onOpenEmail,
  onOpenAi,
  onOpenLeaderboard,
  onOpenBkashSms,
  onOpenFoodGallery,
  onToggleVoiceCommand,
  isVoiceListening = false,
  unreadSmsCount = 0,
  isAdmin,
  onToggleAdmin,
  lang,
  onToggleLang,
  user,
  isGoogleSignedIn = false,
  isCachedMode = false,
  isSimulatedOffline = false,
  onToggleSimulatedOffline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 text-amber-50 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{lang === 'bn' ? HOTEL_INFO.locationBn : HOTEL_INFO.locationEn}</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-amber-200">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'bn' ? HOTEL_INFO.openingHoursBn : HOTEL_INFO.openingHoursEn}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
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

          <span className="hidden md:inline-block bg-amber-900/60 px-2 py-0.5 rounded text-[11px] border border-amber-600/50">
            {lang === 'bn' ? `প্রোপাইটার: ${HOTEL_INFO.proprietorBn}` : `Proprietor: ${HOTEL_INFO.proprietorEn}`}
          </span>
          <button
            onClick={onToggleAdmin}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
              isAdmin 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'bg-amber-900/80 text-amber-200 hover:bg-amber-900 hover:text-white'
            }`}
            title="মালিক / ম্যানেজার প্যানেল"
          >
            <ShieldCheck className="w-3 h-3" />
            {isAdmin ? (lang === 'bn' ? 'মালিক মোড সক্রিয়' : 'Owner Mode ON') : (lang === 'bn' ? 'মালিক প্যানেল' : 'Owner Mode')}
          </button>
          <button
            onClick={onToggleLang}
            className="bg-amber-950/60 hover:bg-amber-950 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-600/40 text-amber-100"
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
                  ? `প্রোপাইটার: ${HOTEL_INFO.proprietorBn} | 📞 ${HOTEL_INFO.phone1}, ${HOTEL_INFO.phone2}` 
                  : `Proprietor: ${HOTEL_INFO.proprietorEn} | 📞 ${HOTEL_INFO.phone1}`}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-200 shadow-xs transition-colors"
              title="হোটেল ম্যানেজারের সাথে অডিও কল করুন"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{lang === 'bn' ? 'অডিও কল' : 'Audio Call'}</span>
            </button>

            <button
              onClick={() => onStartCall('video')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border border-blue-200 shadow-xs transition-colors"
              title="হোটেল কাউন্টারে সরাসরি ভিডিও কল করুন"
            >
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}</span>
            </button>

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
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'অডিও কল' : 'Audio Call'}</span>
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
