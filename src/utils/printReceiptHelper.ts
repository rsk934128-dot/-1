import { Order } from '../types';
import { HOTEL_INFO } from '../data/initialData';

/**
 * Open print dialog with a dedicated, printer-friendly formatted thermal/A4 receipt
 */
export const printOrderReceipt = (order: Order, lang: 'bn' | 'en' = 'bn'): void => {
  // Check if we have the printable receipt container in the current DOM
  const existingPrintRoot = document.getElementById('printable-receipt-area');
  
  if (existingPrintRoot) {
    // If it exists, window.print() will use the `@media print` styles
    window.print();
    return;
  }

  // Fallback: Create a clean isolated print window for maximum compatibility
  const printWindow = window.open('', '_blank', 'width=450,height=700');
  if (!printWindow) {
    window.print();
    return;
  }

  const itemsRows = order.items
    .map((item, idx) => {
      const foodName = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
      const portionText = item.selectedPortion 
        ? `<div class="portion">${lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn}</div>` 
        : '';
      const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
      const itemTotal = unitPrice * item.quantity;
      return `
        <tr>
          <td class="col-item">
            <strong>${idx + 1}. ${foodName}</strong>
            ${portionText}
          </td>
          <td class="col-qty">${item.quantity}</td>
          <td class="col-rate">৳${unitPrice}</td>
          <td class="col-total">৳${itemTotal}</td>
        </tr>
      `;
    })
    .join('');

  const orderTypeLabel = 
    order.orderType === 'dine_in' 
      ? (lang === 'bn' ? `ডাইন-ইন (টেবিল #${order.tableNumber || 'সাধারণ'})` : `Dine-In (Table #${order.tableNumber || 'General'})`)
      : order.orderType === 'parcel'
      ? (lang === 'bn' ? 'কাউন্টার পার্সেল / টেকঅ্যাওয়ে' : 'Takeaway / Parcel')
      : (lang === 'bn' ? `হোম ডেলিভারি (${order.deliveryAddress || 'স্টেশন এলাকা'})` : `Home Delivery (${order.deliveryAddress || 'Station Area'})`);

  const paymentLabel = 
    order.paymentMethod === 'bkash' ? 'bKash (বিকাশ)' :
    order.paymentMethod === 'nagad' ? 'Nagad (নগদ)' :
    order.paymentMethod === 'rocket' ? 'Rocket (রকেট)' : 'Cash (ক্যাশ)';

  const paymentStatusLabel = 
    order.paymentStatus === 'paid' || order.paymentStatus === 'verified'
      ? (lang === 'bn' ? 'পরিশোধিত [PAID]' : 'PAID')
      : (lang === 'bn' ? 'অপরিশোধিত [DUE / CASH]' : 'DUE / CASH');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt #${order.id} - ${HOTEL_INFO.nameBn}</title>
        <style>
          @page {
            margin: 4mm;
            size: auto;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
            color: #000;
          }
          body {
            background: #fff;
            width: 100%;
            max-width: 78mm;
            margin: 0 auto;
            padding: 6px;
            font-size: 11px;
            line-height: 1.35;
          }
          .header {
            text-align: center;
            padding-bottom: 6px;
            border-bottom: 1px dashed #000;
            margin-bottom: 6px;
          }
          .title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .subtitle {
            font-size: 10px;
            margin-top: 2px;
          }
          .hotel-contact {
            font-size: 9.5px;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            border: 1px solid #000;
            padding: 1px 6px;
            font-weight: bold;
            font-size: 10px;
            margin-top: 4px;
          }
          .meta-section {
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
            margin-bottom: 6px;
            font-size: 10.5px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 10.5px;
          }
          .table-items th {
            border-bottom: 1px solid #000;
            padding: 3px 0;
            text-align: left;
            font-size: 10px;
          }
          .table-items td {
            padding: 4px 0;
            vertical-align: top;
          }
          .col-item { width: 50%; }
          .col-qty { width: 12%; text-align: center; }
          .col-rate { width: 18%; text-align: right; }
          .col-total { width: 20%; text-align: right; font-weight: bold; }
          .portion {
            font-size: 9px;
            color: #333;
            font-style: italic;
          }
          .summary-section {
            border-top: 1px dashed #000;
            border-bottom: 1px solid #000;
            padding: 4px 0;
            margin-bottom: 6px;
            font-size: 11px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .grand-total {
            font-size: 13px;
            font-weight: bold;
            border-top: 1px dashed #000;
            padding-top: 4px;
            margin-top: 2px;
          }
          .payment-box {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            margin-bottom: 6px;
            font-size: 10px;
            font-weight: bold;
          }
          .note-box {
            font-size: 9.5px;
            border-left: 2px solid #000;
            padding-left: 4px;
            margin-bottom: 6px;
            font-style: italic;
          }
          .footer {
            text-align: center;
            font-size: 9.5px;
            padding-top: 4px;
            border-top: 1px dashed #000;
          }
          .barcode {
            text-align: center;
            letter-spacing: 4px;
            font-weight: bold;
            margin: 6px 0 2px 0;
            font-size: 12px;
          }
          @media print {
            body { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${HOTEL_INFO.nameBn}</div>
          <div class="subtitle">${HOTEL_INFO.nameEn}</div>
          <div class="hotel-contact">প্রোপাইটার: ${HOTEL_INFO.proprietorBn}</div>
          <div class="hotel-contact">${HOTEL_INFO.locationBn}</div>
          <div class="hotel-contact">মোবাইল: ${HOTEL_INFO.phone1}, ${HOTEL_INFO.phone2}</div>
          <div class="badge">গ্রাহক রসিদ ও কিচেন টোকেন</div>
        </div>

        <div class="meta-section">
          <div class="meta-row">
            <span><strong>অর্ডার নং:</strong> #${order.id}</span>
            <span><strong>তারিখ:</strong> ${order.createdAt}</span>
          </div>
          <div class="meta-row">
            <span><strong>গ্রাহক:</strong> ${order.customerName}</span>
            <span><strong>ফোন:</strong> ${order.customerPhone}</span>
          </div>
          <div class="meta-row">
            <span><strong>ধরন:</strong> ${orderTypeLabel}</span>
          </div>
          ${order.deliveryAddress ? `<div class="meta-row"><span><strong>ঠিকানা:</strong> ${order.deliveryAddress}</span></div>` : ''}
        </div>

        <table class="table-items">
          <thead>
            <tr>
              <th class="col-item">আইটেম</th>
              <th class="col-qty">পরি.</th>
              <th class="col-rate">দর</th>
              <th class="col-total">মোট</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-row">
            <span>সাবটোটাল (Subtotal):</span>
            <span>৳${order.subtotal}</span>
          </div>
          <div class="summary-row">
            <span>ডেলিভারি চার্জ (Delivery):</span>
            <span>${order.deliveryFee === 0 ? 'ফ্রি (৳0)' : `৳${order.deliveryFee}`}</span>
          </div>
          <div class="summary-row grand-total">
            <span>সর্বমোট বিল (Net Total):</span>
            <span>৳${order.total}</span>
          </div>
        </div>

        <div class="payment-box">
          পেমেন্ট: ${paymentLabel} | অবস্থা: ${paymentStatusLabel}
          ${order.transactionId ? `<br>TrxID: ${order.transactionId}` : ''}
        </div>

        ${order.specialNote ? `<div class="note-box">বিশেষ নোট: ${order.specialNote}</div>` : ''}

        <div class="barcode">||| | ||||| || |||||| |||</div>

        <div class="footer">
          <div>হোটেল আল শেখ ফরিদ এ খাবার গ্রহণের জন্য ধন্যবাদ!</div>
          <div>স্বাদ ও মানের বিশ্বস্ত প্রতিষ্ঠান • সান্তাহার রেলওয়ে স্টেশন</div>
          <div style="font-size: 8.5px; color: #444; margin-top: 3px;">মুদ্রণ সময়: ${new Date().toLocaleString('bn-BD')}</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              // window.close();
            }, 1500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
