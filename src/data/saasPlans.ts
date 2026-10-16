export interface SaaSSubscriptionPlan {
  id: 'starter' | 'pro' | 'enterprise';
  nameBn: string;
  nameEn: string;
  badgeBn?: string;
  badgeEn?: string;
  popular?: boolean;
  priceMonthlyBDT: number;
  priceQuarterlyBDT: number;
  priceYearlyBDT: number;
  priceLifetimeBDT?: number;
  descriptionBn: string;
  descriptionEn: string;
  limits: {
    monthlyOrders: string;
    menuItems: string;
    branches: string;
    staffAccounts: string;
    customDomain: boolean;
    whiteLabelBranding: boolean;
    voiceAiOrdering: boolean;
    bkashAutoMatch: boolean;
    sourceCodeAccess: boolean;
  };
  featuresBn: string[];
  featuresEn: string[];
}

export interface SaaSTenant {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  location: string;
  planId: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'pending' | 'expired';
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  licenseKey: string;
  domainUrl: string;
  totalOrdersProcessed: number;
  startDate: string;
  expiryDate: string;
  brandColor: string;
  customLogoUrl?: string;
}

export interface SaaSOrderRequest {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  district: string;
  planId: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  priceBDT: number;
  paymentMethod: 'stripe' | 'bkash' | 'nagad' | 'rocket' | 'bank';
  transactionId: string;
  desiredDomain?: string;
  notes?: string;
  requestedAt: string;
  status: 'pending' | 'verified' | 'deployed';
  stripeReceipt?: {
    cardBrand: string;
    cardLast4: string;
    paymentIntentId: string;
    chargeId: string;
    receiptUrl?: string;
    paidAt: string;
  };
}

