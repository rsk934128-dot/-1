import { GoogleGenAI } from '@google/genai';
import { HOTEL_INFO, INITIAL_FOOD_ITEMS } from '../data/initialData';

export async function askChefAIAssistant(
  userQuery: string,
  language: 'bn' | 'en' = 'bn'
): Promise<string> {
  const menuContext = INITIAL_FOOD_ITEMS.map(
    (item) =>
      `- ${item.nameBn} (${item.nameEn}): ৳${item.price} প্রতি ${item.unitBn} (ক্যাটাগরি: ${item.category}, বিবরণ: ${item.descriptionBn})`
  ).join('\n');

  const systemPrompt = `
You are "শেফ বারিক এআই" (Chef Barik AI), the virtual friendly culinary advisor and hotel assistant for "হোটেল আল শেখ ফরিদ" (Hotel Al Sheikh Farid), owned by proprietor "মোহাম্মদ আব্দুল বারিক শেখ" (Md. Abdul Barik Sheikh), located at Railway Station Road.

Here is the exact official menu and price list:
${menuContext}

Hotel details:
- Opening hours: 6:00 AM to 12:00 Midnight.
- Specialty: জিলাপি (১৬০ ৳/কেজি), স্পেশাল ভুনা খিচুড়ি (৩০ ৳), কষা গরুর মাংস (৮০ ৳), তাজা রুই/ছোট মাছ/পাঙ্গাস মাছ (৬০-৮০ ৳), ভাত (২০ ৳), পরোটা (২০ ৳), ডাল (১০ ৳), ডিম (২০ ৳), সিঙ্গারা (১০ ৳), মালাই চা (১০ ৳)।
- Delivery in station area, Dine-in at tables, Parcel for train travelers.
- Payment accepted via bKash, Nagad, Rocket, Cash.

Instructions:
1. Always be polite, warm, welcoming, and hospitable in traditional Bangladeshi style.
2. If customer asks for meal combos within a specific budget (e.g. ৫০ টাকা, ১০০ টাকা, ১৫০ টাকা), calculate exact total price matching the menu items and recommend the most delicious and filling meal combinations!
3. If customer is in a rush to catch a train, suggest instant items (ভাত, ডাল, ডিম, খিচুড়ি, সিঙ্গারা, গরম জিলাপি).
4. Answer directly in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'} in a crisp, appetizing and friendly tone. Keep responses under 100 words.
`;

  try {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nCustomer query: "${userQuery}"`,
      });
      if (response && response.text) {
        return response.text;
      }
    }
  } catch (err) {
    console.warn('Gemini API call skipped or failed, using smart offline fallback response:', err);
  }

  // Smart Offline Fallback Logic
  const q = userQuery.toLowerCase();
  if (q.includes('বাজেট') || q.includes('টাকা') || q.includes('দাম') || q.includes('budget') || q.includes('price') || q.includes('৫০') || q.includes('100') || q.includes('১০০')) {
    return language === 'bn'
      ? `স্বাগতম! ৫০ টাকার সেরা কম্বো: স্পেশাল ভুনা খিচুড়ি (৩০ ৳) + ডিম ভুনা (২০ ৳) = মোট ৫০ ৳! অথবা ১০০ টাকার কম্বো: সাদা ভাত (২০ ৳) + কষা গরুর মাংস (৮০ ৳) = ১০০ ৳। সাথে এক কাপ স্পেশাল মালাই চা (১০ ৳) যোগ করতে পারেন!`
      : `Welcome! 50 Tk Combo: Special Bhuna Khichuri (৳30) + Egg Curry (৳20) = ৳50! Or 100 Tk Combo: Plain Rice (৳20) + Tender Beef Curry (৳80) = ৳100!`;
  }

  if (q.includes('ট্রেন') || q.includes('তাড়াতাড়ি') || q.includes('দ্রুত') || q.includes('train') || q.includes('fast') || q.includes('rush')) {
    return language === 'bn'
      ? `ট্রেন ধরার দ্রুত খাবার: গরম খিচুড়ি (৩০ ৳), ডিম ভুনা (২০ ৳) বা গরম সিঙ্গারা (১০ ৳) ও জিলাপি (১৬০ ৳/কেজি) পার্সেল করে নিতে পারেন। মাত্র ২-৩ মিনিটে পার্সেল প্রস্তুত হয়ে যাবে!`
      : `In a rush for your train? Hot Khichuri (৳30) or Egg Curry (৳20) with hot Jilapi (৳160/kg) can be parceled in just 2-3 minutes!`;
  }

  if (q.includes('জিলাপি') || q.includes('jilapi') || q.includes('sweet') || q.includes('মিষ্টি')) {
    return language === 'bn'
      ? `আমাদের বিখ্যাত রসালো মচমচে জিলাপি প্রতি কেজি মাত্র ১৬০ টাকা! ২৫০ গ্রাম ৪০ ৳ ও আধা কেজি ৮০ ৳। গরম গরম কড়াই থেকে পরিবেশন করা হয়।`
      : `Our famous hot syrupy crispy Jilapi is ৳160 per kg! 250g for ৳40 and 500g for ৳80.`;
  }

  if (q.includes('মাংস') || q.includes('গরু') || q.includes('beef') || q.includes('meat')) {
    return language === 'bn'
      ? `আমাদের হোটেলের প্রধান আকর্ষণ কষা গরুর মাংস মাত্র ৮০ টাকা পিস (ঝোলসহ)! গরম ভাতের (২০ ৳) সাথে এক অনন্য তৃপ্তি!`
      : `Our signature traditional Beef Curry is ৳80 per piece with rich gravy. Perfect with hot plain rice (৳20)!`;
  }

  return language === 'bn'
    ? `হোটেল আল শেখ ফরিদ-এ আপনাকে স্বাগতম! প্রোপাইটার মোহাম্মদ আব্দুল বারিক শেখের তত্ত্বাবধানে আমাদের সব খাবার টাটকা ও ঘরোয়া স্বাদে তৈরি। আপনি কি ভাত, খিচুড়ি, মাংস, মাছ নাকি মিষ্টি জিলাপি অর্ডার করতে চান?`
    : `Welcome to Hotel Al Sheikh Farid! Managed by Md. Abdul Barik Sheikh. How may I assist your meal selection today?`;
}
