import { Order, UserProfile } from '../types';
import { HOTEL_INFO } from '../data/initialData';

/**
 * Clean and format hotel phone number into international WhatsApp format (Bangladesh: 880...)
 */
export const getWhatsAppFormattedNumber = (phone: string = HOTEL_INFO.phone1): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return `88${cleaned}`;
  }
  return `880${cleaned}`;
};

/**
 * Generate a pre-filled WhatsApp message for an order or a general inquiry
 */
export const generateWhatsAppOrderMessage = (
  order?: Order,
  user?: UserProfile,
  lang: 'bn' | 'en' = 'bn'
): string => {
  if (!order) {
    if (lang === 'bn') {
      return `আসসালামু আলাইকুম, হোটেল আল শেখ ফরিদ। আমি খাবার অর্ডার এবং আজকের স্পেশাল মেনু সম্পর্কে জানতে চাই।`;
    }
    return `Hello Hotel Al Sheikh Farid, I would like to inquire about food ordering and today's special menu.`;
  }

  const itemsList = order.items
    .map((item) => {
      const portionText = item.selectedPortion 
        ? (lang === 'bn' ? ` (${item.selectedPortion.labelBn})` : ` (${item.selectedPortion.labelEn})`) 
        : '';
      const foodName = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
      const unitPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
      const totalPrice = unitPrice * item.quantity;
      return `• ${foodName}${portionText} x ${item.quantity} = ৳${totalPrice}`;
    })
    .join('\n');

  const orderTypeLabel = 
    order.orderType === 'dine_in' 
      ? (lang === 'bn' ? `টেবিলে খাওয়া (টেবিল #${order.tableNumber || 'সাধারণ'})` : `Dine-in (Table #${order.tableNumber || 'General'})`)
      : order.orderType === 'parcel'
      ? (lang === 'bn' ? 'কাউন্টার পার্সেল' : 'Takeaway / Parcel')
      : (lang === 'bn' ? `হোম ডেলিভারি (${order.deliveryAddress || 'স্টেশন সংলগ্ন'})` : `Home Delivery (${order.deliveryAddress || 'Station area'})`);

  const paymentLabel = 
    order.paymentMethod === 'bkash' ? 'bKash (বিকাশ)' :
    order.paymentMethod === 'nagad' ? 'Nagad (নগদ)' :
    order.paymentMethod === 'rocket' ? 'Rocket (রকেট)' : 'Cash on Delivery (ক্যাশ)';

  const customerName = order.customerName || user?.name || 'সম্মানিত অতিথি';
  const customerPhone = order.customerPhone || user?.phone || 'প্রযোজ্য নয়';

  if (lang === 'bn') {
    return `🍽️ *হোটেল আল শেখ ফরিদ - অর্ডার বিবরণী*
━━━━━━━━━━━━━━━━━━━
🧾 *অর্ডার আইডি:* #${order.id}
👤 *গ্রাহকের নাম:* ${customerName}
📞 *মোবাইল নম্বর:* ${customerPhone}
📍 *অর্ডারের ধরন:* ${orderTypeLabel}
🕒 *তারিখ ও সময়:* ${order.createdAt}

🍲 *খাবারের তালিকা:*
${itemsList}

💰 *সর্বমোট বিল:* ৳${order.total}
💳 *পেমেন্ট পদ্ধতি:* ${paymentLabel} (${order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'})
${order.specialNote ? `📝 *বিশেষ নির্দেশনা:* ${order.specialNote}\n` : ''}━━━━━━━━━━━━━━━━━━━
_আমি এই অর্ডারটির বিষয়ে আপডেট ও বিস্তারিত তথ্য জানতে চাচ্ছি। ধন্যবাদ!_`;
  }

  return `🍽️ *Hotel Al Sheikh Farid - Order Details*
━━━━━━━━━━━━━━━━━━━
🧾 *Order ID:* #${order.id}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Order Type:* ${orderTypeLabel}
🕒 *Placed At:* ${order.createdAt}

🍲 *Item List:*
${itemsList}

💰 *Total Amount:* ৳${order.total}
💳 *Payment Method:* ${paymentLabel} (${order.paymentStatus})
${order.specialNote ? `📝 *Special Note:* ${order.specialNote}\n` : ''}━━━━━━━━━━━━━━━━━━━
_I would like to get an update on this order. Thank you!_`;
};

/**
 * Construct full WhatsApp Direct Link
 */
export const getWhatsAppUrl = (
  order?: Order,
  user?: UserProfile,
  lang: 'bn' | 'en' = 'bn',
  phoneNumber: string = HOTEL_INFO.phone1
): string => {
  const formattedPhone = getWhatsAppFormattedNumber(phoneNumber);
  const text = generateWhatsAppOrderMessage(order, user, lang);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Trigger opening WhatsApp with a custom phone and custom text
 */
export const openDirectCustomWhatsApp = (
  phone: string,
  message: string
): void => {
  const formattedPhone = getWhatsAppFormattedNumber(phone);
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Trigger opening WhatsApp in a new browser tab/window
 */
export const openDirectWhatsApp = (
  order?: Order,
  user?: UserProfile,
  lang: 'bn' | 'en' = 'bn',
  phoneNumber: string = HOTEL_INFO.phone1
): void => {
  const url = getWhatsAppUrl(order, user, lang, phoneNumber);
  window.open(url, '_blank', 'noopener,noreferrer');
};