export const SAAS_PLANS: SaaSSubscriptionPlan[] = [
  {
    id: 'starter',
    nameBn: 'স্টার্টার ক্লাউড (Starter Cloud)',
    nameEn: 'Starter Cloud Plan',
    badgeBn: 'ছোট রেস্তোরাঁ ও ক্যাফে',
    badgeEn: 'Small Dine-in & Cafe',
    popular: false,
    priceMonthlyBDT: 1999,
    priceQuarterlyBDT: 5399,
    priceYearlyBDT: 19990,
    priceLifetimeBDT: 39990,
    descriptionBn: 'ছোট হোটেল, মিষ্টির দোকান ও চায়ের ক্যাফের জন্য উপযুক্ত ডিজিটাল অর্ডারিং সলিউশন।',
    descriptionEn: 'Essential digital ordering & POS system for single branch cafes & bakeries.',
    limits: {
      monthlyOrders: '৫০০ অর্ডার / মাস',
      menuItems: '৫০টি মেনু আইটেম',
      branches: '১টি শাখা',
      staffAccounts: '২ জন স্টাফ',
      customDomain: false,
      whiteLabelBranding: false,
      voiceAiOrdering: false,
      bkashAutoMatch: false,
      sourceCodeAccess: false
    },
    featuresBn: [
      'ডিজিটাল কিউআর মেনু ও অনলাইন ফুড অর্ডারিং',
      'টেবিল বুকিং ও পার্সেল ম্যানেজমেন্ট',
      'ম্যানুয়াল বিকাশ/নগদ/ক্যাশ অন ডেলিভারি',
      'প্রিন্টাবল কিচেন রসিদ (POS প্রিন্টার সাপোর্ট)',
      'পিডার ও লোকাল অফলাইন ক্যাশিং (PWA)',
      'মৌলিক সেলস রিপোর্ট ও কাস্টমার রিভিউ'
    ],
    featuresEn: [
      'Digital QR Menu & Online Ordering',
      'Table Reservation & Parcel Module',
      'Manual bKash/Nagad/COD Support',
      'Printable POS Kitchen Receipts',
      'Offline PWA Cached Support',
      'Basic Sales Reports & Customer Reviews'
    ]
  },
  {
    id: 'pro',
    nameBn: 'প্রো রেস্তোরাঁ সুইট (Pro Suite)',
    nameEn: 'Pro Restaurant Suite',
    badgeBn: '🔥 সর্বাধিক জনপ্রিয় ও লাভজনক',
    badgeEn: '🔥 Most Popular & Highest ROI',
    popular: true,
    priceMonthlyBDT: 4999,
    priceQuarterlyBDT: 13499,
    priceYearlyBDT: 47990,
    priceLifetimeBDT: 69990,
    descriptionBn: 'উচ্চ ভলিউম রেস্তোরাঁ ও ডেলিভারি কিচেনের জন্য ফুল-অটোমেটেড এআই ও বিকাশ এসএমএস সমন্বিত অল-ইন-ওয়ান সুইট।',
    descriptionEn: 'Full-featured AI-powered ordering suite with automated bKash reconciliation & live stream.',
    limits: {
      monthlyOrders: 'আনলিমিটেড অর্ডার',
      menuItems: 'আনলিমিটেড আইটেম',
      branches: '২টি শাখা পর্যন্ত',
      staffAccounts: '১০ জন স্টাফ',
      customDomain: true,
      whiteLabelBranding: true,
      voiceAiOrdering: true,
      bkashAutoMatch: true,
      sourceCodeAccess: false
    },
    featuresBn: [
      'সব স্টার্টার ফিচার + আনলিমিটেড মাসিক অর্ডার',
      'বাংলা এআই ভয়েস কমান্ডে ফুড অর্ডারিং',
      'অটো বিকাশ এসএমএস রিকনসিলিয়েশন ও ভেরিফিকেশন',
      'লাইভ ৮K কিচেন ভিডিও ও সাউন্ড অ্যাম্বিয়েন্স সেলস',
      'রিয়েল-টাইম ডেলিভারি রাইডার ম্যাপ ট্র্যাকিং',
      'অটোমেটিক হোয়াটসঅ্যাপ ও জিমেইল ডিজিটাল ইনভয়েস',
      'লয়ালটি রিওয়ার্ডস, পয়েন্ট এবং টপ কাস্টমার লিডারবোর্ড',
      'ট্রেন স্টেশন ও প্ল্যাটফর্ম ডেলিভারি সাপোর্ট'
    ],
    featuresEn: [
      'All Starter features + Unlimited Orders',
      'Bangla AI Voice Ordering system',
      'Automated bKash SMS Match & Verification',
      '8K Live Kitchen Video & Audio Sizzle stream',
      'Real-time Rider Map Tracking',
      'Instant WhatsApp & Gmail Digital Invoices',
      'Loyalty Points & Customer Leaderboards',
      'Train Station & Platform Seat Delivery'
    ]
  },
  {
    id: 'enterprise',
    nameBn: 'এন্টারপ্রাইজ হোয়াইট-লেবেল (White-Label)',
    nameEn: 'Enterprise White-Label & Multi-Branch',
    badgeBn: '👑 ফুল সোর্স ও নিজস্ব ব্র্যান্ড',
    badgeEn: '👑 Full Branding & Chain System',
    popular: false,
    priceMonthlyBDT: 12999,
    priceQuarterlyBDT: 34999,
    priceYearlyBDT: 99990,
    priceLifetimeBDT: 149990,
    descriptionBn: 'মাল্টি-ব্রাঞ্চ ফুড চেইনের জন্য শতভাগ নিজস্ব ডোমেইন, প্লে-স্টোর অ্যাপ এবং এক্সক্লুসিভ ডেডিকেটেড ক্লাউড ডাটাবেস।',
    descriptionEn: '100% white-labeled solution with custom domain, Android APK, and multi-branch master dashboard.',
    limits: {
      monthlyOrders: 'আনলিমিটেড (মাল্টি-ব্রাঞ্চ)',
      menuItems: 'আনলিমিটেড',
      branches: 'আনলিমিটেড শাখা',
      staffAccounts: 'আনলিমিটেড ম্যানেজার/কুক/রাইডার',
      customDomain: true,
      whiteLabelBranding: true,
      voiceAiOrdering: true,
      bkashAutoMatch: true,
      sourceCodeAccess: true
    },
    featuresBn: [
      '১০০% আপনার নিজস্ব ডোমেইন (যেমন: yourhotel.com)',
      'রেস্তোরাঁর নিজস্ব ব্র্যান্ড কালার, লোগো ও থিম কাস্টমাইজেশন',
      'মাল্টি-ব্রাঞ্চ মাস্টার অ্যাডমিন কন্ট্রোল ও স্টক সিঙ্ক',
      'অ্যান্ড্রয়েড প্লে-স্টোর রেডি APK ও PWA ইনস্টলার',
      'সম্পূর্ণ প্রাইভেট ফায়ারবেস/পোস্টগ্রেস্কিউএল ডাটাবেস',
      'ডেডিকেটেড ক্লাউড ভিপিএস ও প্রায়োরিটি ভিআইপি সাপোর্ট',
      'প্রয়োজনে ফুল সোর্স কোড ও লাইফটাইম লাইসেন্স এগ্রিমেন্ট',
      'ব্যবসায়িক চুক্তিপত্র ও ফ্রি অনবোর্ডিং ট্রেইনিং'
    ],
    featuresEn: [
      '100% Custom Domain Setup (yourrestaurant.com)',
      'Full Brand Customization (Logo, Colors, Theme)',
      'Multi-Branch Master Inventory & Admin Control',
      'Play Store Ready APK & Instant Mobile Install',
      'Private Dedicated Firebase / PostgreSQL DB',
      'High-performance Cloud VPS with VIP SLA Support',
      'Full Source Code & Lifetime License Agreement',
      'Signed Legal Agreement & Free Staff Training'
    ]
  }
];

