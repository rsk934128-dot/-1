import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Zap, 
  Award, 
  Flame, 
  PhoneCall, 
  ShoppingBag, 
  UtensilsCrossed, 
  QrCode, 
  Camera, 
  Crown, 
  Palette, 
  ScanLine, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Clock, 
  Radio, 
  CheckCircle2, 
  Coffee,
  Heart
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { ActiveTableSession } from '../types';
import { SeasonalThemeId, SEASONAL_THEMES } from '../utils/seasonalTheme';
import { BANNER_SLIDES, BannerSlide, BannerAction } from '../data/bannerSlidesData';
import { SoundNotificationService } from '../services/soundNotificationService';

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

const toBengaliNumber = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .padStart(2, '0')
    .split('')
    .map(d => bnDigits[parseInt(d, 10)] ?? d)
    .join('');
};

const padZero = (num: number): string => {
  return num.toString().padStart(2, '0');
};

const SLIDE_DURATION_MS = 5500; // 5.5 seconds per slide

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
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const totalSlides = BANNER_SLIDES.length;
  const currentSlide: BannerSlide = BANNER_SLIDES[currentSlideIndex] || BANNER_SLIDES[0];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setProgress(0);
    SoundNotificationService.playNotificationChime();
  };

  // Progress and Auto-slide timer loop
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    const intervalStepMs = 50; // update progress every 50ms for buttery smooth bar
    const stepIncrement = (intervalStepMs / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStepMs);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isHovered, goToNextSlide]);

  // Touch gesture handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      goToNextSlide();
      SoundNotificationService.playNotificationChime();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      goToPrevSlide();
      SoundNotificationService.playNotificationChime();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Action dispatcher
  const handleActionClick = (action?: BannerAction) => {
    if (!action) return;
    SoundNotificationService.playNotificationChime();

    switch (action.type) {
      case 'category':
        if (action.category) onQuickCategory(action.category);
        break;
      case 'tableBooking':
        if (onOpenTableBooking) onOpenTableBooking();
        break;
      case 'tableQr':
        if (onOpenTableQrScanner) onOpenTableQrScanner();
        break;
      case 'gallery':
        if (onOpenFoodGallery) onOpenFoodGallery();
        break;
      case 'saas':
        if (onOpenSaaSMarketplace) onOpenSaaSMarketplace();
        break;
      case 'call':
        onStartCall('audio');
        break;
      case 'share':
        if (onOpenShareAndQr) onOpenShareAndQr();
        break;
    }
  };

  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'ScanLine':
        return <ScanLine className="w-4 h-4" />;
      case 'PhoneCall':
        return <PhoneCall className="w-4 h-4" />;
      case 'Crown':
        return <Crown className="w-4 h-4" />;
      case 'Camera':
        return <Camera className="w-4 h-4" />;
      case 'QrCode':
        return <QrCode className="w-4 h-4" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const slideShortLabels = [
    { bn: 'ঐতিহ্যবাহী স্বাদ', en: 'Station Heritage' },
    { bn: 'ট্রেন পার্সেল (৩ মি.)', en: 'Train Express' },
    { bn: 'গরম জিলাপি', en: 'Hot Jilapi' },
    { bn: 'তাজা মাছ-ভর্তা', en: 'River Fish & Vorta' },
    { bn: 'স্মার্ট কিউআর', en: 'Smart Table QR' },
  ];

  return (
    <section
      id="hero-banner-carousel"
      aria-label="Hotel Al Sheikh Farid Featured Banners"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden bg-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl border ${currentSlide.accentBorder} transition-all duration-700 select-none`}
    >
      {/* Background Image with Dynamic Crossfade & Subtle Zoom */}
      <div 
        key={currentSlide.id}
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url('${currentSlide.bgImage}')`,
        }}
      />

      {/* Dynamic Theme & Slide Gradient Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient} transition-all duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

      {/* Dynamic Ambient Glow lights */}
      <div 
        className="absolute -top-28 -right-28 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ backgroundColor: currentSlide.glowColor || theme.glowColor }}
      />
      <div 
        className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ backgroundColor: currentSlide.glowColor || theme.glowColor }}
      />

      {/* Top Countdown Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-75 ease-linear shadow-xs"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top Right Controls: Theme Pill, Slide Counter, Play/Pause Toggle */}
      <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-6 z-30 flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          id="banner-play-pause-toggle"
          onClick={() => {
            setIsPlaying(!isPlaying);
            SoundNotificationService.playNotificationChime();
          }}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 hover:bg-black/60 text-stone-200 hover:text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md"
          title={isPlaying ? (lang === 'bn' ? 'অটো-স্লাইড থামান' : 'Pause Auto-Slide') : (lang === 'bn' ? 'অটো-স্লাইড চালু করুন' : 'Resume Auto-Slide')}
          aria-label="Toggle banner autoplay"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* Slide Counter Badge (e.g., ০১ / ০৫) */}
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-xs font-mono font-black text-amber-200 shadow-md">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>
            {lang === 'bn' ? toBengaliNumber(currentSlideIndex + 1) : padZero(currentSlideIndex + 1)}
          </span>
          <span className="text-stone-500">/</span>
          <span className="text-stone-400">
            {lang === 'bn' ? toBengaliNumber(totalSlides) : padZero(totalSlides)}
          </span>
        </div>

        {/* Seasonal Theme Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-xs shadow-md">
          <span className="text-base">{theme.emoji}</span>
          <span className="text-[11px] font-bold text-stone-200">
            {lang === 'bn' ? theme.nameBn : theme.nameEn}
          </span>
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-md text-amber-300 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'উৎসব থিম পরিবর্তন করুন' : 'Change Festival Theme'}
              aria-label="Open Theme Selector"
            >
              <Palette className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-4xl">
        {/* Top Promotional Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          {/* Badge 1 */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentSlide.badgeColor.bg} ${currentSlide.badgeColor.text} border ${currentSlide.badgeColor.border} shadow-xs`}>
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? currentSlide.badge1Bn : currentSlide.badge1En}</span>
          </span>
          
          {/* Badge 2 */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{lang === 'bn' ? currentSlide.badge2Bn : currentSlide.badge2En}</span>
          </span>

          {/* Badge 3 */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? currentSlide.badge3Bn : currentSlide.badge3En}</span>
          </span>

          {/* Active Table Session Indicator (if guest is sitting at table) */}
          {activeTableSession && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600/90 text-white border border-emerald-300 shadow-sm animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{lang === 'bn' ? `টেবিল নং ${activeTableSession.tableNumber}` : `Table #${activeTableSession.tableNumber}`}</span>
            </span>
          )}
        </div>

        {/* Dynamic Title with Smooth Key Transition */}
        <div key={`title-${currentSlide.id}`} className="transition-all duration-500 ease-out">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif text-white leading-tight drop-shadow-md">
            {lang === 'bn' ? currentSlide.titleBn : currentSlide.titleEn}
          </h2>

          {/* Subtitle / Greeting Pill */}
          <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs sm:text-sm font-bold text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{lang === 'bn' ? currentSlide.subtitleBn : currentSlide.subtitleEn}</span>
          </div>

          {/* Description & Heritage Info */}
          <p className="mt-3 text-xs sm:text-sm text-stone-200 font-medium max-w-2xl leading-relaxed">
            {lang === 'bn' ? currentSlide.descriptionBn : currentSlide.descriptionEn}
          </p>
        </div>

        {/* Hotline & bKash Strip */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <a 
            href={`tel:${HOTEL_INFO.phone1}`} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono transition-colors"
          >
            <span className="text-emerald-400 font-sans font-bold">📞 {lang === 'bn' ? 'হটলাইন' : 'Call'}:</span> {HOTEL_INFO.phone1}
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/70 text-pink-300 border border-pink-500/40 font-mono">
            <span className="text-pink-400 font-sans font-bold">{lang === 'bn' ? 'বিকাশ (পার্সোনাল)' : 'bKash'}:</span> {HOTEL_INFO.bkashNumber}
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-400">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{lang === 'bn' ? 'সকাল ৬টা - রাত ১২টা খোলা' : '6:00 AM - 12:00 Midnight'}</span>
          </span>
        </div>

        {/* Price Highlights Ticker Bar for Current Slide */}
        <div className="mt-5 p-3 rounded-2xl bg-stone-950/80 border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          {currentSlide.tickers.map((ticker, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 hover:border-amber-500/40 transition-colors">
              <p className="text-[11px] text-amber-300 font-bold truncate">
                {lang === 'bn' ? ticker.titleBn : ticker.titleEn}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                ৳ {ticker.priceBn} <span className="text-[10px] text-stone-400 font-normal">/{lang === 'bn' ? ticker.unitBn : ticker.unitEn}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons for Current Slide */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {/* Primary Action Button */}
          <button
            id={`banner-action-primary-${currentSlide.id}`}
            onClick={() => handleActionClick(currentSlide.primaryAction)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black text-sm shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            {renderActionIcon(currentSlide.primaryAction.icon)}
            <span>{lang === 'bn' ? currentSlide.primaryAction.labelBn : currentSlide.primaryAction.labelEn}</span>
          </button>

          {/* Secondary Action Button */}
          {currentSlide.secondaryAction && (
            <button
              id={`banner-action-secondary-${currentSlide.id}`}
              onClick={() => handleActionClick(currentSlide.secondaryAction)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-100 font-bold text-sm border border-stone-700 transition-all cursor-pointer active:scale-95"
            >
              {renderActionIcon(currentSlide.secondaryAction.icon)}
              <span>{lang === 'bn' ? currentSlide.secondaryAction.labelBn : currentSlide.secondaryAction.labelEn}</span>
            </button>
          )}

          {/* Tertiary Action Button */}
          {currentSlide.tertiaryAction && (
            <button
              id={`banner-action-tertiary-${currentSlide.id}`}
              onClick={() => handleActionClick(currentSlide.tertiaryAction)}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-300 font-bold text-xs border border-stone-800 transition-all cursor-pointer active:scale-95"
            >
              {renderActionIcon(currentSlide.tertiaryAction.icon)}
              <span>{lang === 'bn' ? currentSlide.tertiaryAction.labelBn : currentSlide.tertiaryAction.labelEn}</span>
            </button>
          )}

          {/* Table QR Scanner Quick Button (Always accessible) */}
          {onOpenTableQrScanner && (
            <button
              id="banner-table-qr-scanner-btn"
              onClick={onOpenTableQrScanner}
              className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl font-black text-xs border shadow-md transition-all cursor-pointer active:scale-95 ${
                activeTableSession
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/40'
                  : 'bg-stone-950/90 hover:bg-stone-900 text-amber-300 border-amber-500/50'
              }`}
            >
              <ScanLine className={`w-3.5 h-3.5 ${activeTableSession ? 'text-white' : 'text-amber-400'}`} />
              <span>
                {activeTableSession
                  ? (lang === 'bn' ? `📍 টেবিল ${activeTableSession.tableNumber}` : `📍 Table ${activeTableSession.tableNumber}`)
                  : (lang === 'bn' ? '📷 কিউআর স্ক্যান' : '📷 QR Scan')}
              </span>
            </button>
          )}

          {/* SaaS Marketplace Badge Button */}
          {onOpenSaaSMarketplace && (
            <button
              onClick={onOpenSaaSMarketplace}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs border border-emerald-400/40 shadow-sm transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'bn' ? '💼 SaaS রেস্তোরাঁ সিস্টেম' : '💼 SaaS System'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Prev / Next Arrow Controls */}
      <div className="absolute right-4 bottom-5 z-20 flex items-center gap-2">
        <button
          id="banner-prev-slide-btn"
          onClick={() => {
            goToPrevSlide();
            SoundNotificationService.playNotificationChime();
          }}
          className="w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg hover:border-amber-400"
          title={lang === 'bn' ? 'আগের ব্যানার' : 'Previous Banner'}
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 text-amber-300" />
        </button>

        <button
          id="banner-next-slide-btn"
          onClick={() => {
            goToNextSlide();
            SoundNotificationService.playNotificationChime();
          }}
          className="w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg hover:border-amber-400"
          title={lang === 'bn' ? 'পরের ব্যানার' : 'Next Banner'}
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 text-amber-300" />
        </button>
      </div>

      {/* Slide Navigator Dots / Pills at the Bottom */}
      <div className="relative z-20 px-5 sm:px-8 pb-5 pt-1 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Interactive Dots with Short Titles */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {BANNER_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            const shortLabel = slideShortLabels[idx] || { bn: `ব্যানার ${idx + 1}`, en: `Banner ${idx + 1}` };
            
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300/50 scale-102'
                    : 'bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
                title={lang === 'bn' ? slide.titleBn : slide.titleEn}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-stone-950 animate-ping' : 'bg-stone-500 group-hover:bg-amber-400'}`} />
                <span className="text-[10px] sm:text-xs">
                  {lang === 'bn' ? toBengaliNumber(idx + 1) : padZero(idx + 1)}. {lang === 'bn' ? shortLabel.bn : shortLabel.en}
                </span>
              </button>
            );
          })}
        </div>

        {/* Auto-Slide Status Note */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-stone-400">
          <span className={`w-2 h-2 rounded-full ${isPlaying && !isHovered ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>
            {isHovered 
              ? (lang === 'bn' ? 'মাউস রাখায় ব্যানার থামানো রয়েছে' : 'Paused on hover')
              : isPlaying
                ? (lang === 'bn' ? 'প্রতি ৫.৫ সেকেন্ড পরপর ব্যানার পরিবর্তিত হবে' : 'Auto-changing every 5.5s')
                : (lang === 'bn' ? 'অটো-স্লাইড বন্ধ আছে' : 'Auto-slide paused')}
          </span>
        </div>
      </div>
    </section>
  );
};
export default Banner;
