import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Flame, 
  Phone, 
  ChefHat, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';
import { SoundNotificationService, SoundServiceState } from '../services/soundNotificationService';

interface IncomingOrderRingtoneAlertProps {
  orders: Order[];
  lang: 'bn' | 'en';
  onConfirmOrder: (orderId: string) => void;
  onStartCooking?: (orderId: string) => void;
  onOpenAdminOrders?: () => void;
  isAdmin: boolean;
}

export const IncomingOrderRingtoneAlert: React.FC<IncomingOrderRingtoneAlertProps> = ({
  orders,
  lang,
  onConfirmOrder,
  onStartCooking,
  onOpenAdminOrders,
  isAdmin,
}) => {
  const [soundState, setSoundState] = useState<SoundServiceState>({
    volume: SoundNotificationService.getVolume(),
    muted: SoundNotificationService.isMuted(),
    isRinging: SoundNotificationService.isOrderRingtoneActive(),
    ringingOrderIds: SoundNotificationService.getRingingOrderIds(),
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Subscribe to SoundNotificationService state
  useEffect(() => {
    const unsub = SoundNotificationService.subscribe((state) => {
      setSoundState(state);
    });
    return () => unsub();
  }, []);

  // Find orders that are ringing or in 'pending' status awaiting hotel owner confirmation
  const ringingIds = soundState.ringingOrderIds || [];
  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' || ringingIds.includes(o.id)
  );

  const isRingingActive = Boolean(soundState.isRinging && pendingOrders.length > 0);

  // If no ringing order or pending order exists, do not show alert
  if (!isRingingActive && pendingOrders.length === 0) {
    return null;
  }

  // Active primary order to display
  const primaryOrder = pendingOrders[0];

  const handleConfirm = (orderId: string) => {
    onConfirmOrder(orderId);
  };

  const handleCooking = (orderId: string) => {
    if (onStartCooking) {
      onStartCooking(orderId);
    } else {
      onConfirmOrder(orderId);
    }
  };

  const handleToggleMute = () => {
    if (soundState.isRinging) {
      SoundNotificationService.silenceRingtone();
    } else {
      SoundNotificationService.startOrderRingtone(primaryOrder?.id);
    }
  };

  const handleConfirmAll = () => {
    pendingOrders.forEach((ord) => onConfirmOrder(ord.id));
  };

  return (
    <div 
      id="incoming-order-ringtone-alert"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-stone-900/95 backdrop-blur-md border-2 border-amber-500 shadow-2xl rounded-2xl overflow-hidden ring-4 ring-amber-500/20 text-white">
        
        {/* Urgent Header Banner with Pulsing Ring Indicator */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <div className="relative w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center shadow-md animate-bounce">
                <BellRing className="w-5 h-5 animate-[spin_1s_ease-in-out_infinite]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-red-950/60 px-2 py-0.5 rounded-full border border-red-300/30">
                  {lang === 'bn' ? '🚨 নতুন অর্ডার!' : '🚨 NEW ORDER!'}
                </span>
                <span className="text-[11px] font-bold text-amber-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {soundState.isRinging 
                    ? (lang === 'bn' ? 'রিংটোন বাজছে...' : 'Ringtone ringing...')
                    : (lang === 'bn' ? 'রিংটোন সাময়িক নিঃশব্দ' : 'Ringtone silenced')}
                </span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-white font-serif leading-tight mt-0.5">
                {lang === 'bn' 
                  ? 'হোটেল মালিক কনফার্ম না করা পর্যন্ত অ্যালার্ম বাজবে' 
                  : 'Ringing continuously until hotel owner confirms'}
              </h3>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1.5">
            <button
              id="ringtone-mute-btn"
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                soundState.isRinging
                  ? 'bg-stone-900/80 hover:bg-stone-900 text-amber-200 border border-amber-400/40'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-black'
              }`}
              title={soundState.isRinging ? 'রিংটোন সাউন্ড নিঃশব্দ করুন' : 'রিংটোন আবার চালু করুন'}
            >
              {soundState.isRinging ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-[11px] hidden sm:inline">{lang === 'bn' ? 'মিউট' : 'Mute'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-stone-950" />
                  <span className="text-[11px] hidden sm:inline">{lang === 'bn' ? 'আনমিউট' : 'Unmute'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
              title={isExpanded ? 'সংক্ষেপ করুন' : 'বিস্তারিত দেখুন'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        {isExpanded && primaryOrder && (
          <div className="p-4 space-y-3 bg-stone-900/90 text-stone-200">
            
            {/* Primary Order Card */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-amber-500/40 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                      #{primaryOrder.id}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {primaryOrder.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    {primaryOrder.customerPhone && (
                      <a 
                        href={`tel:${primaryOrder.customerPhone}`} 
                        className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{primaryOrder.customerPhone}</span>
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span>{primaryOrder.createdAt || 'এখন মাত্র'}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-amber-400 font-mono">
                    ৳{primaryOrder.total}
                  </span>
                  <span className="block text-[10px] text-stone-400">
                    {primaryOrder.orderType === 'dine_in' 
                      ? (primaryOrder.tableNumber || 'টেবিল অর্ডার') 
                      : primaryOrder.orderType === 'parcel' 
                      ? 'পার্সেল' 
                      : 'হোম ডেলিভারি'}
                  </span>
                </div>
              </div>

              {/* Items overview */}
              <div className="text-xs text-stone-300 bg-stone-900/80 p-2 rounded-lg border border-stone-800 flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {primaryOrder.items.map(i => `${lang === 'bn' ? i.food.nameBn : i.food.nameEn} (x${i.quantity})`).join(', ')}
                </span>
              </div>

              {primaryOrder.specialNote && (
                <p className="text-[11px] text-amber-200/90 italic bg-amber-950/30 px-2 py-1 rounded border border-amber-900/40">
                  <span className="font-bold">নোট:</span> {primaryOrder.specialNote}
                </p>
              )}

              {/* Action Buttons for Hotel Owner */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  id={`confirm-order-ringtone-btn-${primaryOrder.id}`}
                  type="button"
                  onClick={() => handleConfirm(primaryOrder.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95 transition-all ring-2 ring-emerald-400/40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  <span>{lang === 'bn' ? '✓ এখনই কনফার্ম করুন (রিংটোন থামান)' : '✓ Confirm Order (Stop Ring)'}</span>
                </button>

                <button
                  id={`start-cooking-ringtone-btn-${primaryOrder.id}`}
                  type="button"
                  onClick={() => handleCooking(primaryOrder.id)}
                  className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
                  title="অর্ডার কনফার্ম করে রান্না শুরু করুন"
                >
                  <Flame className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'bn' ? 'রান্না শুরু' : 'Start Cooking'}</span>
                </button>
              </div>
            </div>

            {/* If there are more pending orders */}
            {pendingOrders.length > 1 && (
              <div className="pt-1 flex items-center justify-between border-t border-stone-800 text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? `আরও ${pendingOrders.length - 1}টি অর্ডার কনফার্মেশনের অপেক্ষায়` : `${pendingOrders.length - 1} more awaiting confirmation`}</span>
                </span>
                <button
                  type="button"
                  onClick={handleConfirmAll}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  {lang === 'bn' ? 'সকল অর্ডার একসাথে কনফার্ম করুন' : 'Confirm All Orders'}
                </button>
              </div>
            )}

            {/* Quick Link to Admin Dashboard */}
            {onOpenAdminOrders && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={onOpenAdminOrders}
                  className="text-[11px] text-stone-400 hover:text-amber-300 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ChefHat className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'হোটেল অ্যাডমিন কিচেন ড্যাশবোর্ডে দেখুন' : 'View in Hotel Admin Dashboard'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default IncomingOrderRingtoneAlert;
