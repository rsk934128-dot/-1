import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';
import { HOTEL_INFO } from '../data/initialData';

/**
 * Generates and downloads a detailed, high-resolution PDF invoice & order summary.
 * Uses a clean offscreen DOM template rendered via html2canvas and jsPDF to ensure
 * pristine rendering of Bengali Unicode fonts, styling, borders, and emblems.
 */
export async function downloadOrderSummaryPdf(order: Order, lang: 'bn' | 'en' = 'bn'): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // standard A4 width at 96 DPI
  container.style.minHeight = '1123px'; // standard A4 height
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.padding = '36px 44px';
  container.style.zIndex = '-999';

  const orderTypeLabel = order.orderType === 'dine_in'
    ? (lang === 'bn' ? `হোটেলে ডাইনিং (টেবিল নং ${order.tableNumber || '৩'})` : `Dine-In (Table ${order.tableNumber || '3'})`)
    : order.orderType === 'parcel'
    ? (lang === 'bn' ? 'কাউন্টার পার্সেল / টেক-অ্যাওয়ে' : 'Counter Parcel / Takeaway')
    : (lang === 'bn' ? 'হোম / প্ল্যাটফর্ম ডেলিভারি' : 'Home / Station Delivery');

  const statusLabel = order.status === 'completed'
    ? (lang === 'bn' ? 'ডেলিভারি সম্পন্ন (DELIVERED)' : 'COMPLETED & DELIVERED')
    : order.status === 'on_the_way'
    ? (lang === 'bn' ? 'ডেলিভারির পথে (ON THE WAY)' : 'ON THE WAY')
    : order.status === 'cooking'
    ? (lang === 'bn' ? 'রান্না চলছে (COOKING)' : 'COOKING')
    : (lang === 'bn' ? 'গৃহীত (PENDING)' : 'PENDING');

  const paymentStatusLabel = (order.paymentStatus === 'paid' || order.paymentStatus === 'verified')
    ? (lang === 'bn' ? 'পরিশোধিত (VERIFIED / PAID)' : 'PAID & VERIFIED')
    : (lang === 'bn' ? 'ক্যাশ অন ডেলিভারি / বাকি' : 'CASH ON DELIVERY');

  const itemsHtml = order.items.map((item, index) => {
    const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
    const itemTotal = unitPrice * item.quantity;
    const portionText = item.selectedPortion 
      ? (lang === 'bn' ? ` - ${item.selectedPortion.labelBn}` : ` - ${item.selectedPortion.labelEn}`) 
      : '';
    const itemName = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
    const itemCategory = item.food.category;

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${index % 2 === 0 ? '#ffffff' : '#fafaf9'};">
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1e293b;">
          ${index + 1}. ${itemName} <span style="font-size: 11px; font-weight: 600; color: #b45309;">${portionText}</span>
          <div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">ক্যাটেগরি: ${itemCategory} • ${item.food.nameEn}</div>
        </td>
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; text-align: center; color: #334155;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; text-align: right; color: #334155;">
          ৳ ${unitPrice}
        </td>
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 800; text-align: right; color: #0f172a;">
          ৳ ${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="max-width: 710px; margin: 0 auto; background: #ffffff;">
      
      <!-- Top Decorative Bar -->
      <div style="height: 6px; background: linear-gradient(90deg, #d97706, #f59e0b, #10b981); border-radius: 4px; margin-bottom: 24px;"></div>

      <!-- Hotel Header Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #f3f4f6;">
        <div>
          <div style="display: inline-block; padding: 4px 10px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 11px; font-weight: 800; margin-bottom: 6px; letter-spacing: 0.5px;">
            ★ ঐতিহ্যবাহী ও স্বাস্থ্যসম্মত খাবার ★
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #78350f; font-family: serif; letter-spacing: -0.5px;">
            ${HOTEL_INFO.nameBn}
          </h1>
          <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 700; color: #475569;">
            ${HOTEL_INFO.nameEn}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
            প্রোপাইটার: <strong>${HOTEL_INFO.proprietorBn}</strong> (${HOTEL_INFO.phone2})
          </p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">
            📍 ${HOTEL_INFO.locationBn}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #0284c7; font-weight: 600;">
            📞 মালিক: ${HOTEL_INFO.phone2} | হেল্পলাইন ও WhatsApp: ${HOTEL_INFO.phone1} | ✉ ${HOTEL_INFO.email}
          </p>
        </div>

        <div style="text-align: right; min-width: 200px;">
          <div style="background: #0f172a; color: #ffffff; padding: 8px 14px; border-radius: 10px; display: inline-block; text-align: right; margin-bottom: 8px;">
            <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: 800;">
              ${lang === 'bn' ? 'অফিসিয়াল ইনভয়েস' : 'OFFICIAL INVOICE'}
            </div>
            <div style="font-size: 16px; font-weight: 900; font-family: monospace; letter-spacing: 0.5px;">
              #${order.id}
            </div>
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>তারিখ:</strong> ${order.createdAt || new Date().toLocaleDateString('bn-BD')}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            <strong>ডকুমেন্ট নং:</strong> INV-${order.id.replace(/\D/g, '') || '9821'}-${Date.now().toString().slice(-4)}
          </div>
        </div>
      </div>

      <!-- Order & Customer Summary Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; margin-bottom: 20px;">
        
        <!-- Customer Info Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #0369a1; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            👤 গ্রাহকের বিবরণ (CUSTOMER DETAILS)
          </div>
          <table style="width: 100%; font-size: 11.5px; border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 0; color: #64748b; width: 85px;">নাম:</td>
              <td style="padding: 2px 0; font-weight: 700; color: #0f172a;">${order.customerName || 'সম্মানিত অতিথি'}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">মোবাইল:</td>
              <td style="padding: 2px 0; font-weight: 700; color: #0f172a; font-family: monospace;">${order.customerPhone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">ইমেইল:</td>
              <td style="padding: 2px 0; color: #334155;">${order.customerEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b; vertical-align: top;">ঠিকানা:</td>
              <td style="padding: 2px 0; color: #334155; font-weight: 600;">
                ${order.deliveryAddress || (order.orderType === 'dine_in' ? `হোটেল ডাইনিং (টেবিল ${order.tableNumber || '৩'})` : 'হোটেল কাউন্টার ডেলিভারি')}
              </td>
            </tr>
          </table>
        </div>

        <!-- Order Metadata Box -->
        <div style="background: #fdfaf7; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #c2410c; margin-bottom: 8px; border-bottom: 1px solid #ffedd5; padding-bottom: 4px;">
            📋 অর্ডারের স্থিতি ও মেথড
          </div>
          <table style="width: 100%; font-size: 11.5px; border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 0; color: #64748b; width: 95px;">অর্ডারের ধরন:</td>
              <td style="padding: 2px 0; font-weight: 700; color: #78350f;">${orderTypeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">স্ট্যাটাস:</td>
              <td style="padding: 2px 0; font-weight: 800; color: #047857;">${statusLabel}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">পেমেন্ট মেথড:</td>
              <td style="padding: 2px 0; font-weight: 700; text-transform: uppercase; color: #0f172a;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #64748b;">পেমেন্ট স্ট্যাটাস:</td>
              <td style="padding: 2px 0; font-weight: 800; color: #0369a1;">${paymentStatusLabel}</td>
            </tr>
            ${order.transactionId ? `
              <tr>
                <td style="padding: 2px 0; color: #64748b;">TrxID:</td>
                <td style="padding: 2px 0; font-family: monospace; font-weight: 700; color: #db2777;">${order.transactionId}</td>
              </tr>
            ` : ''}
          </table>
        </div>

      </div>

      <!-- Items Table -->
      <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 18px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                খাবারের বিবরণ (Item Details)
              </th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: center; width: 70px;">
                পরিমাণ
              </th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: right; width: 100px;">
                একক মূল্য
              </th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: right; width: 110px;">
                মোট টাকা
              </th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation & Breakdown -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px;">
        
        <!-- Left: Notes & Seal -->
        <div style="flex: 1; background: #fafaf9; border: 1px dashed #d6d3d1; border-radius: 12px; padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #44403c; margin-bottom: 4px;">
            📝 বিশেষ নির্দেশাবলী ও নোট:
          </div>
          <p style="font-size: 11px; color: #78716c; margin: 0; line-height: 1.5;">
            ${order.specialNote || 'খাবার সবসময় গরম ও স্বাস্থ্যসম্মতভাবে পরিবেশন করা হয়। আমাদের সাথে থাকার জন্য ধন্যবাদ!'}
          </p>
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
              ✓
            </div>
            <span style="font-size: 10.5px; color: #047857; font-weight: 700;">
              ডিজিটাল ভেরিফাইড অর্ডার রশিদ • হোটেল আল শেখ ফরিদ
            </span>
          </div>
        </div>

        <!-- Right: Grand Totals -->
        <div style="min-width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <table style="width: 100%; font-size: 12.5px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">খাবারের মোট মূল্য (Subtotal):</td>
              <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #1e293b;">৳ ${order.subtotal}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">ডেলিভারি / সার্ভিস চার্জ:</td>
              <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #1e293b;">
                ${order.deliveryFee === 0 ? '<span style="color:#059669;">ফ্রি (৳০)</span>' : `৳ ${order.deliveryFee}`}
              </td>
            </tr>
            ${order.discount && order.discount > 0 ? `
              <tr>
                <td style="padding: 4px 0; color: #dc2626;">বিশেষ ছাড় (Discount):</td>
                <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #dc2626;">- ৳ ${order.discount}</td>
              </tr>
            ` : ''}
            <tr style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">
              <td style="padding: 8px 0; font-size: 14px; font-weight: 900; color: #0f172a;">
                সর্বমোট পরিশোধিত (Total):
              </td>
              <td style="padding: 8px 0; font-size: 16px; font-weight: 900; text-align: right; color: #b45309;">
                ৳ ${order.total}
              </td>
            </tr>
          </table>
        </div>

      </div>

      <!-- Footer & Signature Section -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #64748b;">
        <div>
          <p style="margin: 0; font-weight: 700; color: #334155;">
            হোটেল আল শেখ ফরিদ — রেলওয়ে স্টেশন সংলগ্ন, জয়পুরহাট
          </p>
          <p style="margin: 2px 0 0 0;">
            মালিক: ${HOTEL_INFO.phone2} | হটলাইন ও WhatsApp: ${HOTEL_INFO.phone1} | ইমেইল: ${HOTEL_INFO.email}
          </p>
          <p style="margin: 2px 0 0 0; color: #94a3b8;">
            এটি একটি কম্পিউটার জেনারেটেড অর্ডার সারাংশ এবং অফিসিয়াল পেমেন্ট ভাউচার।
          </p>
        </div>

        <div style="text-align: center; width: 140px;">
          <div style="height: 35px; border-bottom: 1px dashed #94a3b8; margin-bottom: 4px; display: flex; align-items: flex-end; justify-content: center;">
            <span style="font-family: cursive; font-size: 13px; color: #0369a1; font-weight: bold;">Al Sheikh Farid</span>
          </div>
          <span style="font-size: 9.5px; font-weight: 700; color: #475569;">কর্তৃপক্ষের স্বাক্ষর / সিল</span>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution (retina 2x)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const sanitizedId = order.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `Hotel_Al_Sheikh_Farid_Order_${sanitizedId}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate Order Summary PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
