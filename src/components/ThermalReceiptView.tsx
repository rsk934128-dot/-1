import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
  Copy, 
  Check, 
  Receipt, 
  Scissors, 
  Sparkles,
  QrCode,
  Share2,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { Order } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface ThermalReceiptViewProps {
  order: Order | null;
  lang?: 'bn' | 'en';
  onClose: () => void;
  onDirectPrint?: () => void;
}

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({
  order,
  lang = 'bn',
  onClose,
  onDirectPrint,
}) => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [copiedText, setCopiedText] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // Extract a 2 to 4 digit token number from order id for the kitchen/counter
  const tokenNumber = order.id.replace(/\D/g, '').slice(-3) || order.id.slice(-4).toUpperCase();

  const orderTypeLabel = 
    order.orderType === 'dine_in' 
      ? (lang === 'bn' ? `ডাইন-ইন (টেবিল #${order.tableNumber || 'সাধারণ'})` : `Dine-In (Table #${order.tableNumber || 'General'})`)
      : order.orderType === 'parcel'
      ? (lang === 'bn' ? 'কাউন্টার পার্সেল / টেকঅ্যাওয়ে' : 'Takeaway / Parcel')
      : (lang === 'bn' ? `হোম ডেলিভারি (${order.deliveryAddress || 'রেলওয়ে স্টেশন এলাকা'})` : `Home Delivery (${order.deliveryAddress || 'Station Area'})`);

  const paymentLabel = 
    order.paymentMethod === 'bkash' ? 'bKash (বিকাশ)' :
    order.paymentMethod === 'nagad' ? 'Nagad (নগদ)' :
    order.paymentMethod === 'rocket' ? 'Rocket (রকেট)' : 'Cash (ক্যাশ)';

  const paymentStatusLabel = 
    order.paymentStatus === 'paid' || order.paymentStatus === 'verified'
      ? (lang === 'bn' ? 'পরিশোধিত [PAID]' : 'PAID')
      : (lang === 'bn' ? 'অপরিশোধিত [DUE / CASH]' : 'DUE / CASH');

  // Generate plain text formatted receipt for ESC/POS / Bluetooth thermal printers
  const generateEscPosText = () => {
    const divider = paperWidth === '58mm' ? '--------------------------------' : '========================================';
    const subDivider = paperWidth === '58mm' ? '- - - - - - - - - - - - - - - - ' : '- - - - - - - - - - - - - - - - - - - - ';
    
    let text = '';
    text += `       ${HOTEL_INFO.nameBn}\n`;
    text += `     ${HOTEL_INFO.nameEn}\n`;
    text += `প্রোপাইটার: ${HOTEL_INFO.proprietorBn}\n`;
    text += `মোবাইল: ${HOTEL_INFO.phone1}\n`;
    text += `${HOTEL_INFO.locationBn}\n`;
    text += `${divider}\n`;
    text += `টোকেন নং: #${tokenNumber}  |  অর্ডার: #${order.id}\n`;
    text += `তারিখ ও সময়: ${order.createdAt}\n`;
    text += `গ্রাহক: ${order.customerName} (${order.customerPhone})\n`;
    text += `ধরন: ${orderTypeLabel}\n`;
    if (order.deliveryAddress) {
      text += `ঠিকানা: ${order.deliveryAddress}\n`;
    }
    text += `${divider}\n`;
    text += paperWidth === '58mm' 
      ? `আইটেম             পরি. দর   মোট\n` 
      : `আইটেম                    পরিমাণ   দর     মোট\n`;
    text += `${subDivider}\n`;

    order.items.forEach((item, idx) => {
      const name = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
      const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
      const total = unitPrice * item.quantity;
      const portion = item.selectedPortion ? ` (${lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn})` : '';
      text += `${idx + 1}. ${name}${portion}\n`;
      text += `   ${item.quantity} x ৳${unitPrice} = ৳${total}\n`;
    });

    text += `${divider}\n`;
    text += `সাবটোটাল: ৳${order.subtotal}\n`;
    if (order.discount && order.discount > 0) {
      text += `ছাড় (পয়েন্টস): -৳${order.discount}\n`;
    }
    text += `ডেলিভারি ফি: ${order.deliveryFee === 0 ? 'ফ্রি' : `৳${order.deliveryFee}`}\n`;
    text += `${divider}\n`;
    text += `সর্বমোট প্রদেয় (NET): ৳${order.total}\n`;
    text += `পেমেন্ট: ${paymentLabel} [${paymentStatusLabel}]\n`;
    if (order.transactionId) {
      text += `TrxID: ${order.transactionId}\n`;
    }
    if (order.specialNote) {
      text += `বিশেষ নির্দেশ: "${order.specialNote}"\n`;
    }
    text += `${divider}\n`;
    text += `খাবার গ্রহণের জন্য ধন্যবাদ! আবার আসবেন।\n`;
    text += `হোটেল আল শেখ ফরিদ - রেলওয়ে স্টেশন\n\n\n`;

    return text;
  };

  const handleCopyText = async () => {
    try {
      const plainText = generateEscPosText();
      await navigator.clipboard.writeText(plainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy receipt text:', err);
    }
  };

  const handlePrint = () => {
    if (onDirectPrint) {
      onDirectPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 thermal-modal-container flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="no-print px-4 py-3 sm:px-6 sm:py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'থার্মাল প্রিন্টার রসিদ ভিউ' : 'Thermal Printer Receipt View'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  POS Ready
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {lang === 'bn' ? '৫৮মিমি / ৮০মিমি থার্মাল পিওএস প্রিন্টারের উপযোগী প্রিভিউ' : 'Formatted for 58mm & 80mm thermal roll printers'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Size & Action Options */}
        <div className="no-print px-4 py-2 sm:px-6 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 text-[11px] font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'কাগজের সাইজ:' : 'Roll Size:'}</span>
            </span>
            <div className="inline-flex rounded-lg bg-stone-800 p-0.5 border border-stone-700">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  paperWidth === '80mm'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                80mm (৩ ইঞ্চি)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  paperWidth === '58mm'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                58mm (২ ইঞ্চি)
              </button>
            </div>
          </div>

          {/* Quick Utility Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedText
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title="Bluetooth বা RawBT প্রিন্টারের জন্য টেক্সট কপি"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>কাঁচা টেক্সট কপি</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রিন্ট দিন' : 'Print Now'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Thermal Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-950/60 flex justify-center items-start">
          
          {/* THE THERMAL RECEIPT SLIP */}
          <div 
            ref={receiptRef}
            id="dedicated-thermal-receipt"
            style={{ maxWidth: paperWidth === '58mm' ? '58mm' : '80mm' }}
            className={`w-full bg-[#fdfbf7] text-stone-950 font-mono shadow-2xl transition-all duration-300 border border-stone-300 select-all relative ${
              paperWidth === '58mm' 
                ? 'p-2.5 text-[9.5px] leading-[1.25]' 
                : 'p-4 text-[11px] leading-[1.35]'
            }`}
          >
            {/* Top Zigzag Paper Cut Edge */}
            <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden -translate-y-full opacity-60">
              <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-full fill-[#fdfbf7]">
                <polygon points="0,8 5,0 10,8 15,0 20,8 25,0 30,8 35,0 40,8 45,0 50,8 55,0 60,8 65,0 70,8 75,0 80,8 85,0 90,8 95,0 100,8" />
              </svg>
            </div>

            {/* Header: Restaurant Branding */}
            <div className="text-center pb-2 border-b border-dashed border-stone-900 space-y-0.5">
              <div className="font-black text-sm uppercase tracking-wide">
                {HOTEL_INFO.nameBn}
              </div>
              <div className="text-[10px] tracking-wider uppercase font-semibold text-stone-800">
                {HOTEL_INFO.nameEn}
              </div>
              <div className="text-[9px] text-stone-700">
                প্রোপাইটার: {HOTEL_INFO.proprietorBn}
              </div>
              <div className="text-[9px] text-stone-700">
                {HOTEL_INFO.locationBn}
              </div>
              <div className="text-[9px] font-semibold text-stone-800">
                মোবাইল: {HOTEL_INFO.phone1} / {HOTEL_INFO.phone2}
              </div>
              
              {/* Highlighted Kitchen Token Number */}
              <div className="inline-block my-1.5 px-3 py-1 bg-stone-950 text-white rounded font-black text-xs tracking-wider">
                টোকেন / TOKEN #{tokenNumber}
              </div>
              
              <div className="text-[9px] uppercase tracking-widest text-stone-600 font-bold">
                *** গ্রাহক রসিদ ও কিচেন টোকেন ***
              </div>
            </div>

            {/* Order Meta Info */}
            <div className="py-2 border-b border-dashed border-stone-900 text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>অর্ডার নং: #{order.id}</span>
                <span>{order.createdAt.split(' ')[0] || 'আজ'}</span>
              </div>
              <div className="flex justify-between text-[9.5px]">
                <span>সময়: {order.createdAt}</span>
                <span>কাউন্টার: #১</span>
              </div>
              <div className="flex justify-between">
                <span>গ্রাহক: {order.customerName}</span>
                <span className="font-bold">{order.customerPhone}</span>
              </div>
              <div className="font-semibold text-stone-900">
                ধরন: {orderTypeLabel}
              </div>
              {order.deliveryAddress && (
                <div className="text-[9.5px] text-stone-800">
                  ঠিকানা: {order.deliveryAddress}
                </div>
              )}
            </div>

            {/* Items Table Header */}
            <div className="pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-900 text-[9.5px]">
                    <th className="py-1 font-bold">বিবরণ / Item</th>
                    <th className="py-1 text-center font-bold">পরি.</th>
                    <th className="py-1 text-right font-bold">দর</th>
                    <th className="py-1 text-right font-bold">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-stone-400">
                  {order.items.map((item, idx) => {
                    const foodName = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
                    const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
                    const itemTotal = unitPrice * item.quantity;
                    return (
                      <tr key={idx} className="align-top">
                        <td className="py-1.5 pr-1">
                          <div className="font-bold">{idx + 1}. {foodName}</div>
                          {item.selectedPortion && (
                            <div className="text-[8.5px] italic text-stone-700">
                              [{lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn}]
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-1.5 text-right">৳{unitPrice}</td>
                        <td className="py-1.5 text-right font-black">৳{itemTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-dashed border-stone-900 pt-2 pb-1 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span>৳{order.subtotal}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-stone-700 italic">
                  <span>লয়্যালটি পয়েন্ট ছাড়:</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি ফি:</span>
                <span>{order.deliveryFee === 0 ? 'ফ্রি (৳০)' : `৳${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>ভ্যাট / ট্যাক্স (০%):</span>
                <span>৳০.০০ (অন্তর্ভুক্ত)</span>
              </div>

              {/* Grand Total Box */}
              <div className="border-t-2 border-b-2 border-stone-950 py-1 my-1 flex justify-between items-center text-xs font-black">
                <span className="uppercase">সর্বমোট প্রদেয় (NET):</span>
                <span className="text-sm">৳{order.total}</span>
              </div>
            </div>

            {/* Payment & Status Info */}
            <div className="border border-stone-900 p-1.5 my-1.5 text-center text-[9.5px] font-bold bg-stone-100/50">
              <div>পেমেন্ট: {paymentLabel} | {paymentStatusLabel}</div>
              {order.transactionId && (
                <div className="font-mono text-[9px] mt-0.5">TrxID: {order.transactionId}</div>
              )}
            </div>

            {/* Special Instructions Note if any */}
            {order.specialNote && (
              <div className="border-l-2 border-stone-900 pl-1.5 italic text-[9px] my-1 text-stone-800">
                বিশেষ নির্দেশ: "{order.specialNote}"
              </div>
            )}

            {/* POS Vector Barcode & Token Verification */}
            <div className="my-2 text-center">
              <div className="flex items-center justify-center gap-[2px] h-9 max-w-[200px] mx-auto overflow-hidden">
                {/* Vector Barcode Strips */}
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w * 1.5}px` }}
                    className={`h-full ${i % 2 === 0 ? 'bg-stone-950' : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <div className="text-[8.5px] font-mono tracking-widest mt-0.5 text-stone-800">
                *{order.id.toUpperCase()}*
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-dashed border-stone-900 text-center text-[8.5px] text-stone-700 space-y-0.5">
              <div className="font-bold">খাবার গ্রহণের জন্য আন্তরিক ধন্যবাদ!</div>
              <div>রেলওয়ে স্টেশন এলাকা, সান্তাহার, বগুড়া</div>
              <div className="text-[8px] text-stone-500">
                মুদ্রণ: {new Date().toLocaleTimeString('bn-BD')} | POS v2.4
              </div>
            </div>

            {/* Bottom Zigzag Cut Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden translate-y-full opacity-60">
              <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-full fill-[#fdfbf7]">
                <polygon points="0,0 5,8 10,0 15,8 20,0 25,8 30,0 35,8 40,0 45,8 50,0 55,8 60,0 65,8 70,0 75,8 80,0 85,8 90,0 95,8 100,0" />
              </svg>
            </div>

          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="no-print px-4 py-3 sm:px-6 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>৫8মিমি ও ৮০মিমি রসিদ প্রিন্টারে সরাসরি ব্যবহারের জন্য প্রস্তুত</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'ফিরে যান' : 'Back'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
