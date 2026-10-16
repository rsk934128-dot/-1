import React, { useState, useMemo } from 'react';
import { safeStorage } from '../utils/safeStorage';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Laptop, 
  Smartphone, 
  MessageCircle, 
  Phone, 
  Mail, 
  ArrowRight, 
  Store, 
  Layers, 
  Copy, 
  Check, 
  Palette, 
  Globe, 
  Award, 
  FileText, 
  Zap, 
  Calculator,
  ChevronRight,
  Send,
  Building,
  Users,
  Radio,
  Clock,
  Printer,
  ShoppingBag,
  CreditCard,
  Lock,
  Receipt
} from 'lucide-react';
import { SAAS_PLANS, SaaSSubscriptionPlan, SAAS_CONTACT_INFO, INITIAL_SAAS_TENANTS, SaaSOrderRequest } from '../data/saasPlans';
import { openDirectCustomWhatsApp } from '../utils/whatsappHelper';
import { StripeBillingMockup } from './StripeBillingMockup';

interface SaaSMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'bn' | 'en';
}

export const SaaSMarketplaceModal: React.FC<SaaSMarketplaceModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn'
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'stripe' | 'calculator' | 'simulator' | 'checkout' | 'clients'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly' | 'lifetime'>('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  // ROI Calculator State
  const [dailyOrders, setDailyOrders] = useState<number>(60);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(350);
  const [aggregatorCommissionPercent, setAggregatorCommissionPercent] = useState<number>(25);

  // Live White-Label Simulator State
  const [simRestaurantName, setSimRestaurantName] = useState<string>('সুলতান’স ডাইন এক্সপ্রেস');
  const [simLocation, setSimLocation] = useState<string>('বনানী, ঢাকা');
  const [simBrandColor, setSimBrandColor] = useState<string>('#d97706'); // Amber

  // Checkout / Booking Form State
  const [checkoutData, setCheckoutData] = useState({
    restaurantName: '',
    ownerName: '',
    phone: '',
    email: '',
    district: 'পাবনা',
    desiredDomain: '',
    paymentMethod: 'bkash' as 'bkash' | 'nagad' | 'rocket' | 'bank',
    transactionId: '',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedOrder, setSubmittedOrder] = useState<SaaSOrderRequest | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Calculate ROI
  const roiCalculations = useMemo(() => {
    const monthlyOrders = dailyOrders * 30;
    const monthlyGrossSales = monthlyOrders * avgOrderValue;
    const monthlyCommissionPaidToAggregators = monthlyGrossSales * (aggregatorCommissionPercent / 100);
    
    // Pro Plan monthly cost
    const selectedPlan = SAAS_PLANS.find(p => p.id === selectedPlanId) || SAAS_PLANS[1];
    const planMonthlyEquivalent = billingCycle === 'yearly' 
      ? Math.round(selectedPlan.priceYearlyBDT / 12)
      : billingCycle === 'quarterly'
        ? Math.round(selectedPlan.priceQuarterlyBDT / 3)
        : billingCycle === 'lifetime'
          ? Math.round((selectedPlan.priceLifetimeBDT || 70000) / 24)
          : selectedPlan.priceMonthlyBDT;

    const monthlyNetSavings = Math.max(0, monthlyCommissionPaidToAggregators - planMonthlyEquivalent);
    const yearlyNetSavings = monthlyNetSavings * 12;

    return {
      monthlyGrossSales,
      monthlyCommissionPaidToAggregators,
      planMonthlyEquivalent,
      monthlyNetSavings,
      yearlyNetSavings,
      savingsMultiplier: monthlyCommissionPaidToAggregators > 0 ? (monthlyCommissionPaidToAggregators / planMonthlyEquivalent).toFixed(1) : '0'
    };
  }, [dailyOrders, avgOrderValue, aggregatorCommissionPercent, selectedPlanId, billingCycle]);

  if (!isOpen) return null;

  const currentPlan = SAAS_PLANS.find(p => p.id === selectedPlanId) || SAAS_PLANS[1];

  const handlePlanSelectAndGoToStripe = (planId: 'starter' | 'pro' | 'enterprise') => {
    setSelectedPlanId(planId);
    setActiveTab('stripe');
  };

  const handlePlanSelectAndGoToCheckout = (planId: 'starter' | 'pro' | 'enterprise') => {
    setSelectedPlanId(planId);
    setActiveTab('checkout');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.restaurantName || !checkoutData.ownerName || !checkoutData.phone) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }

    const priceBDT = billingCycle === 'yearly'
      ? currentPlan.priceYearlyBDT
      : billingCycle === 'quarterly'
        ? currentPlan.priceQuarterlyBDT
        : billingCycle === 'lifetime'
          ? (currentPlan.priceLifetimeBDT || 69990)
          : currentPlan.priceMonthlyBDT;

    const orderRequest: SaaSOrderRequest = {
      id: `SAAS-REQ-${Date.now().toString().slice(-6)}`,
      restaurantName: checkoutData.restaurantName,
      ownerName: checkoutData.ownerName,
      phone: checkoutData.phone,
      email: checkoutData.email,
      district: checkoutData.district,
      planId: selectedPlanId,
      billingCycle: billingCycle,
      priceBDT: priceBDT,
      paymentMethod: checkoutData.paymentMethod,
      transactionId: checkoutData.transactionId || 'PENDING_VERIFICATION',
      desiredDomain: checkoutData.desiredDomain || `${checkoutData.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.foodsuite.app`,
      notes: checkoutData.notes,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    setSubmittedOrder(orderRequest);
    setIsSubmitted(true);

    // Save to safeStorage for persistence
    const existingReqs = safeStorage.getJSON<any[]>('hotel_saas_lead_orders') || [];
    safeStorage.setJSON('hotel_saas_lead_orders', [orderRequest, ...existingReqs]);
  };

  const handleSendToWhatsApp = () => {
    if (!submittedOrder) return;
    const planName = SAAS_PLANS.find(p => p.id === submittedOrder.planId)?.nameBn || submittedOrder.planId;
    const msg = `আসসালামু আলাইকুম। আমি আমার রেস্তোরাঁর জন্য আপনার ফুড অর্ডারিং SaaS সফটওয়্যারটি কিনতে আগ্রহী।
    
📋 বুকিং আইডি: ${submittedOrder.id}
🏨 রেস্তোরাঁর নাম: ${submittedOrder.restaurantName}
👤 মালিকের নাম: ${submittedOrder.ownerName}
📞 মোবাইল: ${submittedOrder.phone}
📍 জেলা/এলাকা: ${submittedOrder.district}
💎 নির্বাচিত প্ল্যান: ${planName} (${submittedOrder.billingCycle === 'yearly' ? 'বাৎসরিক' : submittedOrder.billingCycle === 'lifetime' ? 'লাইফটাইম' : 'মাসিক'})
💰 মোট মূল্য: ৳${submittedOrder.priceBDT.toLocaleString()}
💳 পেমেন্ট মাধ্যম: ${submittedOrder.paymentMethod.toUpperCase()} (TrxID: ${submittedOrder.transactionId})
🌐 ডোমেইন পছন্দ: ${submittedOrder.desiredDomain}

দয়া করে আমার লাইসেন্সটি দ্রুত অ্যাক্টিভেশন ও অনবোর্ডিং ব্যবস্থা করুন। ধন্যবাদ!`;

    openDirectCustomWhatsApp(SAAS_CONTACT_INFO.salesWhatsApp, msg);
  };

  const colorPresets = [
    { name: 'রয়েল আম্বার (খাঁটি ফুড)', color: '#d97706', bg: 'bg-amber-600' },
    { name: 'এমেরাল্ড গ্রিন (প্রাকৃতিক ও হালাল)', color: '#059669', bg: 'bg-emerald-600' },
    { name: 'ক্রিমসন রেড (ফাস্টফুড ও স্পাইসি)', color: '#dc2626', bg: 'bg-red-600' },
    { name: 'রয়েল ব্লু (কর্পোরেট ও ক্যাফে)', color: '#2563eb', bg: 'bg-blue-600' },
    { name: 'লাক্সারি পার্পল (প্রিমিয়াম ডাইন)', color: '#7c3aed', bg: 'bg-purple-600' },
    { name: 'ডিপ ওবসিডিয়ান (নাইট লাউঞ্জ)', color: '#1c1917', bg: 'bg-stone-900' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white text-stone-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 text-white p-6 sm:p-8 relative overflow-hidden shrink-0 border-b border-amber-500/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-10"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/40 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              SaaS & White-Label Restaurant Cloud
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              ০% কমিশন • ১০০% নিজস্ব আয়
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {lang === 'bn' 
              ? 'আপনার রেস্তোরাঁর নামে নিজস্ব অনলাইন ফুড অর্ডারিং SaaS সফটওয়্যার কিনুন' 
              : 'Launch Your Own Branded Food Ordering SaaS Software'}
          </h2>
          <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {lang === 'bn'
              ? 'ফুড ডেলিভারি কোম্পানিকে ২০-৩০% কমিশন দেওয়া বন্ধ করুন। নিজের রেস্তোরাঁর নামে ওয়েবসাইট, কিউআর টেবিল অর্ডার, বাংলা ভয়েস এআই, এবং সরাসরি বিকাশ-নগদ অটো-পেমেন্ট সফটওয়্যারটি আজই নিয়ে নিন।'
              : 'Stop paying hefty 20-30% commissions. Own a complete branded digital ordering system with live kitchen, AI voice assistant, and instant bKash/Nagad verification.'}
          </p>

          {/* Quick Tabs Nav */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 scrollbar-none">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান ও মূল্য' : 'Subscription Plans'}</span>
            </button>

            <button
              onClick={() => setActiveTab('stripe')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer relative ${
                activeTab === 'stripe'
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                  : 'bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-500/30'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'স্ট্রাইপ কার্ড বিলিং গেটওয়ে' : 'Stripe Card Billing'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-stone-950 text-[9px] font-black uppercase">
                Instant
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{lang === 'bn' ? 'লাভ ও সাশ্রয় ক্যালকুলেটর' : 'ROI Calculator'}</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{lang === 'bn' ? 'হোয়াইট-লেবেল প্রিভিউ' : 'Brand Simulator'}</span>
            </button>

            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'checkout'
                  ? 'bg-emerald-500 text-stone-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === 'bn' ? 'বিকাশ/ম্যানুয়াল বুকিং' : 'bKash/MFS Order'}</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সক্রিয় ক্লায়েন্ট' : 'Active Clients'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-50">
          
          {/* TAB 1: PRICING PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-8 animate-fade-in">
              {/* Billing Cycle Switcher */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-stone-600">
                  {lang === 'bn' ? 'সাবস্ক্রিপশন সময়কাল নির্বাচন করুন:' : 'Choose Billing Term:'}
                </span>
                <div className="bg-stone-200 p-1 rounded-2xl flex flex-wrap items-center gap-1 border border-stone-300">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {lang === 'bn' ? 'মাসিক (Monthly)' : 'Monthly'}
                  </button>

                  <button
                    onClick={() => setBillingCycle('quarterly')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 relative ${
                      billingCycle === 'quarterly'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'ত্রৈমাসিক (৩ মাস)' : 'Quarterly (3 Mo)'}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                      ১০% ছাড়
                    </span>
                  </button>

                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'বাৎসরিক (১ বছর)' : 'Yearly (12 Mo)'}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-[10px] font-black animate-pulse">
                      ২০% ছাড়
                    </span>
                  </button>

                  <button
                    onClick={() => setBillingCycle('lifetime')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'lifetime'
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'লাইফটাইম' : 'Lifetime'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAAS_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const price = billingCycle === 'yearly' 
                    ? plan.priceYearlyBDT 
                    : billingCycle === 'quarterly'
                      ? plan.priceQuarterlyBDT
                      : billingCycle === 'lifetime' 
                        ? (plan.priceLifetimeBDT || 69990) 
                        : plan.priceMonthlyBDT;

                  const monthlyEquivalent = billingCycle === 'yearly' 
                    ? Math.round(plan.priceYearlyBDT / 12) 
                    : billingCycle === 'quarterly'
                      ? Math.round(plan.priceQuarterlyBDT / 3)
                      : billingCycle === 'lifetime'
                        ? Math.round((plan.priceLifetimeBDT || 69990) / 24)
                        : plan.priceMonthlyBDT;

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                        plan.popular 
                          ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-400/50 -translate-y-1' 
                          : 'border-stone-200 shadow-md hover:border-stone-300'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          {plan.badgeBn}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-black text-stone-900">{plan.nameBn}</h3>
                          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            {plan.badgeBn}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                          {plan.descriptionBn}
                        </p>

                        <div className="mb-6 pb-6 border-b border-stone-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-stone-950">
                              ৳{price.toLocaleString()}
                            </span>
                            <span className="text-xs text-stone-500 font-semibold">
                              {billingCycle === 'yearly' ? '/বছর' : billingCycle === 'quarterly' ? '/ত্রৈমাসিক (৩ মাস)' : billingCycle === 'lifetime' ? 'এককালীন' : '/মাস'}
                            </span>
                          </div>
                          {billingCycle === 'quarterly' && (
                            <p className="text-[11px] text-indigo-600 font-bold mt-1">
                              (প্রতি মাসে মাত্র ৳{monthlyEquivalent.toLocaleString()} পড়বে)
                            </p>
                          )}
                          {billingCycle === 'yearly' && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">
                              (প্রতি মাসে মাত্র ৳{monthlyEquivalent.toLocaleString()} পড়বে)
                            </p>
                          )}
                          {billingCycle === 'lifetime' && (
                            <p className="text-[11px] text-purple-600 font-bold mt-1">
                              (লাইফটাইম সাপোর্ট ও আজীবন আপডেট অন্তর্ভুক্ত)
                            </p>
                          )}
                        </div>

                        {/* Limits Checklist */}
                        <div className="space-y-3 mb-6">
                          <div className="text-xs font-black text-stone-800 uppercase tracking-wider">
                            প্যাকেজ সক্ষমতা ও লিমিট:
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-2xl border border-stone-200">
                            <div>
                              <span className="text-stone-500 block">মাসিক অর্ডার:</span>
                              <span className="font-bold text-stone-900">{plan.limits.monthlyOrders}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">মেনু আইটেম:</span>
                              <span className="font-bold text-stone-900">{plan.limits.menuItems}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">শাখা (Branches):</span>
                              <span className="font-bold text-stone-900">{plan.limits.branches}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">স্টাফ একাউন্ট:</span>
                              <span className="font-bold text-stone-900">{plan.limits.staffAccounts}</span>
                            </div>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2.5 mb-8">
                          <div className="text-xs font-black text-stone-800 uppercase tracking-wider">
                            অন্তর্ভুক্ত সুবিধাসমূহ:
                          </div>
                          {plan.featuresBn.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handlePlanSelectAndGoToStripe(plan.id)}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span>স্ট্রাইপ / কার্ডে পে করুন (Instant)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handlePlanSelectAndGoToCheckout(plan.id)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                          <span>বিকাশ / নগদ / ব্যাংক ট্রান্সফার</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-200">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div className="text-xs font-black text-stone-900">১০০% মানি-ব্যাক গ্যারান্টি</div>
                  <div className="text-[11px] text-stone-500">৭ দিনের ট্রায়াল ও ফুল রিফান্ড</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1">
                  <Zap className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="text-xs font-black text-stone-900">২৪ ঘণ্টার মধ্যে ডেলিভারি</div>
                  <div className="text-[11px] text-stone-500">তাত্ক্ষণিক সেটআপ ও ব্র্যান্ডিং</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1">
                  <Printer className="w-6 h-6 text-blue-600 mx-auto" />
                  <div className="text-xs font-black text-stone-900">POS প্রিন্টার কম্প্যাটিবল</div>
                  <div className="text-[11px] text-stone-500">৫৮ মিমি ও ৮০ মিমি থার্মাল সাপোর্ট</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1">
                  <Phone className="w-6 h-6 text-purple-600 mx-auto" />
                  <div className="text-xs font-black text-stone-900">২৪/৭ ভিআইপি সাপোর্ট</div>
                  <div className="text-[11px] text-stone-500">সরাসরি ফোন ও হোয়াটসঅ্যাপ হেল্প</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STRIPE CLOUD BILLING & SUBSCRIPTIONS */}
          {activeTab === 'stripe' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
              <StripeBillingMockup
                selectedPlan={currentPlan}
                billingCycle={billingCycle}
                onBillingCycleChange={(cycle) => setBillingCycle(cycle)}
                onPlanChange={(planId) => setSelectedPlanId(planId)}
                initialRestaurantName={checkoutData.restaurantName || simRestaurantName}
                initialOwnerName={checkoutData.ownerName}
                initialPhone={checkoutData.phone}
                initialEmail={checkoutData.email}
                lang={lang}
              />
            </div>
          )}

          {/* TAB 2: ROI & COMMISSION SAVINGS CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                  মুনাফা সাশ্রয় সিমুলেটর
                </span>
                <h3 className="text-2xl font-black text-stone-900">
                  ফুডপান্ডা/পাঠাও এর চেয়ে নিজের অ্যাপে কত টাকা বেশি লাভ করবেন?
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
                  নিচের স্লাইডারগুলো পরিবর্তন করে দেখুন এই SaaS সফটওয়্যার ব্যবহার করে আপনার রেস্তোরাঁ প্রতি বছর কত লক্ষ টাকা কমিশন সাশ্রয় করবে।
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Inputs */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-6">
                  {/* Daily Orders Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-800">
                      <span>দৈনিক গড় ডেলিভারি ও পার্সেল অর্ডার:</span>
                      <span className="text-amber-600 text-base font-black px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                        {dailyOrders} টি
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      value={dailyOrders}
                      onChange={(e) => setDailyOrders(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                      <span>১০ অর্ডার</span>
                      <span>১৫০ অর্ডার</span>
                      <span>৩০০+ অর্ডার</span>
                    </div>
                  </div>

                  {/* Avg Order Value Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-800">
                      <span>প্রতি অর্ডারের গড় মূল্য (BDT):</span>
                      <span className="text-amber-600 text-base font-black px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                        ৳{avgOrderValue}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="25"
                      value={avgOrderValue}
                      onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                      <span>৳১০০</span>
                      <span>৳৭৫০</span>
                      <span>৳১,৫০০</span>
                    </div>
                  </div>

                  {/* Aggregator Commission % Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-800">
                      <span>ফুডপান্ডা/পাঠাও এর কমিশন রেট (%):</span>
                      <span className="text-red-600 text-base font-black px-2 py-0.5 bg-red-50 rounded-lg border border-red-200">
                        {aggregatorCommissionPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="35"
                      step="1"
                      value={aggregatorCommissionPercent}
                      onChange={(e) => setAggregatorCommissionPercent(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl text-xs text-stone-600 border border-stone-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আমাদের SaaS ব্যবহারে কোনো পার-অর্ডার কমিশন নেই (০% কমিশন)।</span>
                  </div>
                </div>

                {/* Live Output Card */}
                <div className="lg:col-span-6 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-500/30 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      বার্ষিক সাশ্রয় ও নিট লাভ
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
                      {roiCalculations.savingsMultiplier}x গুণ সাশ্রয়ী
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-stone-400">প্রতি মাসে ফুডপান্ডায় চলে যায়:</div>
                      <div className="text-xl sm:text-2xl font-bold text-red-400 line-through">
                        -৳{Math.round(roiCalculations.monthlyCommissionPaidToAggregators).toLocaleString()} /মাস
                      </div>
                    </div>

                    <div className="p-4 bg-white/10 rounded-2xl border border-amber-400/30 backdrop-blur-xs">
                      <div className="text-xs text-amber-200 font-bold mb-1">
                        আমাদের SaaS সফটওয়্যারে আপনার নিট মাসিক সাশ্রয়:
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-amber-300">
                        +৳{Math.round(roiCalculations.monthlyNetSavings).toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-300 mt-1 font-semibold">
                        প্রতি মাসে অতিরিক্ত মুনাফা পকেটে থাকবে!
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs text-stone-300">বছরে সর্বমোট অতিরিক্ত সাশ্রয়:</span>
                      <span className="text-xl font-black text-emerald-400">
                        ৳{Math.round(roiCalculations.yearlyNetSavings).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanSelectAndGoToCheckout('pro')}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>এই লাভটি লক করতে প্র্রো প্যাকেজ বুক করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WHITE-LABEL SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase">
                  লাইভ প্রিভিউ সিমুলেটর
                </span>
                <h3 className="text-2xl font-black text-stone-900">
                  আপনার হোটেলের নামে অ্যাপটি কেমন দেখাবে এখনই যাচাই করুন
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
                  নিচে আপনার রেস্তোরাঁর নাম ও পছন্দের ব্র্যান্ড কালার নির্বাচন করে লাইভ ইন্টারঅ্যাক্টিভ প্রিভিউ দেখুন।
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Simulator Controls */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      আপনার রেস্তোরাঁ / ক্যাফের নাম:
                    </label>
                    <input
                      type="text"
                      value={simRestaurantName}
                      onChange={(e) => setSimRestaurantName(e.target.value)}
                      placeholder="যেমন: কাচ্চি ভাই এক্সপ্রেস"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      অবস্থান / জেলা:
                    </label>
                    <input
                      type="text"
                      value={simLocation}
                      onChange={(e) => setSimLocation(e.target.value)}
                      placeholder="যেমন: বনানী, ঢাকা"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Brand Color Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700">
                      ব্র্যান্ড কালার থিম:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => setSimBrandColor(preset.color)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-left transition-all border ${
                            simBrandColor === preset.color
                              ? 'border-stone-900 bg-stone-100 shadow-xs'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full shrink-0 ${preset.bg}`}></span>
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>কাস্টম ডোমেইন: <strong>{simRestaurantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myrestaurant'}.com</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>হোম স্ক্রিন অ্যাপ ইনস্টলার (PWA + APK)</span>
                    </div>
                  </div>
                </div>

                {/* Live Mock Screen Device */}
                <div className="lg:col-span-7 bg-stone-900 p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-stone-800">
                  <div className="text-center text-[11px] text-stone-400 font-mono mb-3 flex items-center justify-between px-2">
                    <span>LIVE SIMULATED PREVIEW</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      0% Commission Engine
                    </span>
                  </div>

                  {/* Simulated App Screen */}
                  <div className="bg-stone-100 rounded-2xl overflow-hidden shadow-inner text-stone-900 border border-stone-300">
                    {/* Simulated Header */}
                    <div 
                      className="p-4 text-white transition-colors duration-300 flex items-center justify-between"
                      style={{ backgroundColor: simBrandColor }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-base shadow-sm">
                          {simRestaurantName.charAt(0) || 'R'}
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base leading-tight">
                            {simRestaurantName || 'আপনার রেস্তোরাঁ'}
                          </div>
                          <div className="text-[10px] text-white/80 flex items-center gap-1">
                            <span>📍 {simLocation || 'বাংলাদেশ'}</span>
                            <span>• ⭐ ৪.৯ (১২০+ রিভিউ)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                          🛒 ০ আইটেম
                        </span>
                      </div>
                    </div>

                    {/* Simulated Hero Banner */}
                    <div className="p-4 bg-stone-900 text-white text-center space-y-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                        আজকের স্পেশাল অফার
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        গরম গরম স্পেশাল বিরিয়ানি ও কষা মাংস
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        সরাসরি অর্ডার করুন এবং বিকাশ/নগদে ক্যাশব্যাক উপভোগ করুন
                      </p>
                      <button 
                        className="px-4 py-1.5 rounded-xl text-xs font-black text-white shadow-sm transition-all"
                        style={{ backgroundColor: simBrandColor }}
                      >
                        মেনু দেখুন ও অর্ডার করুন
                      </button>
                    </div>

                    {/* Simulated Food Items Row */}
                    <div className="p-4 grid grid-cols-2 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs space-y-1.5">
                        <div className="h-20 bg-stone-200 rounded-lg overflow-hidden relative">
                          <img 
                            src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80" 
                            alt="Biryani" 
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                            হট সেলার
                          </span>
                        </div>
                        <div className="font-bold text-xs text-stone-900">স্পেশাল কাচ্চি বিরিয়ানি</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-amber-700">৳৩২০</span>
                          <button 
                            className="px-2 py-1 rounded-md text-[10px] font-bold text-white"
                            style={{ backgroundColor: simBrandColor }}
                          >
                            + যোগ করুন
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs space-y-1.5">
                        <div className="h-20 bg-stone-200 rounded-lg overflow-hidden relative">
                          <img 
                            src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=300&auto=format&fit=crop&q=80" 
                            alt="Curry" 
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            তাজা রান্না
                          </span>
                        </div>
                        <div className="font-bold text-xs text-stone-900">ইলিশ মাছের কষা ঝোল</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-amber-700">৳২৮০</span>
                          <button 
                            className="px-2 py-1 rounded-md text-[10px] font-bold text-white"
                            style={{ backgroundColor: simBrandColor }}
                          >
                            + যোগ করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-stone-400">এই একই প্রিভিউতে আপনার রেস্তোরাঁ চলবে!</span>
                    <button
                      onClick={() => {
                        setCheckoutData(prev => ({
                          ...prev,
                          restaurantName: simRestaurantName,
                          district: simLocation
                        }));
                        setActiveTab('checkout');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>এই সেটআপে সফটওয়্যার কিনুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKOUT & INSTANT BOOKING */}
          {activeTab === 'checkout' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              {!isSubmitted ? (
                <form onSubmit={handleCheckoutSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                      অফিশিয়াল লাইসেন্স বুকিং
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      রেস্তোরাঁর তথ্য ও পেমেন্ট বিবরণী
                    </h3>
                    <p className="text-xs text-stone-500">
                      নিচের ফর্মটি পূরণ করে সাবমিট করুন। ২৪ ঘণ্টার মধ্যে আপনার কাস্টম ব্র্যান্ডেড সিস্টেম লাইভ হয়ে যাবে।
                    </p>
                  </div>

                  {/* Plan Summary Bar */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-amber-800 font-bold">নির্বাচিত প্ল্যান:</div>
                      <div className="text-base font-black text-stone-900">{currentPlan.nameBn}</div>
                      <div className="text-[11px] text-amber-700">
                        বিলিং: {billingCycle === 'yearly' ? 'বাৎসরিক (২০% ছাড়)' : billingCycle === 'quarterly' ? 'ত্রৈমাসিক (১০% ছাড় - ৩ মাস)' : billingCycle === 'lifetime' ? 'এককালীন লাইফটাইম' : 'মাসিক'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500">পরিশোধযোগ্য মূল্য:</div>
                      <div className="text-2xl font-black text-amber-700">
                        ৳{(billingCycle === 'yearly' ? currentPlan.priceYearlyBDT : billingCycle === 'quarterly' ? currentPlan.priceQuarterlyBDT : billingCycle === 'lifetime' ? (currentPlan.priceLifetimeBDT || 69990) : currentPlan.priceMonthlyBDT).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Switch to Stripe banner */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div className="text-xs text-indigo-950 font-bold">
                        ভিসা বা মাস্টারকার্ড দিয়ে অটোমেটিক পেমেন্ট করতে চান?
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stripe')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      স্ট্রাইপ গেটওয়ে খুলুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        রেস্তোরাঁ / হোটেলের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.restaurantName}
                        onChange={(e) => setCheckoutData({ ...checkoutData, restaurantName: e.target.value })}
                        placeholder="যেমন: হাজী বিরিয়ানি"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        মালিক / ম্যানেজারের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.ownerName}
                        onChange={(e) => setCheckoutData({ ...checkoutData, ownerName: e.target.value })}
                        placeholder="আপনার নাম"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        মোবাইল নম্বর (বিকাশ/হোয়াটসঅ্যাপ) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        ইমেইল এড্রেস (ইনভয়েসের জন্য)
                      </label>
                      <input
                        type="email"
                        value={checkoutData.email}
                        onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                        placeholder="restaurant@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        জেলা ও রেস্তোরাঁর অবস্থান
                      </label>
                      <input
                        type="text"
                        value={checkoutData.district}
                        onChange={(e) => setCheckoutData({ ...checkoutData, district: e.target.value })}
                        placeholder="যেমন: ঈশ্বরদী, পাবনা"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        পছন্দের ডোমেইন নাম
                      </label>
                      <input
                        type="text"
                        value={checkoutData.desiredDomain}
                        onChange={(e) => setCheckoutData({ ...checkoutData, desiredDomain: e.target.value })}
                        placeholder="যেমন: myrestaurant.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-stone-800">
                      পেমেন্ট মাধ্যম নির্বাচন করুন:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'bkash' })}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          checkoutData.paymentMethod === 'bkash'
                            ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-xs ring-1 ring-pink-400'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="font-black text-sm">bKash</span>
                        <span className="text-[10px]">মার্চেন্ট/পার্সোনাল</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'nagad' })}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          checkoutData.paymentMethod === 'nagad'
                            ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs ring-1 ring-orange-400'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="font-black text-sm">Nagad</span>
                        <span className="text-[10px]">নগদ অ্যাকাউন্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'rocket' })}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          checkoutData.paymentMethod === 'rocket'
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-400'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="font-black text-sm">Rocket</span>
                        <span className="text-[10px]">রকেট পেমেন্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'bank' })}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          checkoutData.paymentMethod === 'bank'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs ring-1 ring-emerald-400'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="font-black text-sm">Bank Wire</span>
                        <span className="text-[10px]">ব্যাংক একাউন্ট</span>
                      </button>
                    </div>

                    {/* Payment Instruction box */}
                    <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl text-xs space-y-1.5 border border-stone-800">
                      <div className="text-amber-400 font-bold flex items-center justify-between">
                        <span>পেমেন্ট পাঠানোর অফিশিয়াল নম্বর:</span>
                        <span className="text-white font-mono font-black">{SAAS_CONTACT_INFO.salesPhone}</span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {checkoutData.paymentMethod === 'bkash' && 'বিকাশ Send Money বা Make Payment করে নিচের বক্সে Transaction ID লিখুন।'}
                        {checkoutData.paymentMethod === 'nagad' && 'নগদ Send Money করে Transaction ID নিচে দিন।'}
                        {checkoutData.paymentMethod === 'bank' && 'ব্যাংক ট্রান্সফারের জন্য সরাসরি ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করুন।'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-800">
                        পেমেন্ট ট্রানজেকশন আইডি (TrxID)
                      </label>
                      <input
                        type="text"
                        value={checkoutData.transactionId}
                        onChange={(e) => setCheckoutData({ ...checkoutData, transactionId: e.target.value })}
                        placeholder="যেমন: 9J83KL4M"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>কনফার্ম ও সাবমিট করুন</span>
                  </button>
                </form>
              ) : (
                /* Order Confirmation Screen */
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-300 shadow-2xl space-y-6 text-center animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                      বুকিং সফলভাবে সম্পন্ন হয়েছে
                    </span>
                    <h3 className="text-2xl font-black text-stone-900">
                      অভিনন্দন, {submittedOrder?.restaurantName}!
                    </h3>
                    <p className="text-xs text-stone-600 max-w-md mx-auto">
                      আপনার SaaS লাইসেন্স রিকুয়েস্ট সফলভাবে গৃহিত হয়েছে। আমাদের সেলস ও ইঞ্জিনিয়ারিং টিম অবিলম্বে যোগাযোগ করবে।
                    </p>
                  </div>

                  {/* Order Ticket Details */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-stone-500">বুকিং রেফারেন্স:</span>
                      <span className="font-bold text-stone-900">{submittedOrder?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">নির্বাচিত প্ল্যান:</span>
                      <span className="font-bold text-amber-700">{submittedOrder?.planId.toUpperCase()} PLAN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">পরিশোধযোগ্য মূল্য:</span>
                      <span className="font-bold text-stone-900">৳{submittedOrder?.priceBDT.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">মোবাইল:</span>
                      <span className="font-bold text-stone-900">{submittedOrder?.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleSendToWhatsApp}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>হোয়াটসঅ্যাপে তাৎক্ষণিক লাইসেন্স অ্যাক্টিভেশন মেসেজ পাঠান</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setActiveTab('plans');
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 font-bold underline"
                    >
                      অন্যান্য প্যাকেজগুলো আবার দেখুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVE CLIENTS & TESTIMONIALS */}
          {activeTab === 'clients' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                  আমাদের সফল পার্টনার রেস্তোরাঁ
                </span>
                <h3 className="text-2xl font-black text-stone-900">
                  দেশজুড়ে বিভিন্ন রেস্তোরাঁ এই সফটওয়্যারে চলছে
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
                  প্রতিদিন হাজার হাজার খাবার অর্ডার সম্পন্ন হচ্ছে ০% কমিশনে।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_SAAS_TENANTS.map((tenant) => (
                  <div 
                    key={tenant.id}
                    className="bg-white p-5 rounded-3xl border border-stone-200 shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-stone-900">{tenant.restaurantName}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            {tenant.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <span>📍 {tenant.location}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        {tenant.planId.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <div>
                        <span className="text-stone-500 block">মালিক:</span>
                        <span className="font-bold text-stone-800">{tenant.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">প্রসেসকৃত অর্ডার:</span>
                        <span className="font-bold text-emerald-600">{tenant.totalOrdersProcessed}+ টি</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-stone-500 block">লাইসেন্স কি:</span>
                        <span className="font-mono font-bold text-stone-700">{tenant.licenseKey}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Inquiry Contact Box */}
              <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xl font-black">সফটওয়্যার ডেমো বা কাস্টমাইজেশন নিয়ে কথা বলুন</h4>
                  <p className="text-xs text-amber-100">
                    আমাদের প্রধান টেকনিক্যাল কনসালটেন্ট ও প্রোপাইটার মোহাম্মদ আব্দুল বারিক শেখের সাথে সরাসরি কথা বলুন।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href={`tel:${SAAS_CONTACT_INFO.salesPhone.replace(/[^0-9]/g, '')}`}
                    className="px-4 py-2.5 rounded-xl bg-stone-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-stone-900 shadow-md"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>{SAAS_CONTACT_INFO.salesPhone}</span>
                  </a>

                  <button
                    onClick={() => openDirectCustomWhatsApp(SAAS_CONTACT_INFO.salesWhatsApp, 'আসসালামু আলাইকুম, আমি হোটেল আল শেখ ফরিদ ফুড অর্ডারিং SaaS সফটওয়্যার ডেমো দেখতে আগ্রহী।')}
                    className="px-4 py-2.5 rounded-xl bg-white text-stone-950 font-black text-xs flex items-center gap-2 hover:bg-amber-50 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp চ্যাট</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>হোয়াইট-লেবেল রেস্তোরাঁ অপারেটিং সিস্টেম • ঈশ্বরদী, পাবনা</span>
          </div>
          <div className="font-semibold text-stone-700">
            হেল্পলাইন: <span className="font-mono text-amber-700">{SAAS_CONTACT_INFO.salesPhone}</span> | ইমেইল: <span className="font-mono">{SAAS_CONTACT_INFO.salesEmail}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
