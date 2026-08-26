import { getCachedAccessToken } from './firebase';
import { Order, UserProfile } from '../types';
import { HOTEL_INFO } from '../data/initialData';

export interface SendEmailParams {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  fromName?: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
}

/**
 * Encodes an RFC 2822 email message into base64url format for Gmail API.
 */
function createRawEmail(params: SendEmailParams): string {
  const fromHeader = `${params.fromName || 'হোটেল আল শেখ ফরিদ'} <me>`;
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;

  const emailLines = [
    `To: ${params.to}`,
    `From: ${fromHeader}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.bodyHtml,
  ];

  const rawMessage = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using Gmail API.
 */
export async function sendEmailViaGmail(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Gmail authentication required. Please sign in with Google.');
  }

  const raw = createRawEmail(params);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gmail API error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  return { success: true, id: data.id };
}

/**
 * Generates an itemized, responsive HTML invoice for Hotel Al Sheikh Farid food orders.
 */
export function generateOrderInvoiceHtml(order: Order, hotelInfo = HOTEL_INFO): string {
  const orderTypeLabel = 
    order.orderType === 'dine_in' 
      ? `টেবিলে খাওয়া (টেবিল নং: ${order.tableNumber || 'N/A'})` 
      : order.orderType === 'parcel' 
      ? 'পার্সেল / টেক-অ্যাওয়ে' 
      : `হোম / হোটেল ডেলিভারি (${order.deliveryAddress || 'স্টেশন রোড এলাকা'})`;

  const paymentLabel = 
    order.paymentMethod === 'bkash' 
      ? 'বিকাশ (bKash)' 
      : order.paymentMethod === 'nagad' 
      ? 'নগদ (Nagad)' 
      : order.paymentMethod === 'rocket' 
      ? 'রকেট (Rocket)' 
      : 'ক্যাশ অন ডেলিভারি / ক্যাশ পেমেন্ট';

  const rows = order.items.map((it) => {
    const unitPrice = it.selectedPortion ? it.selectedPortion.price : it.food.price;
    const subtotal = unitPrice * it.quantity;
    const portionLabel = it.selectedPortion ? ` (${it.selectedPortion.labelBn})` : '';

    return `
      <tr style="border-bottom: 1px solid #f1f1f1;">
        <td style="padding: 10px 8px; font-size: 14px; color: #1c1917; font-weight: 500;">
          ${it.food.nameBn} <span style="font-size: 12px; color: #78716c;">${portionLabel}</span>
        </td>
        <td style="padding: 10px 8px; text-align: center; font-size: 14px; color: #44403c;">${it.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 14px; color: #44403c;">৳ ${unitPrice}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 14px; font-weight: 700; color: #b45309;">৳ ${subtotal}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>খাবার ক্রয়ের অফিসিয়াল ইনভয়েস - হোটেল আল শেখ ফরিদ</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #fafaf9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1c1917 0%, #451a03 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #fbbf24;">হোটেল আল শেখ ফরিদ</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #fed7aa;">প্রোপাইটার: মো: আব্দুল বারিক শেখ • রেলওয়ে স্টেশন রোড</p>
      <div style="margin-top: 14px; display: inline-block; padding: 4px 12px; background: rgba(251, 191, 36, 0.2); border: 1px solid #fbbf24; border-radius: 20px; font-size: 12px; color: #ffffff; font-weight: bold;">
        অফিসিয়াল ডিজিটাল ক্যাশ মেমো / ইনভয়েস
      </div>
    </div>

    <!-- Order Details Meta -->
    <div style="padding: 20px 24px; background-color: #fffbeb; border-bottom: 1px solid #fde68a;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #78350f; padding: 3px 0;"><strong>অর্ডার নং:</strong> ${order.id}</td>
          <td style="color: #78350f; padding: 3px 0; text-align: right;"><strong>তারিখ ও সময়:</strong> ${order.createdAt}</td>
        </tr>
        <tr>
          <td style="color: #78350f; padding: 3px 0;"><strong>গ্রাহকের নাম:</strong> ${order.customerName}</td>
          <td style="color: #78350f; padding: 3px 0; text-align: right;"><strong>মোবাইল:</strong> ${order.customerPhone}</td>
        </tr>
        <tr>
          <td colspan="2" style="color: #78350f; padding: 4px 0;"><strong>অর্ডারের ধরন:</strong> ${orderTypeLabel}</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding: 20px 24px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #292524;">খাবারের তালিকা ও বিবরণ:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f4; border-bottom: 2px solid #e7e5e4; text-align: left;">
            <th style="padding: 10px 8px; font-size: 12px; font-weight: 700; color: #57534e;">আইটেম</th>
            <th style="padding: 10px 8px; font-size: 12px; font-weight: 700; color: #57534e; text-align: center;">পরিমাণ</th>
            <th style="padding: 10px 8px; font-size: 12px; font-weight: 700; color: #57534e; text-align: right;">মূল্য</th>
            <th style="padding: 10px 8px; font-size: 12px; font-weight: 700; color: #57534e; text-align: right;">মোট</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- Total Calculation -->
      <div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #e7e5e4; text-align: right;">
        <p style="margin: 4px 0; font-size: 13px; color: #57534e;">পেমেন্ট পদ্ধতি: <strong>${paymentLabel}</strong> ${order.transactionId ? `(TrxID: ${order.transactionId})` : ''}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #57534e;">পেমেন্ট স্ট্যাটাস: <strong style="color: ${order.paymentStatus === 'paid' ? '#15803d' : '#b45309'};">${order.paymentStatus === 'paid' ? 'পরিশোধিত (Paid) ✓' : 'ক্যাশ পেমেন্ট / প্রক্রিয়াধীন'}</strong></p>
        <div style="margin-top: 8px; padding: 8px 16px; background-color: #fef3c7; border-radius: 8px; display: inline-block;">
          <span style="font-size: 16px; font-weight: 800; color: #92400e;">সর্বমোট প্রদেয়: ৳ ${order.total}</span>
        </div>
      </div>

      ${order.specialNote ? `
        <div style="margin-top: 16px; padding: 10px 14px; background-color: #f5f5f4; border-radius: 8px; font-size: 12px; color: #44403c;">
          <strong>বিশেষ নির্দেশনা:</strong> ${order.specialNote}
        </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f4; padding: 18px 24px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1c1917;">হোটেল আল শেখ ফরিদ-এ অর্ডারের জন্য আপনাকে আন্তরিক ধন্যবাদ!</p>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #78716c;">যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন: <strong>${hotelInfo.phone1}</strong> (${hotelInfo.phone2}) | ${hotelInfo.email}</p>
      <p style="margin: 2px 0 0 0; font-size: 10px; color: #a8a29e;">রেলস্টেশন এলাকা, চব্বিশ ঘণ্টা তাজা ও সুস্বাদু খাবারের সেবা</p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Fetches recent order confirmation / hotel emails from Gmail.
 */
export async function fetchRecentOrderEmails(): Promise<GmailMessageItem[]> {
  const token = getCachedAccessToken();
  if (!token) return [];

  try {
    const query = encodeURIComponent('subject:("হোটেল আল শেখ ফরিদ" OR "ইনভয়েস" OR "Invoice")');
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.messages || [];
  } catch (err) {
    console.error('Error fetching Gmail messages:', err);
    return [];
  }
}
