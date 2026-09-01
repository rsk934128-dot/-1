import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FoodItem, FoodCategory } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface GenerateMenuOptions {
  category?: FoodCategory;
  lang?: 'bn' | 'en';
  title?: string;
}

const CATEGORY_NAMES_BN: Record<string, { label: string; icon: string }> = {
  breakfast: { label: 'সকালের নাস্তা (Breakfast)', icon: '🍳' },
  lunch_dinner: { label: 'দুপুর ও রাতের প্রধান খাবার (Lunch & Dinner)', icon: '🍛' },
  fish_meat: { label: 'তাজা মাছ ও দেশি মাংস (Fish & Meat Specials)', icon: '🐟' },
  sweets_snacks: { label: 'রসালো মিষ্টি ও বৈকালিক নাস্তা (Sweets & Snacks)', icon: '🍯' },
  beverage: { label: 'স্পেশাল চা ও পানীয় (Tea & Beverages)', icon: '☕' },
};

export async function downloadDailyMenuPdf(
  foodItems: FoodItem[],
  options: GenerateMenuOptions = {}
): Promise<void> {
  const lang = options.lang || 'bn';
  const selectedCat = options.category || 'all';

  const itemsToDisplay = selectedCat === 'all'
    ? foodItems
    : foodItems.filter(f => f.category === selectedCat);

  // Group items by category
  const categoriesMap: Record<string, FoodItem[]> = {};
  itemsToDisplay.forEach(item => {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = [];
    }
    categoriesMap[item.category].push(item);
  });

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const englishDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '820px'; // A4 proportional width at standard DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.padding = '32px 36px';
  container.style.zIndex = '-999';

  // Build categorized HTML sections
  const categoryKeys = ['breakfast', 'lunch_dinner', 'fish_meat', 'sweets_snacks', 'beverage'].filter(
    k => categoriesMap[k] && categoriesMap[k].length > 0
  );

  const categoriesHtml = categoryKeys.map(catKey => {
    const info = CATEGORY_NAMES_BN[catKey] || { label: catKey, icon: '🍽️' };
    const list = categoriesMap[catKey];

    const rowsHtml = list.map((food, idx) => {
      const isAvailable = food.inStock;
      const portionsBadge = food.portions && food.portions.length > 0
        ? `<div style="font-size: 9.5px; color: #b45309; margin-top: 2px;">
             ${food.portions.map(p => `${lang === 'bn' ? p.labelBn : p.labelEn}: ৳${p.price}`).join(' • ')}
           </div>`
        : '';

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${idx % 2 === 0 ? '#ffffff' : '#fafaf9'};">
          <td style="padding: 8px 10px; width: 45%;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; font-size: 12.5px; color: #0f172a;">${food.nameBn}</span>
              ${food.isSpecial ? '<span style="background: #ef4444; color: white; font-size: 8.5px; font-weight: 900; padding: 1px 4px; border-radius: 4px;">স্পেশাল</span>' : ''}
              ${food.isHot ? '<span style="background: #f59e0b; color: #78350f; font-size: 8.5px; font-weight: 900; padding: 1px 4px; border-radius: 4px;">গরম</span>' : ''}
            </div>
            <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-top: 1px;">
              ${food.nameEn} ${food.availableTimesBn ? `(${food.availableTimesBn})` : ''}
            </div>
            ${food.descriptionBn ? `<div style="font-size: 9.5px; color: #6b7280; margin-top: 2px; line-height: 1.3;">${food.descriptionBn}</div>` : ''}
            ${portionsBadge}
          </td>

          <td style="padding: 8px 10px; text-align: center; width: 20%; font-size: 11px; color: #475569; font-weight: 600;">
            ${lang === 'bn' ? food.unitBn : food.unitEn}
          </td>

          <td style="padding: 8px 10px; text-align: right; width: 20%;">
            <span style="font-size: 14px; font-weight: 900; color: #b45309; font-family: monospace;">
              ৳ ${food.price}
            </span>
          </td>

          <td style="padding: 8px 10px; text-align: center; width: 15%;">
            ${isAvailable 
              ? '<span style="color: #059669; font-weight: 800; font-size: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px;">মজুদ আছে</span>' 
              : '<span style="color: #dc2626; font-weight: 800; font-size: 10px; background: #fef2f2; border: 1px solid #fecaca; padding: 2px 6px; border-radius: 4px;">শেষ</span>'}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; page-break-inside: avoid;">
        <div style="background: #1e293b; color: #ffffff; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 800; font-size: 12px; letter-spacing: 0.3px;">
            <span style="margin-right: 6px;">${info.icon}</span> ${info.label}
          </div>
          <div style="font-size: 10px; color: #94a3b8; font-weight: 600;">
            ${list.length}টি আইটেম
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; font-size: 9.5px; text-transform: uppercase; color: #475569; font-weight: 800;">
              <th style="padding: 6px 10px;">খাবারের নাম ও বিবরণ</th>
              <th style="padding: 6px 10px; text-align: center;">পরিমাণ / একক</th>
              <th style="padding: 6px 10px; text-align: right;">মূল্য (BDT)</th>
              <th style="padding: 6px 10px; text-align: center;">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="max-width: 750px; margin: 0 auto; background: #ffffff;">
      
      <!-- Top Decorative Ribbon -->
      <div style="height: 6px; background: linear-gradient(90deg, #d97706, #b45309, #059669, #dc2626); border-radius: 4px; margin-bottom: 16px;"></div>

      <!-- Hotel Official Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #e2e8f0; margin-bottom: 14px;">
        <div>
          <div style="display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 10px; font-weight: 800; margin-bottom: 4px;">
            ★ ১৯৯৮ সাল থেকে ঐতিহ্যবাহী ও স্বাস্থ্যসম্মত খাবার ★
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #78350f; font-family: serif; letter-spacing: -0.5px;">
            ${HOTEL_INFO.nameBn}
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color: #475569;">
            ${HOTEL_INFO.nameEn}
          </p>
          <p style="margin: 3px 0 0 0; font-size: 10.5px; color: #64748b;">
            প্রোপাইটার: <strong>${HOTEL_INFO.proprietorBn}</strong> (${HOTEL_INFO.proprietorEn})
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">
            📍 ${HOTEL_INFO.locationBn} (সান্তাহার / জয়পুরহাট রেলওয়ে স্টেশন)
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #0284c7; font-weight: 700;">
            📞 অর্ডার ও টেবিল বুকিং: ${HOTEL_INFO.phone1} | ${HOTEL_INFO.phone2} | ✉ ${HOTEL_INFO.email}
          </p>
        </div>

        <div style="text-align: right; min-width: 210px;">
          <div style="background: #0f172a; color: #ffffff; padding: 6px 12px; border-radius: 8px; display: inline-block; text-align: right; margin-bottom: 6px;">
            <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: 800;">
              দৈনিক খাবারের মূল্যতালিকা
            </div>
            <div style="font-size: 13px; font-weight: 800; font-family: sans-serif;">
              OFFICIAL DAILY MENU
            </div>
          </div>
          <div style="font-size: 10.5px; color: #334155; font-weight: 700;">
            তারিখ: ${currentDate}
          </div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">
            ${englishDate}
          </div>
          <div style="font-size: 9.5px; color: #059669; font-weight: 700; margin-top: 2px;">
            সময়: ${HOTEL_INFO.openingHoursBn}
          </div>
        </div>
      </div>

      <!-- Notice & Highlights Box for Walk-in Guests -->
      <div style="background: #fdfaf7; border: 1px solid #fed7aa; border-radius: 8px; padding: 8px 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
        <div style="color: #78350f;">
          <strong>📢 গ্রাহকদের জন্য বিশেষ বার্তা:</strong> সব খাবার টাটকা উপকরণে রান্না করা হয়। পার্সেল ও ট্রেনের সিটে দ্রুত ডেলিভারির সুবিধা রয়েছে।
        </div>
        <div style="background: #ffffff; border: 1px solid #f97316; color: #c2410c; padding: 2px 8px; border-radius: 4px; font-weight: 800; shrink-0;">
          bKash / Nagad: 01761869921
        </div>
      </div>

      <!-- Menu Categories & Item Tables -->
      <div style="margin-bottom: 14px;">
        ${categoriesHtml}
      </div>

      <!-- Bottom Terms & Footer -->
      <div style="border-top: 1.5px dashed #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9px; color: #64748b;">
        <div>
          <div style="font-weight: 800; color: #1e293b; font-size: 10px;">
            হোটেল আল শেখ ফরিদ — রেলওয়ে স্টেশন এলাকা
          </div>
          <div>পরিষ্কার পরিচ্ছন্ন ডাইনিং স্পেস ও সুলভ মূল্যে ঘরোয়া খাবারের নিশ্চয়তা।</div>
          <div style="color: #94a3b8; margin-top: 2px;">
            * বাজারমূল্য অনুযায়ী দৈনিক খাবারের দাম কিছুটা পরিবর্তিত হতে পারে। ভ্যাট প্রযোজ্য নয়।
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-weight: 700; color: #0f172a;">অনলাইন অর্ডার ও লাইভ কল:</div>
          <div style="font-family: monospace; color: #0284c7; font-weight: 700;">www.hotelalsheikhfarid.com</div>
          <div style="color: #059669; font-weight: 700; margin-top: 1px;">সরাসরি ক্যাশ বা ডিজিটাল পেমেন্ট গ্রহণযোগ্য</div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
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

    // If height exceeds one page, paginate
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const todaySlug = new Date().toISOString().slice(0, 10);
    const filename = `Hotel_Al_Sheikh_Farid_Daily_Menu_${todaySlug}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate Daily Menu PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Direct browser print function for instant Walk-In Counter Paper Printing
 */
export function printDailyMenuDirect(foodItems: FoodItem[], lang: 'bn' | 'en' = 'bn'): void {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rows = foodItems.map((food, idx) => `
    <tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-weight: bold;">
        ${idx + 1}. ${food.nameBn} <span style="font-size: 9px; font-weight: normal; color: #555;">(${food.nameEn})</span>
      </td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: center;">${food.unitBn}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">৳${food.price}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: center; color: ${food.inStock ? '#047857' : '#b91c1c'};">
        ${food.inStock ? 'উপলব্ধ' : 'শেষ'}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Menu - ${HOTEL_INFO.nameBn}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #111; margin: 0; padding: 10px; font-size: 11px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .title { font-size: 20px; font-weight: 900; color: #78350f; }
          .subtitle { font-size: 11px; color: #333; margin-top: 2px; }
          .meta { font-size: 10px; color: #555; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f3f4f6; padding: 6px 8px; border-bottom: 2px solid #333; font-size: 10px; text-transform: uppercase; }
          .footer { margin-top: 20px; text-align: center; font-size: 9.5px; border-top: 1px dashed #777; padding-top: 8px; color: #444; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${HOTEL_INFO.nameBn}</div>
          <div class="subtitle">${HOTEL_INFO.nameEn} — প্রোপাইটার: ${HOTEL_INFO.proprietorBn}</div>
          <div class="meta">📍 ${HOTEL_INFO.locationBn} | 📞 ${HOTEL_INFO.phone1}, ${HOTEL_INFO.phone2}</div>
          <div class="meta" style="font-weight: bold; margin-top: 4px;">আজকের দৈনিক খাবারের মূল্যতালিকা • তারিখ: ${currentDate}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">খাবারের নাম</th>
              <th style="text-align: center;">পরিমাণ</th>
              <th style="text-align: right;">মূল্য (টাকা)</th>
              <th style="text-align: center;">মজুদ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div>হোটেল আল শেখ ফরিদ এ আপনাকে স্বাগতম • গরম ও স্বাস্থ্যসম্মত খাবারের নির্ভরযোগ্য ঠিকানা</div>
          <div>বিকাশ ও নগদ পেমেন্ট: ${HOTEL_INFO.bkashNumber}</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
