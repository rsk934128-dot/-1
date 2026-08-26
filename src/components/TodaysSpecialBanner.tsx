import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShoppingBag, 
  Clock, 
  Award, 
  Calendar, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus, 
  Eye, 
  PhoneCall, 
  Zap, 
  Utensils, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import { FoodItem, CartItem, PortionOption } from '../types';

interface TodaysSpecialBannerProps {
  foodItems: FoodItem[];
  onAddToCart: (item: CartItem) => void;
  onOpenDetails: (food: FoodItem) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  lang: 'bn' | 'en';
}

interface DaySpecialConfig {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayBn: string;
  dayEn: string;
  foodId: string;
  specialHeadlineBn: string;
  specialHeadlineEn: string;
  taglineBn: string;
  taglineEn: string;
  discountPercent?: number;
  perkBn: string;
  perkEn: string;
}

// Curated daily specials for each day of the week based on station customer favorites
const WEEKLY_SPECIAL_SCHEDULE: DaySpecialConfig[] = [
  {
    dayIndex: 0, // Sunday
    dayBn: 'রবিবার',
    dayEn: 'Sunday',
    foodId: 'beef-1',
    specialHeadlineBn: 'রবিবারের স্পেশাল: ঐতিহ্যবাহী কষা গরুর মাংস',
    specialHeadlineEn: 'Sunday Special: Traditional Spicy Beef Curry',
    taglineBn: 'ধোঁয়া ওঠা ঝরঝরে ভাতের সাথে হোটেল আল শেখ ফরিদের নরম জুসি কষা মাংস ও তেলমশলার ঘন গ্রেভি!',
    taglineEn: 'Tender beef slow-cooked in rich homemade Bengali spices with steamed rice.',
    discountPercent: 10,
    perkBn: 'ঝোল ও স্পেশাল সালাদ সম্পূর্ণ ফ্রি',
    perkEn: 'Free extra rich gravy & fresh salad'
  },
  {
    dayIndex: 1, // Monday
    dayBn: 'সোমবার',
    dayEn: 'Monday',
    foodId: 'khichuri-1',
    specialHeadlineBn: 'সোমবারের স্পেশাল: সুগন্ধি ভুনা খিচুড়ি ও ডিম',
    specialHeadlineEn: 'Monday Special: Aromatic Spiced Bhuna Khichuri',
    taglineBn: 'সুগন্ধি চাল ও মুগ-মসুর ডালের খাঁটি ঘিয়ে ভাজা খিচুড়ি, ট্রেনের যাত্রীদের জন্য মাত্র ৩ মিনিটে রেডি!',
    taglineEn: 'Traditional spiced yellow rice & lentil meal, prepared in 3 minutes for passengers.',
    discountPercent: 15,
    perkBn: 'সাথে আচার ও ডাল ফ্রি',
    perkEn: 'Complimentary mixed pickle & dal'
  },
  {
    dayIndex: 2, // Tuesday
    dayBn: 'মঙ্গলবার',
    dayEn: 'Tuesday',
    foodId: 'fish-curry-1',
    specialHeadlineBn: 'মঙ্গলবারের স্পেশাল: তাজা নদীর রুই/কাতলা মাছের ঝোল',
    specialHeadlineEn: 'Tuesday Special: Fresh River Rui/Katla Fish Curry',
    taglineBn: 'নদীর টাটকা বড় রুই মাছের টুকরো, জিরা-হলুদের পাতলা ঘরোয়া ঝোলে স্বাস্থ্যকর রান্না।',
    taglineEn: 'Fresh carp fish steak simmered in flavorful traditional home-style gravy.',
    discountPercent: 10,
    perkBn: 'টাটকা লেবু ও কাঁচামরিচসহ পরিবেশন',
    perkEn: 'Served with fresh lime & green chili'
  },
  {
    dayIndex: 3, // Wednesday
    dayBn: 'বুধবার',
    dayEn: 'Wednesday',
    foodId: 'choto-mach-1',
    specialHeadlineBn: 'বুধবারের স্পেশাল: দেশি ছোট মাছের ঝাল চচ্চড়ি',
    specialHeadlineEn: 'Wednesday Special: River Small Fish Chorchori',
    taglineBn: 'খাঁটি সরিষার তেল, পেঁয়াজকুচি ও কাঁচামরিচে মাখামাখা ছোট মাছের চচ্চড়ি — একবার খেলে মুখে লেগে থাকবে!',
    taglineEn: 'Local fresh river fish cooked with authentic mustard oil & sliced onions.',
    discountPercent: 12,
    perkBn: 'গরম ধোঁয়া ওঠা ভাতের সাথে অতুলনীয়',
    perkEn: 'Best paired with hot steaming rice'
  },
  {
    dayIndex: 4, // Thursday
    dayBn: 'বৃহস্পতিবার',
    dayEn: 'Thursday',
    foodId: 'paratha-1',
    specialHeadlineBn: 'বৃহস্পতিবারের স্পেশাল: ক্রিস্পি লেয়ার পরোটা ও ডাল-ভাজি',
    specialHeadlineEn: 'Thursday Special: Crispy Layered Paratha & Dal',
    taglineBn: 'সকাল ও সন্ধ্যার হট ফেভারিট — ঘিয়ে ভাজা খাস্তা পরোটা ও ফোড়ন দেওয়া খাঁটি মসুর ডাল!',
    taglineEn: 'Golden layered flatbread served with garlic tempered yellow lentils.',
    discountPercent: 10,
    perkBn: 'স্পেশাল সুস্বাদু ডাল পরিপূরক',
    perkEn: 'Includes complementary seasoned dal'
  },
  {
    dayIndex: 5, // Friday
    dayBn: 'শুক্রবার',
    dayEn: 'Friday',
    foodId: 'jilapi-1',
    specialHeadlineBn: 'জুমার দিনের ধামাকা স্পেশাল: কড়াইয়ের গরম মচমচে জিলাপি',
    specialHeadlineEn: 'Friday Grand Special: Fresh Hot Syrupy Jilapi',
    taglineBn: 'খাঁটি সিরায় ডোবানো রসে টইটম্বুর খাস্তা জিলাপি — পারিবারিক পার্সেল ও স্টেশন যাত্রীদের সেরা উপহার!',
    taglineEn: 'Crisp, golden spirals soaked in fragrant cardamom sugar syrup.',
    discountPercent: 15,
    perkBn: '১ কেজির সাথে ফ্রি স্পেশাল প্যাকিং',
    perkEn: 'Free insulated family take-away box'
  },
  {
    dayIndex: 6, // Saturday
    dayBn: 'শনিবার',
    dayEn: 'Saturday',
    foodId: 'jilapi-1',
    specialHeadlineBn: 'শনিবারের স্পেশাল: গরম রসালো জিলাপি ও মালাই চা',
    specialHeadlineEn: 'Saturday Special: Hot Crispy Jilapi & Malai Tea',
    taglineBn: 'সকাল থেকে মধ্যরাত পর্যন্ত তাজা কড়াই থেকে নামানো গরম জিলাপি ও ঘন দুধের এলাচি মালাই চা!',
    taglineEn: 'Piping hot crispy jilapi accompanied by rich creamy Bengali station milk tea.',
    discountPercent: 10,
    perkBn: 'চা ও জিলাপি কম্বো সুবিধা',
    perkEn: 'Special tea & jilapi combo offer'
  },
];

