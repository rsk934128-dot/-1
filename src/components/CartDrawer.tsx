import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Bike, 
  Package, 
  Utensils, 
  ArrowRight,
  MapPin,
  Phone,
  User,
  AlertCircle,
  WifiOff,
  Database,
  Coins,
  Sparkles,
  Check
} from 'lucide-react';
import { CartItem, OrderType, UserProfile } from '../types';
import { VoiceSpecialNoteInput } from './VoiceSpecialNoteInput';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToPayment: (orderDetails: {
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    specialNote?: string;
    subtotal: number;
    deliveryFee: number;
    discount?: number;
    pointsRedeemed?: number;
    pointsEarned?: number;
    total: number;
  }) => void;
  user: UserProfile;
  lang: 'bn' | 'en';
  isCachedMode?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  user,
  lang,
  isCachedMode = false,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [tableNumber, setTableNumber] = useState<string>('টেবিল ১');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(user.address || 'স্টেশন রোড, রেলস্টেশন এলাকা');
  const [customerName, setCustomerName] = useState<string>(user.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user.phone || '');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const availablePoints = user.loyaltyPoints !== undefined ? user.loyaltyPoints : 75;

  React.useEffect(() => {
    if (user.name) setCustomerName(user.name);
    if (user.phone) setCustomerPhone(user.phone);
    if (user.address) setDeliveryAddress(user.address);
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const deliveryFee = orderType === 'delivery' ? (subtotal > 200 ? 0 : 15) : 0;
  
  // Max points that can be redeemed is up to available points and up to subtotal (1 point = ৳ 1)
  const maxRedeemablePoints = Math.min(availablePoints, subtotal);
  const pointsRedeemed = useLoyaltyPoints ? maxRedeemablePoints : 0;
  const discount = pointsRedeemed; // 1 point = ৳ 1
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const pointsEarned = Math.floor(subtotal / 10); // 1 point per 10 BDT

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setErrorMsg(lang === 'bn' ? 'আপনার কার্ট খালি!' : 'Cart is empty!');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন' : 'Please provide mobile number');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ডেলিভারি ঠিকানা লিখুন' : 'Please enter delivery address');
      return;
    }

    setErrorMsg('');
    onProceedToPayment({
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      customerName: customerName.trim() || 'সম্মানিত অতিথি',
      customerPhone: customerPhone.trim(),
      customerEmail: user.email,
      specialNote: specialNote.trim() || undefined,
      subtotal,
      deliveryFee,
      discount,
      pointsRedeemed,
      pointsEarned,
      total,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-stone-950">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif">{lang === 'bn' ? 'অর্ডার ব্যাগ / কার্ট' : 'Your Order Bag'}</h3>
                <p className="text-xs text-stone-400">
                  {cartItems.length} {lang === 'bn' ? 'টি আইটেম যোগ করা হয়েছে' : 'items added'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Offline Mode Alert */}
            {isCachedMode && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold flex items-center gap-1">
                    {lang === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">Local Storage</span>
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    {lang === 'bn' 
                      ? 'ইন্টারনেট সাময়িক বিচ্ছিন্ন থাকলেও আপনার ব্যাগের খাবার ও তথ্য নিরাপদে সংরক্ষিত রয়েছে।' 
                      : 'Your cart items are safely cached locally and will sync once reconnected.'}
                  </p>
                </div>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-stone-800 font-serif">
                  {lang === 'bn' ? 'আপনার খাবারের ব্যাগ খালি' : 'Your bag is empty'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  {lang === 'bn' 
                    ? 'হোটেল আল শীত পরির গরম জিলাপি, ভুনা খিচুড়ি বা কষা গরুর মাংস বেছে নিন!'
                    : 'Select delicious fresh hot meals from our menu!'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item, index) => {
                    const itemPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
                    return (
                      <div
                        key={index}
                        className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                      >
                        <img
                          src={item.food.image}
                          alt={item.food.nameBn}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-stone-900 truncate">
                            {lang === 'bn' ? item.food.nameBn : item.food.nameEn}
                          </h5>
                          {item.selectedPortion && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 mt-0.5">
                              {lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn}
                            </span>
                          )}
                          {item.specialInstruction && (
                            <p className="text-[10px] text-stone-500 italic mt-0.5 truncate">
                              "{item.specialInstruction}"
                            </p>
                          )}
                          <p className="text-xs font-black text-amber-700 mt-1">
                            ৳ {itemPrice * item.quantity}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-white rounded-xl border border-stone-300 p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Type Selector */}
                <div className="pt-3 border-t border-stone-200">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                    {lang === 'bn' ? 'অর্ডারের ধরন নির্বাচন করুন' : 'Order Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        orderType === 'delivery'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <Bike className="w-4 h-4 text-amber-600" />
                      <span className="text-[11px]">{lang === 'bn' ? 'ডেলিভারি' : 'Delivery'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('parcel')}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        orderType === 'parcel'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <Package className="w-4 h-4 text-amber-600" />
                      <span className="text-[11px]">{lang === 'bn' ? 'পার্সেল' : 'Parcel'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        orderType === 'dine_in'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span className="text-[11px]">{lang === 'bn' ? 'হোটেলে খাওয়া' : 'Dine In'}</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Fields based on Order Type */}
                <div className="space-y-3 pt-2">
                  {orderType === 'dine_in' && (
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        {lang === 'bn' ? 'টেবিল নং নির্বাচন করুন:' : 'Select Table No:'}
                      </label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={`টেবিল ${i + 1}`}>
                            {lang === 'bn' ? `টেবিল ${i + 1} (কাউন্টারের কাছে)` : `Table ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <div>
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{lang === 'bn' ? 'ডেলিভারির ঠিকানা (স্টেশন ও আশেপাশের এলাকা):' : 'Delivery Address:'}</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={lang === 'bn' ? 'যেমন: রেলওয়ে স্টেশন ৩ নং গেট, রুম ১০৩' : 'e.g. Station Road, House #4'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-stone-500" />
                        <span>{lang === 'bn' ? 'আপনার নাম:' : 'Your Name:'}</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={lang === 'bn' ? 'নাম লিখুন' : 'Name'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3 text-stone-500" />
                        <span>{lang === 'bn' ? 'মোবাইল নম্বর:*' : 'Phone:*'}</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Voice-to-Text Enabled Special Note Field */}
                  <VoiceSpecialNoteInput
                    value={specialNote}
                    onChange={setSpecialNote}
                    lang={lang}
                    label={lang === 'bn' ? 'অতিরিক্ত বার্তা বা বিশেষ অনুরোধ (ভয়েস নোট):' : 'Special Instructions / Requests (Voice Note):'}
                    placeholder={lang === 'bn' ? 'মুখে বলে রেকর্ড করুন বা লিখুন (যেমন: ঝাল বেশি, লেবু দিবেন, গরম গরম পাঠাবেন)' : 'Speak or type (e.g. extra spicy, extra gravy, deliver hot)'}
                  />

                  {/* Loyalty Points Redemption Box */}
                  {availablePoints > 0 && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                            <Coins className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">
                              {lang === 'bn' ? 'লয়্যালটি পয়েন্ট রিডিম করুন' : 'Redeem Loyalty Points'}
                            </span>
                            <span className="text-[10px] text-amber-800 font-semibold">
                              {lang === 'bn' 
                                ? `ব্যালেন্স: ${availablePoints} পয়েন্ট (৳ ${maxRedeemablePoints} ছাড় প্রযোজ্য)` 
                                : `Available: ${availablePoints} pts (৳ ${maxRedeemablePoints} discount)`}
                            </span>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useLoyaltyPoints}
                            onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>

                      {useLoyaltyPoints && (
                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'bn' ? `${pointsRedeemed} পয়েন্ট ব্যবহৃত হচ্ছে` : `Using ${pointsRedeemed} points`}</span>
                          </span>
                          <span className="text-emerald-700 font-black">- ৳ {discount} ক্যাশ ছাড়</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Billing Breakdown & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'খাবারের মোট মূল্য' : 'Subtotal'}</span>
                  <span className="font-semibold text-stone-900">৳ {subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'bn' ? 'লয়্যালটি পয়েন্ট ছাড়' : 'Points Discount'}</span>
                    </span>
                    <span>- ৳ {discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ডেলিভারি / প্যাকিং চার্জ' : 'Delivery & Packing'}</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                    ) : (
                      `৳ ${deliveryFee}`
                    )}
                  </span>
                </div>
                
                {/* Reward Points Earning Notice */}
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'bn' ? 'এই অর্ডারে রিওয়ার্ড অর্জন করবেন:' : 'Points earned on this order:'}</span>
                  </span>
                  <span className="font-black text-amber-700 font-mono">+{pointsEarned} Points</span>
                </div>

                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>{lang === 'bn' ? 'সর্বমোট পরিশোধযোগ্য' : 'Total Amount'}</span>
                  <span className="text-amber-700 text-base">৳ {total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'পেমেন্ট করুন ও অর্ডার কনফার্ম করুন' : 'Proceed to Payment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
