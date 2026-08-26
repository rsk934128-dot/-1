import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Truck, 
  CheckCircle2, 
  Bell, 
  BellRing, 
  Clock, 
  Zap, 
  ChevronRight, 
  Receipt,
  Play,
  RotateCcw,
  Sparkles,
  Mail,
  Navigation,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { requestPushNotificationPermission } from '../services/notificationService';
import { openDirectWhatsApp } from '../utils/whatsappHelper';

interface ActiveOrderTrackerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onViewOrderDetails: (order: Order) => void;
  onEmailInvoice?: (order: Order) => void;
  onOpenBkashSms?: (order: Order) => void;
  onTriggerTestPush: () => void;
  lang: 'bn' | 'en';
}

export const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({
  orders,
  onUpdateOrderStatus,
  onViewOrderDetails,
  onEmailInvoice,
  onOpenBkashSms,
  onTriggerTestPush,
  lang,
}) => {
  const [autoTimerActive, setAutoTimerActive] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(true);

  // Find the first active order that is either 'cooking', 'on_the_way', or 'pending'
  const activeOrder = orders.find(
    (o) => o.status === 'cooking' || o.status === 'on_the_way' || o.status === 'pending'
  );

  // Handle push permission request
  const handleEnablePush = async () => {
    await requestPushNotificationPermission();
    setNotificationEnabled(true);
  };

  // Auto progression timer simulation effect
  useEffect(() => {
    if (!autoTimerActive || !activeOrder || activeOrder.id !== autoTimerActive) return;

    if (countdownSeconds <= 0) {
      // Transition from cooking -> on_the_way -> completed
      if (activeOrder.status === 'pending') {
        onUpdateOrderStatus(activeOrder.id, 'cooking');
      } else if (activeOrder.status === 'cooking') {
        onUpdateOrderStatus(activeOrder.id, 'on_the_way');
      } else if (activeOrder.status === 'on_the_way') {
        onUpdateOrderStatus(activeOrder.id, 'completed');
      }
      setAutoTimerActive(null);
      setCountdownSeconds(10);
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [autoTimerActive, countdownSeconds, activeOrder, onUpdateOrderStatus]);

  const startAutoSimulation = (orderId: string) => {
    setAutoTimerActive(orderId);
    setCountdownSeconds(8);
  };

  const cancelAutoSimulation = () => {
    setAutoTimerActive(null);
    setCountdownSeconds(10);
  };

  if (!activeOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900 font-serif">
                  {lang === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন অ্যালার্ট সিস্টেম' : 'Browser Push Notification Alert System'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {lang === 'bn' 
                  ? 'খাবার অর্ডার করার পর "রান্না হচ্ছে" থেকে "ডেলিভারির পথে" ও "ডেলিভারি সম্পন্ন" হলে ব্রাউজার পুশ নোটিফিকেশন পাবেন।' 
                  : 'Get instant browser push notifications when your food status changes from cooking to on the way and delivered.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerTestPush}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 border border-amber-500/30 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'টেস্ট পুশ নোটিফিকেশন দেখুন' : 'Test Push Alert'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Order Progression Stages
  const stages = [
    { key: 'pending', labelBn: 'অর্ডার গৃহীত', labelEn: 'Order Placed', icon: Clock },
    { key: 'cooking', labelBn: 'রান্না হচ্ছে (Kitchen)', labelEn: 'Cooking', icon: Flame },
    { key: 'on_the_way', labelBn: 'ডেলিভারির পথে (Live Map)', labelEn: 'On the Way (Map)', icon: Truck },
    { key: 'completed', labelBn: 'ডেলিভারি সম্পন্ন', labelEn: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStageIndex = 
    activeOrder.status === 'pending' ? 0 :
    activeOrder.status === 'cooking' ? 1 :
    activeOrder.status === 'on_the_way' ? 2 : 3;

  const scrollToMap = () => {
    const el = document.getElementById('order-delivery-map-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
      <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-stone-100 rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-500/40 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-lg">
                  {activeOrder.status === 'on_the_way' ? (
                    <Truck className="w-6 h-6 animate-bounce" />
                  ) : activeOrder.status === 'cooking' ? (
                    <Flame className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Clock className="w-6 h-6 animate-spin" />
                  )}
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-amber-200 font-serif">
                    {lang === 'bn' ? 'চলমান অর্ডার ট্র্যাকার' : 'Live Order Progress'}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    {activeOrder.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-900/60 text-amber-200 border border-amber-700/50">
                    {activeOrder.orderType === 'dine_in' 
                      ? `টেবিল: ${activeOrder.tableNumber}` 
                      : activeOrder.orderType === 'parcel' ? 'পার্সেল' : 'হোম ডেলিভারি'}
                  </span>
                  {activeOrder.status === 'on_the_way' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      <span>{lang === 'bn' ? 'রাইডার পথে আছে' : 'Rider Dispatched'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400">
                  {lang === 'bn' ? 'গ্রাহক: ' : 'Customer: '}
                  <span className="text-stone-200 font-bold">{activeOrder.customerName}</span> • 
                  {activeOrder.items.map(i => ` ${i.food.nameBn} (${i.quantity})`).join(', ')}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Jump to Map Button */}
              <button
                onClick={scrollToMap}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/40 cursor-pointer"
                title="ডেলিভারি রুট ম্যাপ দেখুন"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'bn' ? 'রুট ম্যাপ' : 'Live Map'}</span>
              </button>

              {onOpenBkashSms && activeOrder.paymentMethod === 'bkash' && (
                <button
                  onClick={() => onOpenBkashSms(activeOrder)}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1 border border-pink-500/40 cursor-pointer"
                  title="বিকাশ এসএমএস লেটার ও পেমেন্ট ভেরিফিকেশন"
                >
                  <div className="w-3.5 h-3.5 rounded bg-pink-600 text-white text-[8px] font-black flex items-center justify-center">
                    bK
                  </div>
                  <span>{lang === 'bn' ? 'বিকাশ SMS' : 'bKash SMS'}</span>
                </button>
              )}

              {onEmailInvoice && (
                <button
                  onClick={() => onEmailInvoice(activeOrder)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                  title="Gmail দিয়ে ইনভয়েস পাঠান"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'Gmail ইনভয়েস' : 'Gmail'}</span>
                </button>
              )}

              <button
                onClick={() => openDirectWhatsApp(activeOrder, undefined, lang)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/50 cursor-pointer shadow-xs"
                title="সরাসরি WhatsApp এ যোগাযোগ করুন"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => onViewOrderDetails(activeOrder)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 border border-stone-700 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'রশিদ' : 'Receipt'}</span>
              </button>

              <button
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-xs font-bold flex items-center gap-1 border border-amber-600/40 cursor-pointer"
                title="ব্রাউজার পুশ নোটিফিকেশন"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'অ্যালার্ট সক্রিয়' : 'Alert'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const IconComponent = stage.icon;

              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                      : isPast
                      ? 'bg-stone-900 border-emerald-600/50 text-emerald-400'
                      : 'bg-stone-900/50 border-stone-800 text-stone-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isCurrent ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black truncate">
                      {lang === 'bn' ? stage.labelBn : stage.labelEn}
                    </p>
                    <span className="text-[10px] opacity-80 block truncate">
                      {isCurrent ? (lang === 'bn' ? 'চলমান ধাপ' : 'In Progress') : isPast ? (lang === 'bn' ? 'সম্পন্ন' : 'Done') : (lang === 'bn' ? 'পরবর্তী' : 'Next')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulation Controls & Next Status Progression */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'অর্ডার স্ট্যাটাস অগ্রগতি ও লাইভ ডেলিভারি ট্র্যাকিং:' 
                  : 'Order status progression & live delivery tracking:'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Progression Buttons */}
              {activeOrder.status === 'pending' && (
                <button
                  onClick={() => onUpdateOrderStatus(activeOrder.id, 'cooking')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'bn' ? '🔥 রান্না শুরু করুন (Cooking)' : 'Start Cooking'}</span>
                </button>
              )}

              {activeOrder.status === 'cooking' && (
                <button
                  onClick={() => onUpdateOrderStatus(activeOrder.id, 'on_the_way')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-white" />
                  <span>{lang === 'bn' ? '🚴 রাইডার অন দ্য ওয়ে (On the Way)' : 'Dispatch Rider'}</span>
                </button>
              )}

              {/* Complete Delivery Button */}
              <button
                onClick={() => onUpdateOrderStatus(activeOrder.id, 'completed')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  {lang === 'bn' ? '✅ ডেলিভারি সম্পন্ন করুন' : 'Complete Delivery'}
                </span>
              </button>

              {/* 8s Countdown Auto Timer Simulation */}
              {autoTimerActive === activeOrder.id ? (
                <button
                  onClick={cancelAutoSimulation}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-black flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'bn' ? `অটো টাইমার (${countdownSeconds}s)` : `Progressing (${countdownSeconds}s)`}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => startAutoSimulation(activeOrder.id)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {lang === 'bn' ? '⏳ ৮ সেকেন্ড অটো-টাইমার' : '⏳ 8s Auto Timer'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

