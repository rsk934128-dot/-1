import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Crown, 
  Building, 
  Calendar, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  MessageCircle,
  HelpCircle,
  Zap,
  Globe,
  DollarSign
} from 'lucide-react';
import { SAAS_PLANS, SaaSSubscriptionPlan, SAAS_CONTACT_INFO, SaaSOrderRequest } from '../data/saasPlans';
import { openDirectCustomWhatsApp } from '../utils/whatsappHelper';

interface StripeBillingMockupProps {
  selectedPlan: SaaSSubscriptionPlan;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  onBillingCycleChange: (cycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime') => void;
  onPlanChange: (planId: 'starter' | 'pro' | 'enterprise') => void;
  initialRestaurantName?: string;
  initialOwnerName?: string;
  initialPhone?: string;
  initialEmail?: string;
  onPaymentSuccess?: (orderRequest: SaaSOrderRequest) => void;
  lang?: 'bn' | 'en';
}

export const StripeBillingMockup: React.FC<StripeBillingMockupProps> = ({
  selectedPlan,
  billingCycle,
  onBillingCycleChange,
  onPlanChange,
  initialRestaurantName = '',
  initialOwnerName = '',
  initialPhone = '',
  initialEmail = '',
  onPaymentSuccess,
  lang = 'bn'
}) => {
  // Form State
  const [restaurantName, setRestaurantName] = useState(initialRestaurantName || 'কাচ্চি ডাইন এক্সপ্রেস');
  const [ownerName, setOwnerName] = useState(initialOwnerName || 'মোহাম্মদ করিম উল্লাহ');
  const [phone, setPhone] = useState(initialPhone || '01712000000');
  const [email, setEmail] = useState(initialEmail || 'kacchi.express@gmail.com');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState(initialOwnerName || 'MOHAMMAD KARIM ULLAH');
  const [billingCountry, setBillingCountry] = useState('BD');
  const [postalCode, setPostalCode] = useState('6620');
  const [saveCard, setSaveCard] = useState(true);

  // Payment Flow State
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | '3ds_challenge' | 'success' | 'failed'>('idle');
  const [processingStep, setProcessingStep] = useState<string>('');
  const [otpCode, setOtpCode] = useState('847291');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<SaaSOrderRequest | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Price calculations
  const planPrice = billingCycle === 'yearly' 
    ? selectedPlan.priceYearlyBDT 
    : billingCycle === 'quarterly' 
      ? selectedPlan.priceQuarterlyBDT 
      : billingCycle === 'lifetime' 
        ? (selectedPlan.priceLifetimeBDT || 69990) 
        : selectedPlan.priceMonthlyBDT;

  const usdEquivalent = (planPrice / 122).toFixed(2);

  // Card brand detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'text-blue-600', icon: '💳 Visa' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'text-orange-600', icon: '💳 Mastercard' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: 'text-emerald-600', icon: '💳 Amex' };
    if (/^6(?:011|5)/.test(clean)) return { name: 'Discover', color: 'text-amber-600', icon: '💳 Discover' };
    return { name: 'Card', color: 'text-stone-600', icon: '💳 Card' };
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Preset Test Cards
  const applyTestCard = (type: 'success' | '3ds' | 'decline') => {
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvc('888');
      setErrorMessage('');
    } else if (type === '3ds') {
      setCardNumber('4000 0000 0000 0002');
      setCardExpiry('08/29');
      setCardCvc('314');
      setErrorMessage('');
    } else if (type === 'decline') {
      setCardNumber('4000 0000 0000 0069');
      setCardExpiry('05/27');
      setCardCvc('999');
      setErrorMessage('');
    }
  };

