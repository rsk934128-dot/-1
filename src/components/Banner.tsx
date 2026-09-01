import React from 'react';
import { Sparkles, Utensils, Zap, Award, Flame, PhoneCall, ShoppingBag, UtensilsCrossed, QrCode, Share2, Camera, Crown, Palette, ScanLine, CheckCircle2 } from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { ActiveTableSession } from '../types';
import { SeasonalTheme, SeasonalThemeId, SEASONAL_THEMES } from '../utils/seasonalTheme';

interface BannerProps {
  onQuickCategory: (category: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenTableBooking?: () => void;
  onOpenTableQrScanner?: () => void;
  activeTableSession?: ActiveTableSession | null;
  onOpenShareAndQr?: () => void;
  onOpenFoodGallery?: () => void;
  onOpenSaaSMarketplace?: () => void;
  onOpenThemeModal?: () => void;
  currentThemeId?: SeasonalThemeId;
  lang: 'bn' | 'en';
}

export const Banner: React.FC<BannerProps> = ({ 
  onQuickCategory, 
  onStartCall, 
  onOpenTableBooking, 
  onOpenTableQrScanner,
  activeTableSession,
  onOpenShareAndQr, 
  onOpenFoodGallery, 
  onOpenSaaSMarketplace,
  onOpenThemeModal,
  currentThemeId = 'classic',
  lang 
}) => {
  const theme = SEASONAL_THEMES[currentThemeId] || SEASONAL_THEMES.classic;

  return (
    <div className={`relative overflow-hidden bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-xl border ${theme.bannerBorderColor} transition-all duration-500`}>
      {/* Background Image with Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-all duration-700"
        style={{
          backgroundImage: `url('${theme.bannerBgImage}')`,
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.bannerGradient} transition-all duration-500`} />

      {/* Decorative Warm Lights based on theme */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: theme.glowColor }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* Floating Decorative Festive Motif Emojis in Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-sm shadow-md animate-fade-in">
        <span className="text-amber-300 font-bold text-xs">{lang === 'bn' ? 'বর্তমান সাজ:' : 'Vibe:'}</span>
        <span className="text-base">{theme.emoji}</span>
        <span className="text-xs font-bold text-stone-200">{lang === 'bn' ? theme.nameBn : theme.nameEn}</span>
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="ml-1 p-1 hover:bg-white/20 rounded-full text-amber-300 transition-colors"
            title="Change Theme"
          >
            <Palette className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'bn' ? 'স্টেশন এলাকার ঐতিহ্যবাহী হোটেল' : 'Historic Station Hotel'}
          </span>
          
          {/* Dynamic Seasonal Festival Special Offer Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeStyle.bg} ${theme.badgeStyle.text} border ${theme.badgeStyle.border} shadow-xs animate-pulse`}>
            <span>{theme.emoji}</span>
            <span>{lang === 'bn' ? theme.specialOfferBn : theme.specialOfferEn}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'bn' ? 'দ্রুত পার্সেল ও হোম ডেলিভারি' : 'Fast Delivery & Parcel'}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif text-white leading-tight">
            {lang === 'bn' ? HOTEL_INFO.nameBn : HOTEL_INFO.nameEn}
          </h2>
          <span className="text-3xl sm:text-4xl drop-shadow-md">{theme.emoji}</span>
        </div>
        
        {/* Seasonal Festival Banner Greeting */}
        <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs sm:text-sm font-bold text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{lang === 'bn' ? theme.bannerGreetingBn : theme.bannerGreetingEn}</span>
        </div>

        {/* Proprietor and Tagline */}
        <p className="mt-3 text-sm sm:text-base text-stone-200 font-medium max-w-2xl leading-relaxed">
          {lang === 'bn' ? HOTEL_INFO.taglineBn : HOTEL_INFO.taglineEn}
        </p>

        <div className="mt-3 text-xs sm:text-sm text-stone-300 flex items-center gap-2">
          <span className="text-amber-400 font-bold">●</span>
          <span>
            {lang === 'bn'
              ? `প্রোপাইটার: মো: আব্দুল বারিক শেখ | খাঁটি তেলে ভাজা সুস্বাদু খাবার ও তাজা মাছ-মাংস`
              : `Proprietor: Md. Abdul Barik Sheikh | Authentic Bangladeshi Station Meals`}
          </span>
        </div>

        {/* Contact Numbers and bKash Badge */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <a 
            href={`tel:${HOTEL_INFO.phone1}`} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono transition-colors"
          >
            <span className="text-emerald-400 font-sans font-bold">📞 হটলাইন ১:</span> {HOTEL_INFO.phone1}
          </a>
          <a 
            href={`tel:${HOTEL_INFO.phone2}`} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono transition-colors"
          >
            <span className="text-emerald-400 font-sans font-bold">📞 হটলাইন ২:</span> {HOTEL_INFO.phone2}
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 text-pink-300 border border-pink-500/40 font-mono">
            <span className="text-pink-400 font-sans font-bold">বিকাশ (পার্সোনাল):</span> {HOTEL_INFO.bkashNumber}
          </span>
        </div>

        {/* Price Highlights Ticker Bar */}
        <div className="mt-6 p-3 rounded-2xl bg-stone-950/70 border border-amber-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <p className="text-[11px] text-amber-300 font-medium">{lang === 'bn' ? 'রসালো জিলাপি' : 'Jilapi'}</p>
            <p className="text-base font-extrabold text-white">৳ ১৬০ <span className="text-[10px] text-stone-400">/কেজি</span></p>
          </div>
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <p className="text-[11px] text-amber-300 font-medium">{lang === 'bn' ? 'কষা গরুর মাংস' : 'Beef Curry'}</p>
            <p className="text-base font-extrabold text-white">৳ ৮০ <span className="text-[10px] text-stone-400">/পিস</span></p>
          </div>
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <p className="text-[11px] text-amber-300 font-medium">{lang === 'bn' ? 'ভুনা খিচুড়ি' : 'Bhuna Khichuri'}</p>
            <p className="text-base font-extrabold text-white">৳ ৩০ <span className="text-[10px] text-stone-400">/প্লেট</span></p>
          </div>
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <p className="text-[11px] text-amber-300 font-medium">{lang === 'bn' ? 'তাজা রুই/পাঙ্গাস' : 'Fish Curry'}</p>
            <p className="text-base font-extrabold text-white">৳ ৬০-৮০ <span className="text-[10px] text-stone-400">/পিস</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onQuickCategory('sweets_snacks')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black text-sm shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span>{lang === 'bn' ? 'জিলাপি ও নাস্তা অর্ডার করুন' : 'Order Jilapi & Snacks'}</span>
          </button>

          <button
            onClick={() => onQuickCategory('fish_meat')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-amber-100 font-bold text-sm border border-stone-700 transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>{lang === 'bn' ? 'মাছ-মাংস ও দুপুরের খাবার' : 'Fish & Meat Menu'}</span>
          </button>

          {onOpenFoodGallery && (
            <button
              onClick={onOpenFoodGallery}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm border border-amber-400/50 shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-200" />
              <span>{lang === 'bn' ? '📸 ৮K ফুড গ্যালারি ও লাইভ কিচেন' : '📸 8K Food Gallery & Live Kitchen'}</span>
            </button>
          )}

          {onOpenSaaSMarketplace && (
            <button
              onClick={onOpenSaaSMarketplace}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm border border-emerald-300/60 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer ring-2 ring-emerald-400/40"
            >
              <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{lang === 'bn' ? '💼 এই অ্যাপটি আপনার হোটেলের জন্য কিনুন (SaaS)' : '💼 Buy this App for Your Restaurant (SaaS)'}</span>
            </button>
          )}

          {onOpenTableBooking && (
            <button
              onClick={onOpenTableBooking}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-sm border border-amber-500/50 shadow-md transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-200" />
              <span>{lang === 'bn' ? 'সিট / টেবিল বুকিং' : 'Book Table'}</span>
            </button>
          )}

          {onOpenTableQrScanner && (
            <button
              id="banner-table-qr-scanner-btn"
              onClick={onOpenTableQrScanner}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm border shadow-lg transition-all cursor-pointer ${
                activeTableSession
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 ring-2 ring-emerald-400/40'
                  : 'bg-stone-950 hover:bg-stone-900 text-amber-300 border-amber-500/50'
              }`}
            >
              <ScanLine className={`w-4 h-4 ${activeTableSession ? 'text-white' : 'text-amber-400'}`} />
              <span>
                {activeTableSession
                  ? (lang === 'bn' ? `📍 টেবিল ${activeTableSession.tableNumber} (চেক-ইন সক্রিয়)` : `📍 ${activeTableSession.tableNumber} (Checked In)`)
                  : (lang === 'bn' ? '📷 টেবিল কিউআর স্ক্যান করুন' : '📷 Scan Table QR')}
              </span>
            </button>
          )}

          {onOpenShareAndQr && (
            <button
              onClick={onOpenShareAndQr}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600/90 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm border border-amber-400/50 shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-200" />
              <span>{lang === 'bn' ? 'কিউআর স্ক্যান ও মিডিয়া শেয়ার' : 'QR Scan & Share'}</span>
            </button>
          )}

          <button
            onClick={() => onStartCall('audio')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-white" />
            <span>{lang === 'bn' ? 'হোটেল মালিককে কল করুন' : 'Call Owner'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