export const INITIAL_SAAS_TENANTS: SaaSTenant[] = [
  {
    id: 'tenant-101',
    restaurantName: 'হোটেল আল শেখ ফরিদ (মূল ফ্ল্যাগশিপ)',
    ownerName: 'মোহাম্মদ আব্দুল বারিক শেখ',
    phone: '01761869921',
    email: 'fs2217732@gmail.com',
    location: 'ঈশ্বরদী জংশন স্টেশন রোড, ঈশ্বরদী, পাবনা',
    planId: 'enterprise',
    status: 'active',
    billingCycle: 'lifetime',
    licenseKey: 'ALSK-ENT-2026-7732',
    domainUrl: 'https://hotelalsheikhfarid.com',
    totalOrdersProcessed: 1420,
    startDate: '2026-01-01',
    expiryDate: '2036-01-01',
    brandColor: '#d97706',
    customLogoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'tenant-102',
    restaurantName: 'আল মদিনা বিরিয়ানি হাউজ',
    ownerName: 'হাজী রফিকুল ইসলাম',
    phone: '01819345678',
    email: 'almadina.biryani@gmail.com',
    location: 'জিরো পয়েন্ট, রাজশাহী',
    planId: 'pro',
    status: 'active',
    billingCycle: 'yearly',
    licenseKey: 'ALSK-PRO-2026-8891',
    domainUrl: 'https://almadinabiryani.ordernow.live',
    totalOrdersProcessed: 680,
    startDate: '2026-03-15',
    expiryDate: '2027-03-15',
    brandColor: '#059669'
  },
  {
    id: 'tenant-103',
    restaurantName: 'ধানসিঁড়ি প্রিমিয়াম কিচেন',
    ownerName: 'কাজী মাহমুদুল হাসান',
    phone: '01912987654',
    email: 'dhansiri.kitchen@yahoo.com',
    location: 'মিরপুর-১০, ঢাকা',
    planId: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    licenseKey: 'ALSK-PRO-2026-4412',
    domainUrl: 'https://dhansiri.foodsuite.com',
    totalOrdersProcessed: 320,
    startDate: '2026-07-01',
    expiryDate: '2026-09-01',
    brandColor: '#dc2626'
  },
  {
    id: 'tenant-104',
    restaurantName: 'পদ্মা রিভার ক্যাফে ও সুইটস',
    ownerName: 'শেখ তানভীর আহমেদ',
    phone: '01711654321',
    email: 'padmacafe.pabna@gmail.com',
    location: 'পাকশী হার্ডিঞ্জ ব্রিজ পয়েন্ট, ঈশ্বরদী',
    planId: 'starter',
    status: 'trial',
    billingCycle: 'monthly',
    licenseKey: 'ALSK-STR-2026-1190',
    domainUrl: 'https://padmacafe.ordernow.live',
    totalOrdersProcessed: 95,
    startDate: '2026-08-10',
    expiryDate: '2026-09-10',
    brandColor: '#2563eb'
  }
];

export const SAAS_CONTACT_INFO = {
  salesPhone: '01761869921',
  salesWhatsApp: '+8801761869921',
  salesEmail: 'fs2217732@gmail.com',
  bkashMerchantNumber: '01761869921',
  nagadNumber: '01761869921',
  rocketNumber: '01761869921',
  bankDetails: 'Islami Bank Bangladesh Ltd, Ishwardi Branch, A/C: 2050123456789',
  contactPerson: 'মোহাম্মদ আব্দুল বারিক শেখ (প্রোপাইটার ও সফটওয়্যার কনসালটেন্ট)'
};
