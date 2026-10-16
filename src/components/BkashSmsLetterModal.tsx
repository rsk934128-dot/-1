import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Receipt,
  FileText,
  Search,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BkashSmsLetter, parseBkashSms, matchSmsWithOrders } from '../services/bkashSmsService';
import { SoundNotificationService } from '../services/soundNotificationService';
import { Order, OrderStatus } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface BkashSmsLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sms: BkashSmsLetter | null;
  orders: Order[];
  onConfirmOrder: (orderId: string, trxId?: string) => void;
  onSendGmailInvoice?: (order: Order) => void;
  lang: 'bn' | 'en';
}

export const BkashSmsLetterModal: React.FC<BkashSmsLetterModalProps> = ({
  isOpen,
  onClose,
  sms,
  orders,
  onConfirmOrder,
  onSendGmailInvoice,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'manual_paste'>('letter');
  const [manualText, setManualText] = useState<string>('');
  const [parsedSms, setParsedSms] = useState<Partial<BkashSmsLetter> | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState<boolean>(false);

  // If SMS changes, update selected order
  React.useEffect(() => {
    if (sms) {
      setParsedSms(sms);
      if (sms.matchedOrderId) {
        setSelectedOrderId(sms.matchedOrderId);
      } else {
        const matchResult = matchSmsWithOrders(sms, orders);
        if (matchResult.matchedOrder) {
          setSelectedOrderId(matchResult.matchedOrder.id);
        }
      }
      setConfirmedSuccess(false);
    }
  }, [sms, orders]);

  if (!isOpen) return null;

  const currentSmsData = parsedSms || sms;
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || 
                       (currentSmsData ? matchSmsWithOrders(currentSmsData, orders).matchedOrder : undefined);

  const matchCheck = currentSmsData ? matchSmsWithOrders(currentSmsData, orders) : null;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    const parsed = parseBkashSms(manualText);
    setParsedSms(parsed);
    const match = matchSmsWithOrders(parsed, orders);
    if (match.matchedOrder) {
      setSelectedOrderId(match.matchedOrder.id);
    }
    setActiveTab('letter');
  };

  const handleConfirmOrder = () => {
    if (!currentOrder) return;

    onConfirmOrder(currentOrder.id, currentSmsData?.trxId);
    SoundNotificationService.playBkashVerificationSuccess();
    setConfirmedSuccess(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-800 via-rose-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600 border border-pink-400 text-white flex items-center justify-center shadow-xs font-black text-sm">
              bK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif">
                  {lang === 'bn' ? 'বিকাশ এসএমএস লেটার ও ভেরিফিকেশন' : 'bKash SMS Letter & Verification'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/30 text-pink-200 border border-pink-400/40 font-mono">
                  ০১৭৬১৮৬৯৯২১
                </span>
              </div>
              <p className="text-xs text-pink-200/90">
                {lang === 'bn' ? 'ব্যক্তিগত বিকাশ নম্বরে আসা এসএমএস যাচাই করে অর্ডার নিশ্চিত করুন' : 'Verify incoming bKash SMS and confirm customer food order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('letter')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'letter'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'এসএমএস লেটার ভিউ' : 'SMS Letter View'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_paste')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual_paste'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'নতুন এসএমএস পেস্ট করুন' : 'Paste & Verify SMS'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {activeTab === 'manual_paste' ? (
            <form onSubmit={handleManualParse} className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-1">
                <span className="font-bold block">💡 ফোন থেকে এসএমএস কপি করে পেস্ট করুন:</span>
                <p className="text-[11px] text-pink-800">
                  আপনার পার্সোনাল ফোনে (`01761869921`) আসা বিকাশের এসএমএসটি হুবহু কপি করে এখানে পেস্ট করুন। সিস্টেম নিজে থেকে TrxID, টাকার পরিমাণ ও ফোন নম্বর খুঁজে অর্ডারের সাথে মিলিয়ে দেবে।
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  {lang === 'bn' ? 'বিকাশ এসএমএস টেক্সট:' : 'bKash SMS Text:'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="You have received Tk 450.00 from 017XXXXXXXX. Fee Tk 0.00. Balance Tk 18450.00. TrxID 9K38FX12A at 20/08/2026 11:30"
                  className="w-full p-3 rounded-2xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-pink-500 leading-relaxed"
                />
              </div>

              {/* Sample SMS quick load */}
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>উদাহরণ টেস্ট করতে চান?</span>
                <button
                  type="button"
                  onClick={() => {
                    const sampleTrx = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
                    setManualText(`You have received Tk 450.00 from 01712345678. Ref Order-1024. Fee Tk 0.00. Balance Tk 18,900.00. TrxID ${sampleTrx} at 20/08/2026 11:15 AM.`);
                  }}
                  className="text-pink-700 font-bold hover:underline cursor-pointer"
                >
                  ডেমো এসএমএস লোড করুন
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'bn' ? 'এসএমএস যাচাই ও অর্ডারের সাথে মেলান' : 'Parse & Match SMS with Orders'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">

              {confirmedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold font-serif">
                      {lang === 'bn' ? 'অর্ডার সফলভাবে ভেরিফাই ও নিশ্চিত করা হয়েছে!' : 'Order successfully verified and confirmed!'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    পেমেন্ট স্ট্যাটাস: "পরিশোধিত ও ভেরিফাইড (Paid & Verified)" এবং কিচেনে রান্নার সংকেত পাঠানো হয়েছে।
                  </p>
                </div>
              )}

              {/* Realistic Mobile SMS Card / Letter */}
              <div className="rounded-2xl border-2 border-stone-200 bg-stone-900 text-white overflow-hidden shadow-md">
                {/* SMS Sender Bar */}
                <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-white text-[10px] font-black">
                      bK
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">bKash (7272)</h4>
                      <p className="text-[10px] text-stone-400 font-mono">প্রাপক: 01761869921 (মো: আব্দুল বারিক শেখ)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText(currentSmsData?.rawText || '')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 border border-stone-700 cursor-pointer"
                    title="এসএমএস টেক্সট কপি করুন"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-[10px]">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>

                {/* SMS Letter Content */}
                <div className="p-4 font-mono text-xs text-stone-200 space-y-2 bg-stone-900">
                  <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 leading-relaxed text-pink-200">
                    {currentSmsData?.rawText || 'No SMS data available.'}
                  </div>

                  {/* Field Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px]">প্রাপ্ত টাকা (Amount):</span>
                      <span className="text-pink-400 font-bold text-xs">৳ {currentSmsData?.amount?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px]">TrxID (ট্রানজেকশন আইডি):</span>
                      <span className="text-amber-300 font-bold text-xs font-mono">{currentSmsData?.trxId || 'N/A'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px]">প্রেরক মোবাইল (Sender):</span>
                      <span className="text-stone-200 font-bold font-mono">{currentSmsData?.senderPhone || 'N/A'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px]">সময় (Timestamp):</span>
                      <span className="text-stone-300 font-mono text-[10px]">{currentSmsData?.timestamp || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching & Order Selection Section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 font-serif flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'bn' ? 'অর্ডার ম্যাচিং ও ভেরিফিকেশন' : 'Order Matching & Verification'}</span>
                  </h4>
                  {matchCheck && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      matchCheck.confidence === 'exact' || matchCheck.confidence === 'high'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {matchCheck.confidence === 'exact' ? 'হুবহু মিলেছে ✓' : matchCheck.confidence === 'high' ? 'উচ্চ মিল ✓' : 'আংশিক মিল'}
                    </span>
                  )}
                </div>

                {/* Order Selector Dropdown */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {lang === 'bn' ? 'অর্ডার নির্বাচন করুন:' : 'Select Order:'}
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">-- অর্ডার বাছাই করুন --</option>
                    {orders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        #{ord.id} - {ord.customerName} ({ord.paymentMethod.toUpperCase()}) - ৳ {ord.total} [{ord.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Order Verification Matrix */}
                {currentOrder ? (
                  <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900">অর্ডার নং #{currentOrder.id}</span>
                        <p className="text-[11px] text-stone-500">গ্রাহক: {currentOrder.customerName} ({currentOrder.customerPhone})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        currentOrder.status === 'confirmed' || currentOrder.status === 'cooking' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentOrder.status}
                      </span>
                    </div>

                    {/* Verification Checklist */}
                    <div className="space-y-1.5 text-[11px]">
                      {/* TrxID check */}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600">TrxID যাচাই:</span>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          {currentOrder.transactionId && currentSmsData?.trxId && 
                           currentOrder.transactionId.toUpperCase() === currentSmsData.trxId.toUpperCase() ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> মিলেছে ({currentOrder.transactionId})
                            </span>
                          ) : (
                            <span className="text-amber-700">
                              {currentOrder.transactionId || 'কাস্টমার TrxID দেয়নি'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount check */}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600">টাকার পরিমাণ যাচাই:</span>
                        <div className="flex items-center gap-1 font-bold">
                          {currentSmsData?.amount && Math.abs(currentOrder.total - currentSmsData.amount) < 2 ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> বিল ৳ {currentOrder.total} == প্রাপ্ত ৳ {currentSmsData.amount}
                            </span>
                          ) : (
                            <span className="text-stone-900">
                              বিল ৳ {currentOrder.total} | প্রাপ্ত ৳ {currentSmsData?.amount || 0}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phone check */}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600">প্রেরক ফোন:</span>
                        <span className="font-mono text-stone-800 font-semibold">{currentOrder.customerPhone}</span>
                      </div>
                    </div>

                    {/* Items snippet */}
                    <div className="pt-2 border-t border-stone-200 flex justify-between text-[11px] text-stone-600">
                      <span>আইটেম: {currentOrder.items.map(i => i.food.nameBn).join(', ')}</span>
                      <span className="font-bold text-stone-900">মোট: ৳ {currentOrder.total}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-100 rounded-xl text-center text-xs text-stone-500">
                    তালিকা থেকে যেকোনো অর্ডার সিলেক্ট করে ভেরিফাই করুন।
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {currentOrder && (
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={currentOrder.status === 'confirmed' || currentOrder.status === 'cooking'}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {currentOrder.status === 'confirmed' || currentOrder.status === 'cooking'
                        ? (lang === 'bn' ? 'অর্ডার ইতিমধ্যে কনফার্মড ✓' : 'Order Already Confirmed ✓')
                        : (lang === 'bn' ? 'এসএমএস ভেরিফাই করে অর্ডার কনফার্ম করুন' : 'Verify SMS & Confirm Order')}
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {currentOrder?.customerPhone && (
                    <a
                      href={`tel:${currentOrder.customerPhone}`}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-300"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'bn' ? 'কাস্টমারকে কল দিন' : 'Call Customer'}</span>
                    </a>
                  )}

                  {currentOrder && onSendGmailInvoice && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSendGmailInvoice(currentOrder);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-amber-300 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700" />
                      <span>{lang === 'bn' ? 'Gmail ইনভয়েস পাঠান' : 'Gmail Invoice'}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>bKash Personal Security Guard</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
