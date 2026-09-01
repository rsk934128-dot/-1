import React from 'react';

export type SeasonalThemeId = 'classic' | 'eid' | 'baishakh' | 'monsoon' | 'winter' | 'puja';

export interface SeasonalTheme {
  id: SeasonalThemeId;
  nameBn: string;
  nameEn: string;
  seasonLabelBn: string;
  seasonLabelEn: string;
  taglineBn: string;
  taglineEn: string;
  emoji: string;
  bannerGreetingBn: string;
  bannerGreetingEn: string;
  specialOfferBn: string;
  specialOfferEn: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  topNoticeGradient: string;
  headerBorderColor: string;
  bannerGradient: string;
  bannerBgImage: string;
  bannerBorderColor: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
  };
  buttonGradient: string;
  accentBadgeGradient: string;
  glowColor: string;
  motifIcons: string[];
  themeDescriptionBn: string;
  themeDescriptionEn: string;
}

export const SEASONAL_THEMES: Record<SeasonalThemeId, SeasonalTheme> = {
  classic: {
    id: 'classic',
    nameBn: 'ক্লাসিক রাজকীয় ঐতিহ্য',
    nameEn: 'Classic Royal Heritage',
    seasonLabelBn: 'সারাবছরের মূল থিম',
    seasonLabelEn: 'All-Season Classic',
    taglineBn: '১৯৯৮ সাল থেকে খাঁটি স্বাদ ও আতিথেয়তা',
    taglineEn: 'Authentic taste and hospitality since 1998',
    emoji: '👑',
    bannerGreetingBn: 'ঐতিহ্যবাহী স্বাদের রাজকীয় ঠিকানা — স্টেশন এলাকা',
    bannerGreetingEn: 'Historic Station Dining — Pure Heritage Flavors',
    specialOfferBn: 'গরম গরম রসালো জিলাপি ১৬০ ৳/কেজি ও স্পেশাল ভুনা',
    specialOfferEn: 'Hot Crispy Jilapi ৳160/kg & Signature Bhuna',
    primaryColorHex: '#d97706', // amber-600
    secondaryColorHex: '#78350f', // amber-900
    accentColorHex: '#059669', // emerald-600
    topNoticeGradient: 'from-amber-700 via-amber-800 to-orange-800',
    headerBorderColor: 'border-amber-200/70',
    bannerGradient: 'from-stone-950 via-stone-900/90 to-amber-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-amber-500/20',
    badgeStyle: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
    },
    buttonGradient: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
    accentBadgeGradient: 'from-amber-500 to-yellow-500',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    motifIcons: ['👑', '⭐', '✨', '🍽️'],
    themeDescriptionBn: 'মূল ক্লাসিক গোল্ডেন ও অ্যাম্বার কালার প্যালেট সহ রাজকীয় মুকুট ও ঐতিহ্যবাহী নকশা।',
    themeDescriptionEn: 'The original golden-amber royal palace aesthetic celebrating traditional dining.',
  },

  eid: {
    id: 'eid',
    nameBn: 'পবিত্র ঈদ উৎসব',
    nameEn: 'Holy Eid Mubarak',
    seasonLabelBn: 'ঈদুল ফিতর ও ঈদুল আজহা',
    seasonLabelEn: 'Eid Festive Edition',
    taglineBn: 'ঈদ মোবারক! উৎসবের প্রতিটি মুহূর্তে স্পেশাল খাসি ও ফিরনি',
    taglineEn: 'Eid Mubarak! Special Mutton Kacchi & Shahi Firni Treats',
    emoji: '🌙',
    bannerGreetingBn: '🌙 ঈদ মোবারক! উৎসবের রাজকীয় খাসির কাচ্চি ও জর্দা মেহমানদারি',
    bannerGreetingEn: '🌙 Eid Mubarak! Grand Royal Feasts & Delicacies',
    specialOfferBn: 'ঈদের বিশেষ স্পেশাল মাটন কাচ্চি ও সুস্বাদু জাফরানি ফিরনি',
    specialOfferEn: 'Eid Special Mutton Biryani & Zafrani Shahi Firni',
    primaryColorHex: '#059669', // emerald-600
    secondaryColorHex: '#064e3b', // emerald-900
    accentColorHex: '#eab308', // gold yellow-500
    topNoticeGradient: 'from-emerald-800 via-teal-900 to-emerald-950',
    headerBorderColor: 'border-emerald-300/70',
    bannerGradient: 'from-stone-950 via-emerald-950/90 to-teal-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-emerald-500/40',
    badgeStyle: {
      bg: 'bg-emerald-500/25',
      text: 'text-emerald-300',
      border: 'border-emerald-400/50',
    },
    buttonGradient: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
    accentBadgeGradient: 'from-emerald-500 to-yellow-400',
    glowColor: 'rgba(5, 150, 105, 0.3)',
    motifIcons: ['🌙', '⭐', '🕌', '🏮', '✨'],
    themeDescriptionBn: 'সবুজ ও সোনালী চাঁদ-তারা ও ফানুশের নকশায় সাজানো পবিত্র ঈদের উৎসবমুখর পরিবেশ।',
    themeDescriptionEn: 'Emerald and gold crescent lanterns celebrating the joyous spirit of Eid.',
  },

  baishakh: {
    id: 'baishakh',
    nameBn: 'পহেলা বৈশাখ ও নববর্ষ',
    nameEn: 'Pahela Baishakh Fest',
    seasonLabelBn: 'শুভ নববর্ষ ও চৈত্র সংক্রান্তি',
    seasonLabelEn: 'Bengali New Year',
    taglineBn: 'মুছে যাক গ্লানি, ঘুচে যাক জরা — বৈশাখী ইলিশ-খিচুড়ি উৎসব',
    taglineEn: 'Celebrate the Bengali New Year with Hilsa & Khichuri Feast',
    emoji: '🪘',
    bannerGreetingBn: '🪘 শুভ নববর্ষ! বৈশাখী পান্তা-ইলিশ, ভুনা খিচুড়ি ও রসালো জিলাপি উৎসব',
    bannerGreetingEn: '🪘 Shuvo Noboborsho! Baishakhi Traditional Feast & Sweets',
    specialOfferBn: 'পহেলা বৈশাখ স্পেশাল পদ্মার ইলিশ ভাজা ও খাঁটি সরিষা ভর্তা',
    specialOfferEn: 'Baishakhi Fresh Padma Hilsa Fry & Mustard Bhorta Platter',
    primaryColorHex: '#dc2626', // red-600
    secondaryColorHex: '#991b1b', // red-800
    accentColorHex: '#eab308', // sunshine yellow
    topNoticeGradient: 'from-red-800 via-rose-900 to-amber-900',
    headerBorderColor: 'border-red-300/70',
    bannerGradient: 'from-stone-950 via-red-950/90 to-amber-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-red-500/40',
    badgeStyle: {
      bg: 'bg-red-500/25',
      text: 'text-red-300',
      border: 'border-red-400/50',
    },
    buttonGradient: 'from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500',
    accentBadgeGradient: 'from-red-500 via-orange-500 to-yellow-400',
    glowColor: 'rgba(220, 38, 38, 0.3)',
    motifIcons: ['🪘', '☀️', '🌺', '🪁', '🪭'],
    themeDescriptionBn: 'লাল-সাদা ঐতিহ্যবাহী বৈশাখী আলপনা, একতারা, ঢোল ও সূর্যের বর্ণিল লোকজ রূপ।',
    themeDescriptionEn: 'Vibrant crimson and sun-gold folk art motifs celebrating Bengali heritage.',
  },

  monsoon: {
    id: 'monsoon',
    nameBn: 'বর্ষা ও পদ্মার ইলিশ উৎসব',
    nameEn: 'Monsoon & Hilsa Festival',
    seasonLabelBn: 'আষাঢ়-শ্রাবণ বর্ষাকাল',
    seasonLabelEn: 'Monsoon Season',
    taglineBn: 'বৃষ্টির রিমঝিম শব্দে গরম গরম ভুনা খিচুড়ি আর তাজা ইলিশ ভাজা',
    taglineEn: 'Rainy days call for piping hot Khichuri and crispy Padma Hilsa',
    emoji: '🌧️',
    bannerGreetingBn: '🌧️ বর্ষার রিমঝিম বৃষ্টিতে তৃপ্তিদায়ক গরম খিচুড়ি ও পদ্মার তাজা ইলিশ',
    bannerGreetingEn: '🌧️ Rainy Season Monsoon Feast! Steaming Hot Khichuri & Hilsa',
    specialOfferBn: 'বর্ষা কম্বো: ভুনা খিচুড়ি + আস্ত ইলিশের পেটি ভাজা + বেগুন ভাজি',
    specialOfferEn: 'Monsoon Combo: Bhuna Khichuri + Fried Hilsa + Eggplant Fry',
    primaryColorHex: '#0284c7', // sky-600
    secondaryColorHex: '#0369a1', // sky-700
    accentColorHex: '#14b8a6', // teal-500
    topNoticeGradient: 'from-blue-900 via-sky-950 to-indigo-950',
    headerBorderColor: 'border-sky-300/70',
    bannerGradient: 'from-stone-950 via-slate-900/90 to-sky-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-sky-500/40',
    badgeStyle: {
      bg: 'bg-sky-500/25',
      text: 'text-sky-300',
      border: 'border-sky-400/50',
    },
    buttonGradient: 'from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-blue-600',
    accentBadgeGradient: 'from-sky-400 to-teal-400',
    glowColor: 'rgba(2, 132, 199, 0.3)',
    motifIcons: ['🌧️', '🐟', '💧', '🪷', '☂️'],
    themeDescriptionBn: 'স্নিগ্ধ নীল জলীয় আবহ, পদ্মার ইলিশ মাছ, পদ্মফুল ও বৃষ্টির ফোঁটার প্রশান্তিদায়ক থিম।',
    themeDescriptionEn: 'Refreshing oceanic sky-blue aesthetic with rain droplets and Padma river Hilsa motifs.',
  },

  winter: {
    id: 'winter',
    nameBn: 'শীতের পিঠা ও বারবিকিউ উৎসব',
    nameEn: 'Winter Pitha & BBQ Fest',
    seasonLabelBn: 'পৌষ-মাঘ শীতকাল',
    seasonLabelEn: 'Winter Season',
    taglineBn: 'কুয়াশার সকালে গরম ভাপা-চিতই পিঠা ও সন্ধ্যায় মাটির চুলার হাঁসের মাংস',
    taglineEn: 'Foggy mornings with warm Pitha & evenings with rich Duck Curry',
    emoji: '🔥',
    bannerGreetingBn: '🔥 শীতের উষ্ণতা! ধোঁয়া ওঠা ভাপা পিঠা, হাঁসের মাংস ভুনা ও কড়া মালাই চা',
    bannerGreetingEn: '🔥 Cozy Winter Festivities! Steaming Pitha, Duck Bhuna & Spiced Tea',
    specialOfferBn: 'শীতকালীন স্পেশাল: দেশি হাঁসের কালা ভুনা ও চালের আটার গরম রুটি',
    specialOfferEn: 'Winter Special: Traditional Duck Kala Bhuna & Warm Rice Flatbreads',
    primaryColorHex: '#ea580c', // orange-600
    secondaryColorHex: '#9a3412', // orange-800
    accentColorHex: '#e11d48', // rose-600
    topNoticeGradient: 'from-orange-950 via-amber-950 to-stone-950',
    headerBorderColor: 'border-orange-300/70',
    bannerGradient: 'from-stone-950 via-orange-950/90 to-amber-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-orange-500/40',
    badgeStyle: {
      bg: 'bg-orange-500/25',
      text: 'text-orange-300',
      border: 'border-orange-400/50',
    },
    buttonGradient: 'from-orange-600 via-amber-600 to-rose-700 hover:from-orange-500 hover:to-amber-500',
    accentBadgeGradient: 'from-orange-500 to-rose-500',
    glowColor: 'rgba(234, 88, 12, 0.3)',
    motifIcons: ['🔥', '☕', '❄️', '🍲', '🧣'],
    themeDescriptionBn: 'শীতের গরম চুলার শিখা, ভাপা পিঠার ধোঁয়া, কুয়াশা ও মালাই চায়ের আরামদায়ক উষ্ণতা।',
    themeDescriptionEn: 'Cozy ember glow, bonfire warmth, steaming winter delicacies and duck curry.',
  },

  puja: {
    id: 'puja',
    nameBn: 'শারদীয় ও শরৎ উৎসব',
    nameEn: 'Autumn & Sharad Utsav',
    seasonLabelBn: 'ভাদ্র-আশ্বিন শরৎকাল',
    seasonLabelEn: 'Autumn Festive Season',
    taglineBn: 'শুভ্র কাশফুল আর ঢাকের বোলে শারদীয় আনন্দ ও সুস্বাদু মিষ্টি উৎসব',
    taglineEn: 'Autumn breeze, golden marigold flowers and pure traditional sweets',
    emoji: '🪔',
    bannerGreetingBn: '🪔 শারদীয় শুভেচ্ছা! স্পেশাল খাঁটি ছানার মিষ্টি, মতিচুর লাড্ডু ও রাজকীয় ভোগ',
    bannerGreetingEn: '🪔 Autumn Festival Greetings! Shahi Sweets, Motichoor Laddu & Feasts',
    specialOfferBn: 'শারদীয় স্পেশাল খাঁটি ঘিয়ের রসগোল্লা ও কেশরী লাড্ডু বক্স',
    specialOfferEn: 'Festive Box: Pure Ghee Rasgulla & Kesar Motichoor Laddu',
    primaryColorHex: '#d97706', // amber-600
    secondaryColorHex: '#7c2d12', // orange-900
    accentColorHex: '#ec4899', // pink-500
    topNoticeGradient: 'from-orange-800 via-amber-900 to-yellow-950',
    headerBorderColor: 'border-amber-300/70',
    bannerGradient: 'from-stone-950 via-amber-950/90 to-orange-950/80',
    bannerBgImage: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?auto=format&fit=crop&w=1600&q=80',
    bannerBorderColor: 'border-amber-500/40',
    badgeStyle: {
      bg: 'bg-amber-500/25',
      text: 'text-amber-300',
      border: 'border-amber-400/50',
    },
    buttonGradient: 'from-amber-600 via-orange-600 to-pink-600 hover:from-amber-500 hover:to-orange-500',
    accentBadgeGradient: 'from-amber-400 via-yellow-400 to-pink-400',
    glowColor: 'rgba(217, 119, 6, 0.3)',
    motifIcons: ['🪔', '🌾', '🌼', '🥁', '✨'],
    themeDescriptionBn: 'শুভ্র কাশফুল, গাঁদা ফুলের মালা, প্রদীপের আলো ও ঢাকের তালের শারদীয় আনন্দ।',
    themeDescriptionEn: 'Golden autumn marigold glow, festive earthen diyas and sweet delights.',
  },
};

export const STORAGE_KEY_SEASONAL_THEME = 'hotel_sheikh_farid_seasonal_theme';

export function getSavedSeasonalTheme(): SeasonalThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SEASONAL_THEME) as SeasonalThemeId | null;
    if (saved && SEASONAL_THEMES[saved]) {
      return saved;
    }
  } catch (e) {
    // Ignore error
  }
  return 'classic';
}

export function saveSeasonalTheme(themeId: SeasonalThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY_SEASONAL_THEME, themeId);
  } catch (e) {
    // Ignore error
  }
}

/**
 * Auto-detect season based on current real-world calendar date
 */
export function getAutoDetectedSeason(): SeasonalThemeId {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 8 = Sep, 11 = Dec

  // April -> Baishakh (Month 3)
  if (month === 3) return 'baishakh';
  // June, July, August -> Monsoon (Months 5, 6, 7)
  if (month >= 5 && month <= 7) return 'monsoon';
  // September, October -> Puja/Autumn (Months 8, 9)
  if (month >= 8 && month <= 9) return 'puja';
  // November, December, January -> Winter (Months 10, 11, 0)
  if (month >= 10 || month === 0) return 'winter';
  
  return 'classic';
}
