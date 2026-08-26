import React from 'react';
import { Sparkles, Utensils, Zap, Award, Flame, PhoneCall, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';

interface BannerProps {
  onQuickCategory: (category: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenTableBooking?: () => void;
  lang: 'bn' | 'en';
}

export const Banner: React.FC<BannerProps> = ({ onQuickCategory, onStartCall, onOpenTableBooking, lang }) => {
  return (
    <div className="relative overflow-hidden bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-xl border border-amber-500/20">
      {/* Background Image with Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-amber-950/80" />

      {/* Decorative Warm Lights */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'bn' ? 'স্টেশন এলাকার ঐতিহ্যবাহী হোটেল' : 'Historic Station Hotel'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            {lang === 'bn' ? 'গরম গরম জিলাপি ১৬০ ৳/কেজি' : 'Hot Crispy Jilapi ৳160/kg'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'bn' ? 'দ্রুত পার্সেল ও হোম ডেলিভারি' : 'Fast Delivery & Parcel'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif text-amber-50 leading-tight">
          {lang === 'bn' ? HOTEL_INFO.nameBn : HOTEL_INFO.nameEn}
        </h2>
        
        {/* Proprietor and Tagline */}
        <p className="mt-3 text-sm sm:text-base text-amber-200/90 font-medium max-w-2xl leading-relaxed">
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

          {onOpenTableBooking && (
            <button
              onClick={onOpenTableBooking}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-sm border border-amber-500/50 shadow-md transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-200" />
              <span>{lang === 'bn' ? 'সিট / টেবিল বুকিং' : 'Book Table'}</span>
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