export const TodaysSpecialBanner: React.FC<TodaysSpecialBannerProps> = ({
  foodItems,
  onAddToCart,
  onOpenDetails,
  onStartCall,
  lang,
}) => {
  // Current date evaluation
  const today = useMemo(() => new Date(), []);
  const todayDayIndex = today.getDay(); // 0-6

  // State to toggle between inspecting today's special vs other days of week
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayIndex);
  const [selectedPortionIdx, setSelectedPortionIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Active day configuration
  const activeDayConfig = useMemo(() => {
    return WEEKLY_SPECIAL_SCHEDULE.find((s) => s.dayIndex === selectedDayIndex) || WEEKLY_SPECIAL_SCHEDULE[0];
  }, [selectedDayIndex]);

  // Find the food item matching this day's special
  const specialFood: FoodItem = useMemo(() => {
    const found = foodItems.find((f) => f.id === activeDayConfig.foodId);
    if (found) return found;
    // Fallback to first special or first item if not found
    return foodItems.find((f) => f.isSpecial) || foodItems[0];
  }, [foodItems, activeDayConfig]);

  // Price calculations
  const currentPrice = specialFood.portions && specialFood.portions.length > 0
    ? specialFood.portions[selectedPortionIdx]?.price || specialFood.price
    : specialFood.price;

  const currentPortion: PortionOption | undefined = specialFood.portions && specialFood.portions.length > 0
    ? specialFood.portions[selectedPortionIdx]
    : undefined;

  const isActuallyToday = selectedDayIndex === todayDayIndex;

  // Bengali Date String
  const todayDateFormatted = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return lang === 'bn' 
      ? today.toLocaleDateString('bn-BD', options)
      : today.toLocaleDateString('en-US', options);
  }, [today, lang]);

  const handleAddToCart = () => {
    onAddToCart({
      food: specialFood,
      quantity,
      selectedPortion: currentPortion,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setQuantity(1);
    }, 1200);
  };

  return (
    <section 
      id="todays-special-section" 
      aria-label="Today's Special Banner"
      className="mx-4 sm:mx-6 lg:mx-8 my-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-7 lg:p-9 shadow-2xl border-2 border-amber-500/40">
        
        {/* Background Atmosphere & Floating Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 opacity-50 pointer-events-none" />

        {/* Header Ribbon: Live Date, Auto Badge & Day Selector */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-current animate-spin [animation-duration:4s]" />
              <span>
                {isActuallyToday 
                  ? (lang === 'bn' ? '🌟 আজকের বিশেষ আয়োজন (TODAY\'S SPECIAL)' : '🌟 TODAY\'S SPECIAL MENU') 
                  : (lang === 'bn' ? `📅 ${activeDayConfig.dayBn}-এর স্পেশাল মেনু` : `📅 ${activeDayConfig.dayEn} Special Menu`)}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-amber-200/90 font-medium bg-stone-900/80 px-3 py-1 rounded-full border border-stone-800">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayDateFormatted}</span>
            </span>

            {activeDayConfig.discountPercent && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-extrabold bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-500/40">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeDayConfig.discountPercent}% {lang === 'bn' ? 'অতিরিক্ত সুবিধা' : 'Special Offer'}</span>
              </span>
            )}
          </div>

          {/* Weekly Days Schedule Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-stone-950/80 p-1 rounded-2xl border border-stone-800 text-xs">
            <span className="text-[11px] font-bold text-stone-400 px-2 hidden md:inline">
              {lang === 'bn' ? 'সাপ্তাহিক রুটিন:' : 'Weekly Schedule:'}
            </span>
            {WEEKLY_SPECIAL_SCHEDULE.map((dayCfg) => {
              const isSelected = selectedDayIndex === dayCfg.dayIndex;
              const isTodayButton = dayCfg.dayIndex === todayDayIndex;

              return (
                <button
                  key={dayCfg.dayIndex}
                  type="button"
                  id={`special-day-tab-${dayCfg.dayIndex}`}
                  onClick={() => {
                    setSelectedDayIndex(dayCfg.dayIndex);
                    setSelectedPortionIdx(0);
                    setQuantity(1);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                      : isTodayButton
                      ? 'text-amber-300 hover:bg-stone-800 border border-amber-500/40'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                  title={`${dayCfg.dayBn}: ${dayCfg.specialHeadlineBn}`}
                >
                  <span>{lang === 'bn' ? dayCfg.dayBn : dayCfg.dayEn}</span>
                  {isTodayButton && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Banner Content Area (2-Column Hero Card) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-6">
          
          {/* Left Column: Food Image with Interactive Badges & Visual Focus */}
          <div className="lg:col-span-5 relative group">
            <div className="relative h-64 sm:h-72 lg:h-80 w-full rounded-2xl overflow-hidden bg-stone-950 border border-amber-500/30 shadow-xl">
              <img
                src={specialFood.image}
                alt={specialFood.nameBn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white flex items-center gap-1 shadow-lg backdrop-blur-xs">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>{lang === 'bn' ? 'তাজা ও গরম কড়াইয়ের' : 'Hot & Fresh'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-stone-950 flex items-center gap-1 shadow-lg backdrop-blur-xs">
                  <Award className="w-3.5 h-3.5 text-stone-950" />
                  <span>{lang === 'bn' ? 'শেফের বিশেষ সুপারিশ' : 'Chef’s Choice'}</span>
                </span>
              </div>

              {/* View Details Overlay Trigger */}
              <button
                type="button"
                id="btn-special-view-details"
                onClick={() => onOpenDetails(specialFood)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-md border border-stone-700 shadow-md transition-all cursor-pointer"
                title={lang === 'bn' ? 'খাবারের সম্পূর্ণ পুষ্টি ও বিস্তারিত তথ্য' : 'View Detailed Food Info'}
              >
                <Eye className="w-4 h-4 text-amber-300" />
              </button>

              {/* Bottom Image Stats: Prep Time & Calorie Ribbon */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 bg-stone-900/85 px-3 py-1 rounded-lg backdrop-blur-md border border-stone-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">
                    {lang === 'bn' 
                      ? `${specialFood.preparationTimeMinutes} মিনিটে প্রস্তুত` 
                      : `Ready in ${specialFood.preparationTimeMinutes} mins`}
                  </span>
                </span>

                <span className="bg-amber-600/90 text-white font-extrabold px-3 py-1 rounded-lg shadow-md backdrop-blur-md">
                  {lang === 'bn' ? specialFood.availableTimesBn : 'Available Today'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Descriptions, Portion Selector, Live Pricing & 1-Click Order Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            <div>
              {/* Dynamic Day Header Title */}
              <div className="flex items-center gap-2 mb-1 text-amber-400 font-serif text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'bn' ? activeDayConfig.specialHeadlineBn : activeDayConfig.specialHeadlineEn}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-white leading-tight">
                {lang === 'bn' ? specialFood.nameBn : specialFood.nameEn}
              </h3>

              {/* Tagline / Daily perk */}
              <p className="text-sm sm:text-base text-stone-200 mt-2 leading-relaxed">
                {lang === 'bn' ? activeDayConfig.taglineBn : activeDayConfig.taglineEn}
              </p>

              {/* Food description */}
              <p className="text-xs sm:text-sm text-stone-400 mt-1 leading-normal line-clamp-2">
                {lang === 'bn' ? specialFood.descriptionBn : specialFood.descriptionEn}
              </p>

              {/* Daily Perk Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {lang === 'bn' ? `আজকের অফার: ${activeDayConfig.perkBn}` : `Special Perk: ${activeDayConfig.perkEn}`}
                </span>
              </div>
            </div>

            {/* Portions Selection (if applicable, e.g. for Jilapi 250g, 500g, 1kg) */}
            {specialFood.portions && specialFood.portions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-400 block uppercase">
                  {lang === 'bn' ? 'পরিমাণ / সাইজ পছন্দ করুন:' : 'Select Portion:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {specialFood.portions.map((portion, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      id={`special-portion-btn-${pIdx}`}
                      onClick={() => setSelectedPortionIdx(pIdx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPortionIdx === pIdx
                          ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400/50'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                      }`}
                    >
                      <span>{lang === 'bn' ? portion.labelBn : portion.labelEn}</span>
                      <span className="ml-1 opacity-80 font-mono">৳{portion.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Add to Cart / Instant Order Controls */}
            <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
              
              {/* Live Price Tag */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-serif">
                  ৳ {currentPrice * quantity}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {currentPortion 
                    ? `(${lang === 'bn' ? currentPortion.labelBn : currentPortion.labelEn})` 
                    : `/${lang === 'bn' ? specialFood.unitBn : specialFood.unitEn}`}
                </span>
              </div>

              {/* Quantity Stepper & Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                
                {/* Quantity Stepper */}
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-bold text-xs text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  id="btn-special-add-to-cart"
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-orange-500/20'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{lang === 'bn' ? 'কার্টে যোগ হয়েছে ✓' : 'Added to Cart ✓'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-stone-950" />
                      <span>{lang === 'bn' ? '১-ক্লিকে কার্টে যোগ করুন' : 'Add Special to Cart'}</span>
                    </>
                  )}
                </button>

                {/* Quick Owner WebRTC Call */}
                <button
                  type="button"
                  id="btn-special-call-owner"
                  onClick={() => onStartCall('audio')}
                  className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-emerald-400 border border-stone-700 transition-colors cursor-pointer"
                  title={lang === 'bn' ? 'কল দিয়ে সরাসরি আজকের স্পেশাল অর্ডার করুন' : 'Call directly to order today\'s special'}
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
