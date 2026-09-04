import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  PhoneCall, 
  ExternalLink, 
  Footprints, 
  Train, 
  Store, 
  Copy, 
  Check, 
  Compass, 
  Layers, 
  Maximize2,
  Info
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { SoundNotificationService } from '../services/soundNotificationService';

interface ShopLocationSectionProps {
  onOpenFullMapModal: () => void;
  lang: 'bn' | 'en';
}

export const ShopLocationSection: React.FC<ShopLocationSectionProps> = ({
  onOpenFullMapModal,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<'schematic' | 'google_embed'>('schematic');
  const [copied, setCopied] = useState(false);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    'Hotel Al Sheikh Farid, Railway Station Road'
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(
      `${HOTEL_INFO.nameBn} - ${HOTEL_INFO.locationBn} (মোবাইল: ${HOTEL_INFO.phone1}, ${HOTEL_INFO.phone2})`
    );
    setCopied(true);
    SoundNotificationService.playNotificationChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="shop-location-map-section" className="px-4 sm:px-6 lg:px-8 mt-12 mb-8 scroll-mt-24">
      <div className="rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <MapPin className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                  {lang === 'bn' ? 'দোকানের অবস্থান ও রুট ম্যাপ' : 'Shop Location & Route Map'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {lang === 'bn' ? '🟢 খোলা (সকাল ৬টা - রাত ১২টা)' : '🟢 Open Now (6 AM - Midnight)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                {lang === 'bn' ? HOTEL_INFO.nameBn : HOTEL_INFO.nameEn} • {lang === 'bn' ? HOTEL_INFO.locationBn : HOTEL_INFO.locationEn}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={onOpenFullMapModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বড় ম্যাপে দেখুন' : 'Full Interactive Map'}</span>
            </button>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'গুগল ম্যাপে রুট' : 'Google Maps'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={`tel:${HOTEL_INFO.phone1}`}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{HOTEL_INFO.phone1}</span>
            </a>
          </div>
        </div>

        {/* Self-Pickup Notice Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-amber-500 text-stone-950 font-bold shrink-0">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-amber-300">
                {lang === 'bn' ? 'অনলাইন অর্ডার করুন ও দোকানে এসে খাবার নিয়ে যান:' : 'Online Order & Counter Pickup:'}
              </span>
              <span className="text-stone-300 ml-1.5">
                {lang === 'bn' 
                  ? 'বর্তমানে খাবার সরাসরি দোকানে এসে নিয়ে যেতে হবে (সেলফ পিক-আপ)। পরবর্তীতে হোম ডেলিভারি ব্যবস্থা চালু করা হবে।'
                  : 'Currently orders are for self-pickup at our shop counter. Home delivery will be available in future.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? (lang === 'bn' ? 'ঠিকানা কপি হয়েছে' : 'Address Copied') : (lang === 'bn' ? 'ঠিকানা কপি করুন' : 'Copy Address')}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Map Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('schematic')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'schematic'
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {lang === 'bn' ? '🗺️ স্টেশন এরিয়া ম্যাপ' : '🗺️ Station Area Map'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('google_embed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'google_embed'
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {lang === 'bn' ? '🌐 গুগল ম্যাপ' : '🌐 Google Map'}
                </button>
              </div>

              <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'স্টেশন গেট থেকে মাত্র ২০ গজ' : 'Only 20 yards from gate'}
              </span>
            </div>

            {/* Map Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 h-[300px] sm:h-[340px]">
              {viewMode === 'schematic' ? (
                <div 
                  onClick={onOpenFullMapModal}
                  className="w-full h-full cursor-pointer relative group flex items-center justify-center p-2"
                  title={lang === 'bn' ? 'পূর্ণাঙ্গ ইন্টারেক্টিভ ম্যাপ দেখতে ক্লিক করুন' : 'Click to view full interactive map'}
                >
                  <svg viewBox="0 0 700 360" className="w-full h-full select-none">
                    {/* Background */}
                    <rect width="700" height="360" fill="#0c0a09" rx="14" />
                    
                    {/* Railway Tracks & Platform */}
                    <rect x="30" y="20" width="640" height="70" rx="8" fill="#1c1917" stroke="#332f2b" strokeWidth="1.5" />
                    <line x1="40" y1="45" x2="660" y2="45" stroke="#78716c" strokeWidth="2.5" strokeDasharray="10 4" />
                    <line x1="40" y1="65" x2="660" y2="65" stroke="#78716c" strokeWidth="2.5" strokeDasharray="10 4" />
                    <text x="50" y="40" fill="#fde047" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      🚉 রেলওয়ে প্ল্যাটফর্ম ১ ও ২ (Railway Platform)
                    </text>

                    {/* Station Main Gate */}
                    <rect x="130" y="110" width="220" height="60" rx="12" fill="#1c1917" stroke="#38bdf8" strokeWidth="1.8" />
                    <text x="145" y="136" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      🏛️ স্টেশন মেইন এক্সিট গেট
                    </text>
                    <text x="145" y="154" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                      Main Exit & Ticket Counter
                    </text>

                    {/* Main Road */}
                    <rect x="20" y="190" width="660" height="60" rx="10" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
                    <line x1="30" y1="220" x2="670" y2="220" stroke="#eab308" strokeWidth="2" strokeDasharray="12 8" />
                    <text x="40" y="212" fill="#a8a29e" fontSize="11" fontWeight="bold">
                      🛣️ স্টেশন রোড (STATION MAIN ROAD)
                    </text>

                    {/* Walking Dotted Line */}
                    <path
                      d="M 240 170 L 240 205 L 420 205 L 420 270"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                    />

                    {/* Hotel Building */}
                    <rect 
                      x="350" 
                      y="260" 
                      width="220" 
                      height="85" 
                      rx="14" 
                      fill="#1c1917" 
                      stroke="#f59e0b" 
                      strokeWidth="2.5" 
                    />
                    <rect x="350" y="260" width="220" height="26" rx="12" fill="#f59e0b" />
                    <text x="365" y="278" fill="#000000" fontSize="12" fontWeight="900" fontFamily="sans-serif">
                      ⭐ হোটেল আল শেখ ফরিদ
                    </text>
                    <text x="365" y="306" fill="#fef08a" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                      📍 স্টেশন মেইন গেট সংলগ্ন
                    </text>
                    <text x="365" y="324" fill="#cbd5e1" fontSize="9.5" fontFamily="sans-serif">
                      খাবার সংগ্রহ কাউন্টার • সকাল ৬টা - রাত ১২টা
                    </text>

                    {/* Glowing Pin */}
                    <circle cx="460" cy="260" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <text x="454" y="265" fill="#ffffff" fontSize="12" fontWeight="bold">📍</text>
                  </svg>

                  {/* Click to expand overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shadow-lg flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'সম্পূর্ণ ম্যাপ ওপেন করুন' : 'Click to Open Full Map'}
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  title="Google Maps Embed"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent('Railway Station Road, Bangladesh')}&t=&z=16&ie=UTF8&iwloc=&output=embed&solution_id=gmp_git_agentskills_v1`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          {/* Right Column: Direction Steps & Pick-up Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'দোকানে যেভাবে পৌঁছাবেন ও খাবার নেবেন:' : 'How to Reach & Pickup:'}</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Train className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{lang === 'bn' ? 'ট্রেন প্ল্যাটফর্ম থেকে মাত্র ২০ গজ:' : 'From Train Platform (20 Yards):'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {lang === 'bn'
                      ? 'স্টেশন ১/২ নং প্ল্যাটফর্ম বা মেইন গেট দিয়ে বের হয়ে বাম দিকে তাকালেই আমাদের বড় সাইনবোর্ড ও প্রবেশদ্বার দেখতে পাবেন।'
                      : 'Exit from station main gate and walk 20 yards to your left.'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
                    <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{lang === 'bn' ? 'অনলাইন অর্ডার পিক-আপ নিয়ম:' : 'Online Order Self-Pickup:'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {lang === 'bn'
                      ? 'অনলাইনে অর্ডার করার পর কাউন্টারে এসে অর্ডার আইডি বললেই ঝটপট গরম ও তাজা খাবার প্যাকেট বুঝিয়ে দেওয়া হবে।'
                      : 'Show your order ID at the counter to collect your fresh piping hot food.'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  <span className="font-bold block mb-0.5 text-amber-300">
                    {lang === 'bn' ? '💡 হোম ডেলিভারি সংক্রান্ত তথ্য:' : '💡 Home Delivery Update:'}
                  </span>
                  <p className="leading-relaxed">
                    {lang === 'bn'
                      ? 'বর্তমানে শুধুমাত্র দোকানে এসে খাবার নিয়ে যাওয়ার সুবিধা চালু আছে। ইনশাআল্লাহ পরবর্তীতে সরাসরি হোম ডেলিভারি ব্যবস্থা চালু করা হবে।'
                      : 'Currently only self-pickup is available. Dedicated home delivery will be launched in the future.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Contact Buttons */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
              <a
                href={`tel:${HOTEL_INFO.phone1}`}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? `কল দিন: ${HOTEL_INFO.phone1}` : `Call: ${HOTEL_INFO.phone1}`}</span>
              </a>

              <button
                type="button"
                onClick={onOpenFullMapModal}
                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পূর্ণাঙ্গ ম্যাপ' : 'Explore Map'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
