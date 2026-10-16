import React from 'react';
import { Order } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface PrintableOrderReceiptProps {
  order: Order | null;
  lang?: 'bn' | 'en';
}

export const PrintableOrderReceipt: React.FC<PrintableOrderReceiptProps> = ({
  order,
  lang = 'bn',
}) => {
  if (!order) return null;

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

  return (
    <div id="printable-receipt-area" className="hidden print:block text-black bg-white p-3 font-mono text-[11px] leading-tight max-w-[80mm] mx-auto">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black mb-2">
        <h2 className="text-sm font-black tracking-wide uppercase">{HOTEL_INFO.nameBn}</h2>
        <p className="text-[10px]">{HOTEL_INFO.nameEn}</p>
        <p className="text-[9px]">প্রোপাইটার: {HOTEL_INFO.proprietorBn} ({HOTEL_INFO.phone2})</p>
        <p className="text-[9px]">{HOTEL_INFO.locationBn}</p>
        <p className="text-[9px]">হেল্পলাইন ও WhatsApp: {HOTEL_INFO.phone1}</p>
        <div className="inline-block border border-black px-2 py-0.5 mt-1 font-bold text-[10px]">
          গ্রাহক রসিদ ও কিচেন টোকেন
        </div>
      </div>

      {/* Order Meta */}
      <div className="border-b border-dashed border-black pb-2 mb-2 text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span><strong>অর্ডার নং:</strong> #{order.id}</span>
          <span><strong>তারিখ:</strong> {order.createdAt}</span>
        </div>
        <div className="flex justify-between">
          <span><strong>গ্রাহক:</strong> {order.customerName}</span>
          <span><strong>মোবাইল:</strong> {order.customerPhone}</span>
        </div>
        <div>
          <span><strong>ধরন:</strong> {orderTypeLabel}</span>
        </div>
        {order.deliveryAddress && (
          <div>
            <span><strong>ঠিকানা:</strong> {order.deliveryAddress}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-2 text-[10px] border-collapse">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1">আইটেম</th>
            <th className="py-1 text-center">পরি.</th>
            <th className="py-1 text-right">দর</th>
            <th className="py-1 text-right">মোট</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dotted divide-gray-400">
          {order.items.map((item, idx) => {
            const foodName = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
            const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
            const itemTotal = unitPrice * item.quantity;
            return (
              <tr key={idx}>
                <td className="py-1 pr-1">
                  <div className="font-bold">{idx + 1}. {foodName}</div>
                  {item.selectedPortion && (
                    <div className="text-[9px] italic text-gray-700">
                      {lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn}
                    </div>
                  )}
                </td>
                <td className="py-1 text-center font-bold align-top">{item.quantity}</td>
                <td className="py-1 text-right align-top">৳{unitPrice}</td>
                <td className="py-1 text-right font-bold align-top">৳{itemTotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="border-t border-dashed border-black border-b py-1.5 mb-2 text-[10.5px] space-y-0.5">
        <div className="flex justify-between">
          <span>সাবটোটাল:</span>
          <span>৳{order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>ডেলিভারি চার্জ:</span>
          <span>{order.deliveryFee === 0 ? 'ফ্রি (৳0)' : `৳${order.deliveryFee}`}</span>
        </div>
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-black">
          <span>সর্বমোট বিল (Net):</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Payment Box */}
      <div className="border border-black p-1 text-center text-[10px] font-bold mb-2">
        পেমেন্ট: {paymentLabel} | {paymentStatusLabel}
        {order.transactionId && <div>TrxID: {order.transactionId}</div>}
      </div>

      {/* Special Note */}
      {order.specialNote && (
        <div className="border-l-2 border-black pl-1.5 italic text-[9.5px] mb-2">
          বিশেষ নির্দেশ: "{order.specialNote}"
        </div>
      )}

      {/* Barcode & Verification */}
      <div className="text-center font-mono tracking-widest font-black text-xs my-1">
        |||| | ||||| || |||||| ||||
      </div>

      {/* Footer */}
      <div className="text-center text-[9px] pt-1 border-t border-dashed border-black text-gray-800 space-y-0.5">
        <div>হোটেল আল শেখ ফরিদ এ খাবার গ্রহণের জন্য ধন্যবাদ!</div>
        <div>স্বাদ ও মানের বিশ্বস্ত প্রতিষ্ঠান • সান্তাহার রেলওয়ে স্টেশন</div>
        <div className="text-[8px] text-gray-600">মুদ্রণ সময়: {new Date().toLocaleString('bn-BD')}</div>
      </div>
    </div>
  );
};