  const handlePayWithStripe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !ownerName || !cardNumber) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে রেস্তোরাঁ ও কার্ডের তথ্য পূরণ করুন' : 'Please fill all required card details');
      return;
    }

    setErrorMessage('');
    setPaymentStatus('processing');
    setProcessingStep(lang === 'bn' ? 'স্ট্রাইপ সুরক্ষিত চ্যানেলে কার্ড ভেরিফাই হচ্ছে...' : 'Verifying card with Stripe Secure Channel...');

    setTimeout(() => {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      
      if (cleanNum === '4000000000000069') {
        // Declined
        setPaymentStatus('failed');
        setErrorMessage(lang === 'bn' ? 'পেমেন্ট প্রত্যাখ্যান হয়েছে: অপর্যাপ্ত ফান্ড অথবা কার্ড ব্লক। অনুগ্রহ করে সঠিক কার্ড ব্যবহার করুন।' : 'Card declined: Insufficient funds or card blocked. Please try another card.');
        return;
      }

      if (cleanNum === '4000000000000002') {
        // 3D Secure challenge
        setProcessingStep(lang === 'bn' ? 'ব্যাংক 3D সিকিউর ওয়ান-টাইম পাসওয়ার্ড (OTP) অথেন্টিকেশন প্রয়োজন...' : 'Bank 3D Secure OTP verification required...');
        setPaymentStatus('3ds_challenge');
        return;
      }

      // Normal Success
      completePaymentSuccess();
    }, 1400);
  };

  const handleComplete3DSChallenge = () => {
    setPaymentStatus('processing');
    setProcessingStep(lang === 'bn' ? 'ব্যাংক ওটিপি কনফার্মেশন যাচাই করা হচ্ছে...' : 'Authorizing Bank OTP & issuing license...');
    setTimeout(() => {
      completePaymentSuccess();
    }, 1200);
  };

  const completePaymentSuccess = () => {
    const randomTx = `pi_3N${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomLicense = `ALSK-${selectedPlan.id.toUpperCase().slice(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderReq: SaaSOrderRequest = {
      id: `SAAS-STRIPE-${Date.now().toString().slice(-6)}`,
      restaurantName,
      ownerName,
      phone,
      email,
      district: 'বাংলাদেশ',
      planId: selectedPlan.id,
      billingCycle,
      priceBDT: planPrice,
      paymentMethod: 'stripe',
      transactionId: randomTx,
      desiredDomain: `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.foodsuite.live`,
      requestedAt: new Date().toISOString(),
      status: 'verified',
      stripeReceipt: {
        cardBrand: cardBrand.name,
        cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
        paymentIntentId: randomTx,
        chargeId: `ch_${Date.now()}`,
        paidAt: new Date().toLocaleDateString('bn-BD')
      }
    };

    setCreatedOrder(orderReq);
    setPaymentStatus('success');

    // Save to local storage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('hotel_saas_lead_orders') || '[]');
      localStorage.setItem('hotel_saas_lead_orders', JSON.stringify([orderReq, ...existing]));
    } catch (e) {
      console.error(e);
    }

    if (onPaymentSuccess) {
      onPaymentSuccess(orderReq);
    }
  };

  const nextBillingDate = () => {
    const d = new Date();
    if (billingCycle === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (billingCycle === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (billingCycle === 'lifetime') d.setFullYear(d.getFullYear() + 10);
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-fade-in">
      {/* Stripe Branded Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Stripe Secure Cloud Billing
            </span>
            <span className="text-[11px] text-stone-400">
              256-bit End-to-End SSL Encrypted
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-white mt-1">
            {lang === 'bn' ? 'স্ট্রাইপ অনলাইন পেমেন্ট ও সাবস্ক্রিপশন গেটওয়ে' : 'Stripe Online Billing & Subscription Checkout'}
          </h3>
          <p className="text-xs text-stone-300 mt-0.5">
            {lang === 'bn' ? 'ভিসা, মাস্টারকার্ড, অ্যামেক্স এবং অ্যাপল পে দিয়ে তাৎক্ষণিক লাইসেন্স সক্রিয় করুন।' : 'Instant automated license activation via Visa, Mastercard, Amex & Apple Pay.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold text-stone-200">Stripe Live Sandbox</span>
        </div>
      </div>

      {paymentStatus === 'success' && createdOrder ? (
        /* Stripe Payment Success & Invoice Receipt */
        <div className="p-6 sm:p-8 space-y-6 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
              সাবস্ক্রিপশন পেমেন্ট সফল হয়েছে
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
              অভিনন্দন, {createdOrder.restaurantName}!
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              আপনার <span className="font-bold text-indigo-700">{selectedPlan.nameBn}</span> সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে। নিচে আপনার স্ট্রাইপ ডিজিটাল ইনভয়েস ও লাইসেন্স কি দেওয়া হলো:
            </p>
          </div>

          {/* Stripe Digital Receipt Card */}
          <div className="bg-slate-900 text-stone-200 p-6 rounded-3xl border border-slate-800 max-w-xl mx-auto text-left space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-black text-xs flex items-center justify-center">S</div>
                <span className="font-bold text-white text-sm">Stripe Official Receipt</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase">
                PAID & ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">রেস্তোরাঁর নাম:</span>
                <span className="font-bold text-white">{createdOrder.restaurantName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">মালিকের নাম:</span>
                <span className="font-bold text-white">{createdOrder.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">বিলিং সাইকেল:</span>
                <span className="font-bold text-amber-400 uppercase">{createdOrder.billingCycle}</span>
              </div>
              <div>
                <span className="text-slate-500 block">পরিশোধিত মূল্য:</span>
                <span className="font-bold text-emerald-400 text-sm">৳{createdOrder.priceBDT.toLocaleString()} (~${usdEquivalent})</span>
              </div>
              <div>
                <span className="text-slate-500 block">পেমেন্ট মেথড:</span>
                <span className="font-bold text-white">{createdOrder.stripeReceipt?.cardBrand} •••• {createdOrder.stripeReceipt?.cardLast4}</span>
              </div>
              <div>
                <span className="text-slate-500 block">পরবর্তী রিনিউয়াল তারিখ:</span>
                <span className="font-bold text-slate-300">{nextBillingDate()}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-500 block">Stripe PaymentIntent ID:</span>
                <span className="font-bold text-indigo-400 select-all">{createdOrder.transactionId}</span>
              </div>
            </div>

            {/* Issued License Key Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-indigo-300 font-bold uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Official Restaurant License Key
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdOrder.id);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
              <div className="text-sm font-black text-amber-400 font-mono tracking-wider">
                {createdOrder.id}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const msg = `আসসালামু আলাইকুম। আমি স্ট্রাইপ গেটওয়ের মাধ্যমে আমার রেস্তোরাঁ ${createdOrder.restaurantName} এর জন্য ${selectedPlan.nameBn} (${createdOrder.billingCycle}) প্ল্যান সাবস্ক্রাইব করেছি।\n\nবুকিং আইডি: ${createdOrder.id}\nপরিশোধ: ৳${createdOrder.priceBDT.toLocaleString()}\nTrx: ${createdOrder.transactionId}\n\nদয়া করে অনবোর্ডিং ও ডোমেইন কনফিগারেশন সম্পন্ন করুন।`;
                openDirectCustomWhatsApp(SAAS_CONTACT_INFO.salesWhatsApp, msg);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে ভিআইপি অনবোর্ডিং শুরু করুন</span>
            </button>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>ইনভয়েস প্রিন্ট / PDF সংরক্ষণ</span>
            </button>

            <button
              onClick={() => {
                setPaymentStatus('idle');
              }}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs"
            >
              নতুন বিলিং তৈরি করুন
            </button>
          </div>
        </div>
      ) : (
        /* Stripe Checkout Form */
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Plan & Billing Interval Selector (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Billing Interval Selector */}
            <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  {lang === 'bn' ? 'বিলিং সাইকেল নির্বাচন:' : 'Billing Term:'}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">অটো-রিনিউয়াল কন্ট্রোল</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-stone-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => onBillingCycleChange('monthly')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <div>{lang === 'bn' ? 'মাসিক' : 'Monthly'}</div>
                  <div className="text-[9px] font-normal text-stone-500">প্রতি মাসে</div>
                </button>

                <button
                  type="button"
                  onClick={() => onBillingCycleChange('quarterly')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center relative ${
                    billingCycle === 'quarterly'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="absolute -top-2 right-0 px-1 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[8px] font-black">
                    ১০% ছাড়
                  </span>
                  <div>{lang === 'bn' ? 'ত্রৈমাসিক' : 'Quarterly'}</div>
                  <div className={`text-[9px] font-normal ${billingCycle === 'quarterly' ? 'text-indigo-200' : 'text-stone-500'}`}>৩ মাস</div>
                </button>

                <button
                  type="button"
                  onClick={() => onBillingCycleChange('yearly')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center relative ${
                    billingCycle === 'yearly'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="absolute -top-2 right-0 px-1 py-0.2 rounded-full bg-emerald-400 text-stone-950 text-[8px] font-black animate-pulse">
                    ২০% ছাড়
                  </span>
                  <div>{lang === 'bn' ? 'বাৎসরিক' : 'Yearly'}</div>
                  <div className={`text-[9px] font-normal ${billingCycle === 'yearly' ? 'text-amber-200' : 'text-stone-500'}`}>১২ মাস</div>
                </button>
              </div>
            </div>

            {/* Plan Switcher Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                {lang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজ পরিবর্তন:' : 'Switch Subscription Tier:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAAS_PLANS.map((plan) => {
                  const isCur = plan.id === selectedPlan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => onPlanChange(plan.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isCur
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="text-[11px] font-black text-stone-900 truncate">
                        {plan.id === 'starter' ? 'Starter' : plan.id === 'pro' ? 'Pro Suite' : 'Enterprise'}
                      </div>
                      <div className="text-[10px] text-stone-500 font-bold mt-0.5">
                        {billingCycle === 'yearly' 
                          ? `৳${plan.priceYearlyBDT.toLocaleString()}/yr` 
                          : billingCycle === 'quarterly'
                            ? `৳${plan.priceQuarterlyBDT.toLocaleString()}/qtr`
                            : `৳${plan.priceMonthlyBDT.toLocaleString()}/mo`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Plan Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white space-y-3.5 border border-indigo-800/60 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
                    {selectedPlan.badgeBn}
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{selectedPlan.nameBn}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">
                    ৳{planPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    ≈ ${usdEquivalent} USD
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-indigo-800/40 text-stone-300">
                <div>
                  <span className="text-stone-400 block">বিলিং সময়কাল:</span>
                  <span className="font-bold text-white capitalize">
                    {billingCycle === 'yearly' ? 'বাৎসরিক (১২ মাস)' : billingCycle === 'quarterly' ? 'ত্রৈমাসিক (৩ মাস)' : 'মাসিক (১ মাস)'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">মাসিক গড় খরচ:</span>
                  <span className="font-bold text-emerald-400">
                    ৳{billingCycle === 'yearly' ? Math.round(planPrice / 12).toLocaleString() : billingCycle === 'quarterly' ? Math.round(planPrice / 3).toLocaleString() : planPrice.toLocaleString()}/মাস
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">পরবর্তী রিনিউ:</span>
                  <span className="font-bold text-stone-200">{nextBillingDate()}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">প্লাটফর্ম কমিশন:</span>
                  <span className="font-bold text-amber-400">০% (শতভাগ নিজস্ব)</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-indigo-800/40 text-xs">
                {selectedPlan.featuresBn.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Test Cards Picker Bar */}
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="text-[11px] font-black text-amber-900 flex items-center justify-between">
                <span>⚡ স্ট্রাইপ টেস্ট কার্ড প্রেসেন্ট (1-Click Test):</span>
                <span className="text-[10px] text-amber-700">ক্লিক করে পূরণ করুন</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTestCard('success')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all"
                >
                  🟢 সাকসেস কার্ড
                </button>
                <button
                  type="button"
                  onClick={() => applyTestCard('3ds')}
                  className="px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all"
                >
                  🟡 3D Secure OTP
                </button>
                <button
                  type="button"
                  onClick={() => applyTestCard('decline')}
                  className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all"
                >
                  🔴 ডিক্লাইন টেস্ট
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Stripe Elements Card & Customer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Express Checkout Mockup */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                এক্সপ্রেস ওয়ান-ট্যাপ চেকআউট:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleComplete3DSChallenge}
                  className="py-2.5 px-4 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
                >
                  <span> Pay</span>
                  <span className="text-[10px] font-normal text-stone-400">• Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={handleComplete3DSChallenge}
                  className="py-2.5 px-4 rounded-xl bg-white border border-stone-300 text-stone-800 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-blue-600 font-black">G</span>
                  <span>Pay</span>
                  <span className="text-[10px] font-normal text-stone-500">• Google Pay</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-stone-400 text-[11px] font-medium uppercase">অথবা কার্ড দিয়ে বিলিং করুন</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>
            </div>

            {/* Main Stripe Card Form */}
            <form onSubmit={handlePayWithStripe} className="space-y-4">
              
              {/* Hotel & Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">রেস্তোরাঁ / হোটেলের নাম *</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="হোটেলের নাম লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">মালিকের নাম / Contact *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      setCardholderName(e.target.value.toUpperCase());
                    }}
                    placeholder="আপনার নাম"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">ইমেইল (স্ট্রাইপ ইনভয়েস)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Stripe Elements Mock Card Box */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>কার্ডের বিবরণী (Stripe Elements)</span>
                  </label>
                  <span className={`text-xs font-black ${cardBrand.color}`}>
                    {cardBrand.icon}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-300 space-y-3 shadow-inner">
                  {/* Card Number Input */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-wider"
                    />
                    <div className="absolute right-3 top-3 text-stone-400">
                      <Lock className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  {/* Expiry & CVC Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="CVC / CVV"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-stone-400 font-mono">3 digits</span>
                    </div>
                  </div>

                  {/* Cardholder Name & ZIP */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        placeholder="CARDHOLDER NAME"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-[11px] font-mono font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="ZIP / Postal Code"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-[11px] font-mono text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Card Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveCardCheck"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-stone-300 cursor-pointer"
                />
                <label htmlFor="saveCardCheck" className="text-xs text-stone-600 cursor-pointer">
                  পরবর্তী বিলিং সাইকেলে নিরবচ্ছিন্ন সার্ভিসের জন্য কার্ড সংরক্ষণ করুন
                </label>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={paymentStatus === 'processing'}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{processingStep || 'পেমেন্ট প্রসেসিং হচ্ছে...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      ৳{planPrice.toLocaleString()} পরিশোধ করুন ({billingCycle === 'yearly' ? 'বাৎসরিক' : billingCycle === 'quarterly' ? 'ত্রৈমাসিক' : 'মাসিক'})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PCI-DSS Level 1 Compliant
                </span>
                <span>•</span>
                <span>যেকোনো সময় বাতিলযোগ্য</span>
                <span>•</span>
                <span>মানি-ব্যাক গ্যারান্টি</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D Secure / OTP Simulation Modal */}
      {paymentStatus === '3ds_challenge' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-300 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-blue-700 text-white text-xs font-black font-sans">
                  VISA Secure
                </div>
                <span className="text-xs font-bold text-stone-700">Bank OTP Verification</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">3D-Secure 2.0</span>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                আপনার মোবাইল নম্বরে একটি ৬-সংখ্যার যাচাইকরণ কোড পাঠানো হয়েছে। লেনদেন সম্পন্ন করতে নিচে ওটিপি দিন:
              </p>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">মার্চেন্ট:</span>
                  <span className="font-bold text-stone-900">Hotel Al Sheikh Farid SaaS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">মূল্য:</span>
                  <span className="font-bold text-indigo-700">৳{planPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">কার্ড নম্বর:</span>
                  <span className="font-bold text-stone-800">•••• •••• •••• 0002</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">OTP কোড লিখুন:</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono font-black text-center text-lg tracking-widest text-stone-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('idle')}
                className="flex-1 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleComplete3DSChallenge}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>কনফার্ম ও সাবমিট</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
