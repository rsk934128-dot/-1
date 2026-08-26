import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Smartphone, 
  Banknote, 
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, OrderType } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
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
  } | null;
  onConfirmOrder: (paymentInfo: {
    method: PaymentMethod;
    transactionId?: string;
    paymentStatus: 'paid' | 'unpaid' | 'verified';
  }) => void;
  lang: 'bn' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  onConfirmOrder,
  lang,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [trxId, setTrxId] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState<string>(orderDetails?.customerPhone || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    if (orderDetails?.customerPhone) {
      setSenderNumber(orderDetails.customerPhone);
    }
  }, [orderDetails?.customerPhone]);

  if (!isOpen || !orderDetails) return null;

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = () => {
    if (selectedMethod !== 'cash' && !trxId.trim()) {
      // Auto generate a realistic TrxID demo if empty or validate
      const mockTrx = (selectedMethod === 'bkash' ? 'BK' : selectedMethod === 'nagad' ? 'NG' : 'RK') + Math.random().toString(36).substring(2, 9).toUpperCase();
      setTrxId(mockTrx);
    }

    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      onConfirmOrder({
        method: selectedMethod,
        transactionId: selectedMethod === 'cash' ? undefined : (trxId.trim() || 'TRX' + Math.floor(100000 + Math.random() * 900000)),
        paymentStatus: selectedMethod === 'cash' ? 'unpaid' : 'verified',
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 to-amber-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                {lang === 'bn' ? 'নিরাপদ পেমেন্ট গেটওয়ে' : 'Secure Payment Gateway'}
              </h3>
              <p className="text-xs text-amber-200">
                {lang === 'bn' ? `${HOTEL_INFO.nameBn} - পেমেন্ট` : `${HOTEL_INFO.nameEn} - Payment`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Order Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-900 uppercase">
                  {lang === 'bn' ? 'পরিশোধযোগ্য সর্বমোট বিল' : 'Total Payable Amount'}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {orderDetails.orderType === 'dine_in' ? `হোটেলে খাওয়া (${orderDetails.tableNumber})` : orderDetails.orderType === 'parcel' ? 'পার্সেল টেক-অ্যাওয়ে' : 'হোম ডেলিভারি'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-700">৳ {orderDetails.total}</span>
              </div>
            </div>

            {/* Points Discount Badge */}
            {orderDetails.discount && orderDetails.discount > 0 ? (
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span>{lang === 'bn' ? `✓ লয়্যালটি পয়েন্ট ডিসকাউন্ট (${orderDetails.pointsRedeemed} pts):` : `✓ Loyalty points discount (${orderDetails.pointsRedeemed} pts):`}</span>
                <span>- ৳ {orderDetails.discount}</span>
              </div>
            ) : null}
          </div>

          {/* Special Instruction Voice Note Preview */}
          {orderDetails.specialNote && (
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-stone-700 block text-[11px]">
                  {lang === 'bn' ? 'আপনার বিশেষ অনুরোধ / নির্দেশ:' : 'Your Special Instructions:'}
                </span>
                <p className="text-stone-600 italic mt-0.5 font-medium">
                  "{orderDetails.specialNote}"
                </p>
              </div>
            </div>
          )}

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2.5">
              {lang === 'bn' ? 'পেমেন্ট মাধ্যম বেছে নিন:' : 'Select Payment Method:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  selectedMethod === 'bkash'
                    ? 'bg-pink-50 border-pink-500 text-pink-900 font-bold ring-2 ring-pink-500/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  বিকাশ
                </div>
                <span className="text-xs">{lang === 'bn' ? 'বিকাশ' : 'bKash'}</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  selectedMethod === 'nagad'
                    ? 'bg-orange-50 border-orange-500 text-orange-900 font-bold ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  নগদ
                </div>
                <span className="text-xs">{lang === 'bn' ? 'নগদ' : 'Nagad'}</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setSelectedMethod('rocket')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  selectedMethod === 'rocket'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  রকেট
                </div>
                <span className="text-xs">{lang === 'bn' ? 'রকেট' : 'Rocket'}</span>
              </button>

              {/* Cash */}
              <button
                type="button"
                onClick={() => setSelectedMethod('cash')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  selectedMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-8 h-8 text-emerald-600" />
                <span className="text-xs">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash'}</span>
              </button>
            </div>
          </div>

          {/* MFS Instructions Box */}
          {selectedMethod !== 'cash' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">
                  {selectedMethod === 'bkash' ? 'বিকাশ পার্সোনাল নম্বর:' : selectedMethod === 'nagad' ? 'নগদ পার্সোনাল নম্বর:' : 'রকেট অ্যাকাউন্ট নম্বর:'}
                </span>
                <button
                  type="button"
                  onClick={() => copyNumber(selectedMethod === 'bkash' ? HOTEL_INFO.bkashNumber : selectedMethod === 'nagad' ? HOTEL_INFO.nagadNumber : HOTEL_INFO.rocketNumber)}
                  className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (lang === 'bn' ? 'নম্বর কপি করুন' : 'Copy')}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-300 flex items-center justify-between">
                <span className="font-mono text-sm font-black text-stone-900 tracking-wider">
                  {selectedMethod === 'bkash' ? HOTEL_INFO.bkashNumber : selectedMethod === 'nagad' ? HOTEL_INFO.nagadNumber : HOTEL_INFO.rocketNumber}
                </span>
              </div>

              <div className="text-[11px] text-stone-600 space-y-1 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                <p>১. আপনার {selectedMethod === 'bkash' ? 'bKash' : selectedMethod === 'nagad' ? 'Nagad' : 'Rocket'} অ্যাপ বা ডায়াল কোড থেকে <strong>Send Money</strong> অথবা <strong>Payment</strong> করুন।</p>
                <p>২. টাকার পরিমাণ লিখুন: <strong>৳ {orderDetails.total}</strong></p>
                <p>৩. সফল পেমেন্টের পর প্রাপ্ত <strong>Transaction ID (TrxID)</strong> নিচের বক্সে প্রদান করুন।</p>
              </div>

              {/* TrxID & Sender Number input */}
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {lang === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন:' : 'Sender Phone Number:'}
                  </label>
                  <input
                    type="tel"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {lang === 'bn' ? 'Transaction ID (TrxID):' : 'Transaction ID:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder={lang === 'bn' ? 'যেমন: BK92X887L (অথবা অটো ভেরিফাই চাপুন)' : 'e.g. BK92X887L'}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const mock = (selectedMethod === 'bkash' ? 'BK' : selectedMethod === 'nagad' ? 'NG' : 'RK') + Math.random().toString(36).substring(2, 9).toUpperCase();
                        setTrxId(mock);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold shrink-0"
                    >
                      {lang === 'bn' ? 'অটো TrxID' : 'Auto Fill'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash on Delivery Notice */}
          {selectedMethod === 'cash' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি / কাউন্টারে ক্যাশ' : 'Cash on Delivery / Counter'}</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {orderDetails.orderType === 'dine_in'
                  ? 'খাবার গ্রহণের পর টেবিল বা কাউন্টারে ক্যাশ প্রদান করতে পারবেন।'
                  : orderDetails.orderType === 'parcel'
                  ? 'পার্সেল গ্রহণের সময় কাউন্টারে ক্যাশ টাকা দিন।'
                  : 'ডেলিভারি ম্যানের কাছে খাবার পৌঁছানোর পর ক্যাশ টাকা প্রদান করবেন।'}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Payment Action */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>{lang === 'bn' ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'Verifying Payment...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {selectedMethod === 'cash'
                    ? (lang === 'bn' ? 'অর্ডার নিশ্চিত করুন (ক্যাশ)' : 'Confirm Order (Cash)')
                    : (lang === 'bn' ? `৳ ${orderDetails.total} পরিশোধ ও কনফার্ম` : `Pay ৳ ${orderDetails.total} & Confirm`)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
