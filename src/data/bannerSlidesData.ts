export interface BannerTicker {
  titleBn: string;
  titleEn: string;
  priceBn: string;
  priceEn: string;
  unitBn: string;
  unitEn: string;
}

export type BannerActionType = 
  | 'category' 
  | 'tableBooking' 
  | 'tableQr' 
  | 'gallery' 
  | 'saas' 
  | 'call' 
  | 'share';

export interface BannerAction {
  labelBn: string;
  labelEn: string;
  type: BannerActionType;
  category?: string;
  icon: 'ShoppingBag' | 'Utensils' | 'ScanLine' | 'PhoneCall' | 'Crown' | 'Camera' | 'QrCode' | 'UtensilsCrossed';
}

export interface BannerSlide {
  id: string;
  slideNumber: number;
  badge1Bn: string;
  badge1En: string;
  badge2Bn: string;
  badge2En: string;
  badge3Bn: string;
  badge3En: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  bgImage: string;
  gradient: string;
  glowColor: string;
  accentBorder: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  primaryAction: BannerAction;
  secondaryAction?: BannerAction;
  tertiaryAction?: BannerAction;
  tickers: BannerTicker[];
}

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'heritage-station',
    slideNumber: 1,
    badge1Bn: 'রেলওয়ে স্টেশন এলাকা',
    badge1En: 'Railway Station Area',
    badge2Bn: 'ঐতিহ্যবাহী সেরা ঘরোয়া স্বাদ',
    badge2En: 'Historic Authentic Flavors',
    badge3Bn: 'দ্রুত পার্সেল ও প্ল্যাটফর্ম ডেলিভারি',
    badge3En: 'Fast Parcel & Platform Delivery',
    titleBn: 'হোটেল আল শেখ ফরিদ',
    titleEn: 'Hotel Al Sheikh Farid',
    subtitleBn: 'রেলওয়ে স্টেশন এলাকার সেরা ঘরোয়া ও তাজা খাবারের বিশ্বস্ত ঠিকানা',
    subtitleEn: 'The most trusted destination for fresh homemade meals at Station Area',
    descriptionBn: 'প্রোপাইটার: মো: আব্দুল বারিক শেখ | খাঁটি তেলে ভাজা সুস্বাদু খাবার, ধোঁয়া ওঠা গরম ভাত ও তাজা দেশি মাছ-মাংস।',
    descriptionEn: 'Proprietor: Md. Abdul Barik Sheikh | Authentic dishes fried in pure oil, steaming hot rice & fresh local meat/fish.',
    bgImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-stone-950 via-stone-900/95 to-amber-950/80',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    accentBorder: 'border-amber-500/30',
    badgeColor: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
    },
    primaryAction: {
      labelBn: 'জিলাপি ও নাস্তা অর্ডার করুন',
      labelEn: 'Order Jilapi & Snacks',
      type: 'category',
      category: 'sweets_snacks',
      icon: 'ShoppingBag',
    },
    secondaryAction: {
      labelBn: 'মাছ-মাংস ও দুপুরের খাবার',
      labelEn: 'Fish & Meat Menu',
      type: 'category',
      category: 'lunch_dinner',
      icon: 'Utensils',
    },
    tertiaryAction: {
      labelBn: 'হোটেল মালিককে কল করুন',
      labelEn: 'Call Proprietor',
      type: 'call',
      icon: 'PhoneCall',
    },
    tickers: [
      { titleBn: 'রসালো জিলাপি', titleEn: 'Crispy Jilapi', priceBn: '১৬০', priceEn: '160', unitBn: 'কেজি', unitEn: 'kg' },
      { titleBn: 'কষা গরুর মাংস', titleEn: 'Beef Curry', priceBn: '৮০', priceEn: '80', unitBn: 'পিস', unitEn: 'pc' },
      { titleBn: 'ভুনা খিচুড়ি', titleEn: 'Bhuna Khichuri', priceBn: '৩০', priceEn: '30', unitBn: 'প্লেট', unitEn: 'plate' },
      { titleBn: 'তাজা রুই/পাঙ্গাস', titleEn: 'Fresh Fish', priceBn: '৬০-৮০', priceEn: '60-80', unitBn: 'পিস', unitEn: 'pc' },
    ],
  },
  {
    id: 'train-passenger-express',
    slideNumber: 2,
    badge1Bn: '🚆 ট্রেনের যাত্রী স্পেশাল',
    badge1En: '🚆 Train Passenger Special',
    badge2Bn: '⏱️ মাত্র ৩ মিনিটে রেডি পার্সেল',
    badge2En: '⏱️ Ready in 3 Minutes',
    badge3Bn: '📦 ১০০% লিক-প্রুফ গরম প্যাক',
    badge3En: '📦 100% Leak-Proof Pack',
    titleBn: 'ট্রেনের যাত্রীদের জন্য ৩ মিনিটে গরম পার্সেল!',
    titleEn: '3-Minute Hot Parcel for Train Travelers!',
    subtitleBn: 'ট্রেন ছাড়ার আগেই আপনার বগি বা সিটে পৌঁছে যাবে ধোঁয়া ওঠা সুস্বাদু খাবার',
    subtitleEn: 'Steaming hot delicious meals delivered directly to your coach before departure',
    descriptionBn: 'রেলওয়ে স্টেশনের মেইন গেট সংলগ্ন আমাদের কিচেন। ১ ও ২ নম্বর প্ল্যাটফর্মের যাত্রীদের জন্য ট্রেনের সময়সূচী অনুযায়ী বিশেষ ফাস্ট ডেলিভারি ও স্বাস্থ্যকর প্যাকেজিং।',
    descriptionEn: 'Located right next to the Railway Station Main Gate. Express packaging and fast platform delivery coordinated with rail departures.',
    bgImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-stone-950 via-orange-950/90 to-stone-900/90',
    glowColor: 'rgba(234, 88, 12, 0.28)',
    accentBorder: 'border-orange-500/35',
    badgeColor: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-300',
      border: 'border-orange-500/40',
    },
    primaryAction: {
      labelBn: '🚆 ট্রেনের জন্য পার্সেল অর্ডার করুন',
      labelEn: 'Order Train Parcel',
      type: 'category',
      category: 'breakfast',
      icon: 'ShoppingBag',
    },
    secondaryAction: {
      labelBn: '📞 ট্রেনে বসেই কল দিয়ে অর্ডার',
      labelEn: 'Call from Train Coach',
      type: 'call',
      icon: 'PhoneCall',
    },
    tertiaryAction: {
      labelBn: '📷 টেবিল কিউআর স্ক্যান',
      labelEn: 'Scan Table QR',
      type: 'tableQr',
      icon: 'ScanLine',
    },
    tickers: [
      { titleBn: 'সুগন্ধি ভুনা খিচুড়ি', titleEn: 'Bhuna Khichuri', priceBn: '৩০', priceEn: '30', unitBn: 'বক্স', unitEn: 'box' },
      { titleBn: 'স্পেশাল ডিম ভুনা', titleEn: 'Egg Bhuna', priceBn: '২৫', priceEn: '25', unitBn: 'পিস', unitEn: 'pc' },
      { titleBn: 'কষা মাংস ও ভাত প্যাক', titleEn: 'Beef Rice Pack', priceBn: '১০০', priceEn: '100', unitBn: 'সেট', unitEn: 'set' },
      { titleBn: 'মিনারেল ওয়াটার (৫০০ মিলি)', titleEn: 'Mineral Water', priceBn: '১৫', priceEn: '15', unitBn: 'বোতল', unitEn: 'btl' },
    ],
  },
  {
    id: 'crispy-hot-jilapi',
    slideNumber: 3,
    badge1Bn: '🍯 স্টেশন বিখ্যাত মিষ্টি',
    badge1En: '🍯 Station Famous Sweet',
    badge2Bn: '🔥 কড়াই থেকে সরাসরি প্লেটে',
    badge2En: '🔥 Fresh from the Wok',
    badge3Bn: '🎁 ১-২ কেজি ফ্যামিলি অফার',
    badge3En: '🎁 1-2 KG Family Deals',
    titleBn: 'জিভে জল আনা খাঁটি গরম রসালো জিলাপি',
    titleEn: 'Mouthwatering Hot & Crispy Jilapi',
    subtitleBn: 'টাটকা কড়াই থেকে নামানো মচমচে জিলাপি — খাঁটি চিনি ও এলাচের সুবাসিত সিরায় ডোবানো',
    subtitleEn: 'Crispy swirl fried in pure oil and immersed in rich aromatic cardamom sugar syrup',
    descriptionBn: 'প্রতিদিন সকাল ও বিকেলে হাজারো ক্রেতার প্রিয় স্টেশন এলাকার ঐতিহাসিক জিলাপি। সাথে পাবেন তাজা পরোটা, ডিম ভাজি ও সুস্বাদু লাল চা।',
    descriptionEn: 'The pride of the station market for decades. Freshly prepared in batches every morning and evening.',
    bgImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-stone-950 via-amber-950/95 to-yellow-950/80',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    accentBorder: 'border-yellow-500/40',
    badgeColor: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-300',
      border: 'border-yellow-500/40',
    },
    primaryAction: {
      labelBn: '🍯 গরম জিলাপি এখনই কিনুন',
      labelEn: 'Order Hot Jilapi',
      type: 'category',
      category: 'sweets_snacks',
      icon: 'ShoppingBag',
    },
    secondaryAction: {
      labelBn: '📸 ৮K ফুড গ্যালারি ও কিচেন',
      labelEn: '8K Food Gallery',
      type: 'gallery',
      icon: 'Camera',
    },
    tertiaryAction: {
      labelBn: '📲 কিউআর স্ক্যান ও শেয়ার',
      labelEn: 'Share Sweet Offer',
      type: 'share',
      icon: 'QrCode',
    },
    tickers: [
      { titleBn: '২৫০ গ্রাম জিলাপি', titleEn: '250gm Pack', priceBn: '৪০', priceEn: '40', unitBn: 'প্যাক', unitEn: 'pack' },
      { titleBn: 'আধা কেজি জিলাপি', titleEn: '500gm Pack', priceBn: '৮০', priceEn: '80', unitBn: 'প্যাক', unitEn: 'pack' },
      { titleBn: '১ কেজি ফুল বক্স', titleEn: '1 KG Box', priceBn: '১৬০', priceEn: '160', unitBn: 'কেজি', unitEn: 'kg' },
      { titleBn: '২ কেজি ফ্যামিলি বক্স', titleEn: '2 KG Family Box', priceBn: '৩২০', priceEn: '320', unitBn: 'বক্স', unitEn: 'box' },
    ],
  },
  {
    id: 'river-fish-vorta-feast',
    slideNumber: 4,
    badge1Bn: '🐟 তাজা নদীর দেশি মাছ',
    badge1En: '🐟 Fresh River Fish',
    badge2Bn: '🥣 ৮ পদের স্পেশাল ঘরোয়া ভর্তা',
    badge2En: '🥣 8 Traditional Vorta',
    badge3Bn: '🌿 খাঁটি সরিষার তেলের রান্না',
    badge3En: '🌿 Cooked in Mustard Oil',
    titleBn: 'নদীর তাজা রুই, কাতলা ও ছোট মাছের চচ্চড়ি',
    titleEn: 'Fresh River Fish & Authentic Vorta Feast',
    subtitleBn: 'নদী থেকে সরাসরি সংগৃহীত তাজা মাছ খাঁটি সরিষার তেলে ঘরোয়া রন্ধনশৈলীতে সুস্বাদু রান্না',
    subtitleEn: 'Locally sourced river fish cooked in genuine mustard oil with aromatic home-style spices',
    descriptionBn: 'ধোঁয়া ওঠা গরম সাদা ভাতের সাথে রুই মাছের গাঢ় ঝোল কিংবা সরিষার তেলে মাখানো আলু-বেগুন-কালোজিরা-ডাল ভর্তা — প্রতি লোকমায় পরম তৃপ্তি!',
    descriptionEn: 'Steamed rice paired with flavorful fish steaks or mustard-infused artisanal mashed vegetable vortas.',
    bgImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-stone-950 via-teal-950/90 to-emerald-950/80',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    accentBorder: 'border-emerald-500/35',
    badgeColor: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
    },
    primaryAction: {
      labelBn: '🐟 মাছ-মাংস ও দুপুরের খাবার মেনু',
      labelEn: 'Fish & Lunch Menu',
      type: 'category',
      category: 'lunch_dinner',
      icon: 'Utensils',
    },
    secondaryAction: {
      labelBn: '🪑 ফ্যামিলি সিট ও টেবিল বুকিং',
      labelEn: 'Book Family Table',
      type: 'tableBooking',
      icon: 'UtensilsCrossed',
    },
    tertiaryAction: {
      labelBn: '📞 স্পেশাল মাছের অর্ডার',
      labelEn: 'Order Special Fish',
      type: 'call',
      icon: 'PhoneCall',
    },
    tickers: [
      { titleBn: 'ছোট মাছ চচ্চড়ি', titleEn: 'River Fish Chorchori', priceBn: '৪০', priceEn: '40', unitBn: 'বাটি', unitEn: 'bowl' },
      { titleBn: 'রুই মাছের পাতলা ঝোল', titleEn: 'Rui Fish Curry', priceBn: '৭০', priceEn: '70', unitBn: 'পিস', unitEn: 'pc' },
      { titleBn: 'পাঙ্গাস মাছ ভুনা/ঝোল', titleEn: 'Pangas Curry', priceBn: '৬০', priceEn: '60', unitBn: 'পিস', unitEn: 'pc' },
      { titleBn: 'ঘরোয়া স্পেশাল ভর্তা', titleEn: 'Special Vorta', priceBn: '১০', priceEn: '10', unitBn: 'পদ', unitEn: 'item' },
    ],
  },
  {
    id: 'smart-table-cashless',
    slideNumber: 5,
    badge1Bn: '📱 স্মার্ট কিউআর অর্ডার',
    badge1En: '📱 Smart QR Ordering',
    badge2Bn: '💳 বিকাশ ও কার্ড ক্যাশলেস পে',
    badge2En: '💳 bKash & Cashless Pay',
    badge3Bn: '⚡ জিরো ওয়েটিং টাইম',
    badge3En: '⚡ Zero Wait Time',
    titleBn: 'টেবিলে বসেই নিজের ফোন দিয়ে দ্রুত অর্ডার করুন',
    titleEn: 'Order Right from Your Table with Your Phone',
    subtitleBn: 'কোনো ওয়েটারের জন্য অপেক্ষা ছাড়াই সরাসরি টেবিলের কিউআর কোড স্ক্যান করে অর্ডার পাঠিয়ে দিন কিচেনে',
    subtitleEn: 'Scan table QR code, browse live menu, customize portions, and send directly to our kitchen',
    descriptionBn: 'লাইভ অর্ডার ট্র্যাকিং, ইনস্ট্যান্ট বিকাশ পেমেন্ট, অনলাইন রসিদ এবং লয়ালটি পয়েন্ট সুবিধা — হোটেল আল শেখ ফরিদ এখন সম্পূর্ণ ডিজিটাল!',
    descriptionEn: 'Live kitchen status updates, instant bKash checkout, digital invoice sent to email, and loyalty points.',
    bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-stone-950 via-indigo-950/90 to-purple-950/80',
    glowColor: 'rgba(99, 102, 241, 0.28)',
    accentBorder: 'border-indigo-500/40',
    badgeColor: {
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
    },
    primaryAction: {
      labelBn: '📷 টেবিল কিউআর স্ক্যান করুন',
      labelEn: 'Scan Table QR Code',
      type: 'tableQr',
      icon: 'ScanLine',
    },
    secondaryAction: {
      labelBn: '💼 রেস্তোরাঁ SaaS সিস্টেম দেখুন',
      labelEn: 'Restaurant SaaS System',
      type: 'saas',
      icon: 'Crown',
    },
    tertiaryAction: {
      labelBn: '🪑 সিট ও টেবিল বুকিং',
      labelEn: 'Seat / Table Booking',
      type: 'tableBooking',
      icon: 'UtensilsCrossed',
    },
    tickers: [
      { titleBn: 'কিউআর চেক-ইন', titleEn: 'QR Check-in', priceBn: 'ফ্রি', priceEn: 'Free', unitBn: 'তাত্ক্ষণিক', unitEn: 'instant' },
      { titleBn: 'বিকাশ ক্যাশব্যাক', titleEn: 'bKash Offer', priceBn: '১০%', priceEn: '10%', unitBn: 'পর্যন্ত', unitEn: 'up to' },
      { titleBn: 'লাইভ কিচেন সিঙ্ক', titleEn: 'Kitchen Sync', priceBn: 'লাইভ', priceEn: 'Live', unitBn: 'রিয়েল-টাইম', unitEn: 'real-time' },
      { titleBn: 'ডিজিটাল রসিদ', titleEn: 'Digital Receipt', priceBn: 'এসএমএস', priceEn: 'SMS', unitBn: 'ও ইমেইল', unitEn: '& Email' },
    ],
  },
];
