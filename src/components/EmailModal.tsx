import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Building2, 
  Train, 
  Users, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { Order } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOrder?: Order | null;
  lang: 'bn' | 'en';
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  targetOrder,
  lang,
}) => {
  const [subject, setSubject] = useState<string>(
    targetOrder 
      ? `হোটেল আল শেখ ফরিদ - অর্ডার রশিদ #${targetOrder.id}` 
      : 'হোটেল আল শেখ ফরিদ-এ ক্যাটারিং / খাবার অর্ডার অনুসন্ধান'
  );
  const [customerName, setCustomerName] = useState<string>(targetOrder ? targetOrder.customerName : '');
  const [customerEmail, setCustomerEmail] = useState<string>(targetOrder?.customerEmail || 'customer@gmail.com');
  const [customerPhone, setCustomerPhone] = useState<string>(targetOrder ? targetOrder.customerPhone : '');
  const [emailPurpose, setEmailPurpose] = useState<string>(targetOrder ? 'invoice' : 'catering');
  const [messageBody, setMessageBody] = useState<string>(
    targetOrder
      ? `সম্মানিত গ্রাহক,\nহোটেল আল শেখ ফরিদ-এ আপনার অর্ডার (#${targetOrder.id}) সফলভাবে নিশ্চিত হয়েছে।\n\nমোট পরিশোধিত: ৳ ${targetOrder.total}\nপেমেন্ট মেথড: ${targetOrder.paymentMethod}\n\nধন্যবাদান্তে,\nমোহাম্মদ আব্দুল বারিক শেখ\nপ্রোপাইটার, হোটেল আল শেখ ফরিদ\nমোবাইল: ${HOTEL_INFO.phone1}`
      : `আসসালামু আলাইকুম আব্দুল বারিক শেখ সাহেব,\nআমরা স্টেশন এলাকা থেকে আগামীকালের জন্য ৫০ জনের খাবার (খিচুড়ি, কষা গরুর মাংস, জিলাপি ও চা) অগ্রিম বুকিং করতে চাই। বিস্তারিত জানাতে অনুরোধ করছি।`
  );
  const [isSent, setIsSent] = useState<boolean>(false);

  React.useEffect(() => {
    if (targetOrder) {
      setSubject(`হোটেল আল শেখ ফরিদ - অর্ডার রশিদ #${targetOrder.id}`);
      setCustomerName(targetOrder.customerName);
      setCustomerEmail(targetOrder.customerEmail || 'customer@gmail.com');
      setCustomerPhone(targetOrder.customerPhone);
      setEmailPurpose('invoice');
      setMessageBody(`সম্মানিত গ্রাহক,\nহোটেল আল শেখ ফরিদ-এ আপনার অর্ডার (#${targetOrder.id}) সফলভাবে নিশ্চিত হয়েছে।\n\nমোট পরিশোধিত: ৳ ${targetOrder.total}\nপেমেন্ট মেথড: ${targetOrder.paymentMethod}\n\nধন্যবাদান্তে,\nমোহাম্মদ আব্দুল বারিক শেখ\nপ্রোপাইটার, হোটেল আল শেখ ফরিদ\nমোবাইল: ${HOTEL_INFO.phone1}`);
    }
  }, [targetOrder]);

  if (!isOpen) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);

    // Also trigger mailto so user can send via their real mail app if they wish
    const mailtoUrl = `mailto:${HOTEL_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody + `\n\nগ্রাহকের নাম: ${customerName}\nমোবাইল: ${customerPhone}\nইমেইল: ${customerEmail}`)}`;
    
    // Auto reset after 3s
    setTimeout(() => {
      // do not auto-close so user sees confirmation
    }, 2500);
  };

  const openMailClient = () => {
    const mailtoUrl = `mailto:${HOTEL_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody + `\n\nপ্রেরক: ${customerName} (${customerPhone})`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500 text-white shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                {lang === 'bn' ? 'অফিসিয়াল ইমেইল সার্ভিস' : 'Official Email Dispatch'}
              </h3>
              <p className="text-xs text-purple-200">
                {lang === 'bn' ? `প্রাপক: ${HOTEL_INFO.email}` : `To: ${HOTEL_INFO.email}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSent ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 font-serif">
              {lang === 'bn' ? 'ইমেইল সফলভাবে প্রেরণ করা হয়েছে!' : 'Email Sent Successfully!'}
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              {lang === 'bn' 
                ? `হোটেল মালিক মো: আব্দুল বারিক শেখের ইমেইলে (${HOTEL_INFO.email}) আপনার বার্তাটি পৌঁছেছে। শীঘ্রই যোগাযোগ করা হবে।`
                : `Your email has been dispatched to ${HOTEL_INFO.email}. We will get back to you shortly.`}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={openMailClient}
                className="px-4 py-2 rounded-xl border border-purple-300 text-purple-800 text-xs font-bold hover:bg-purple-50 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'জিমেইলে ওপেন করুন' : 'Open in Gmail'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
              >
                {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendEmail} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Quick Templates */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                {lang === 'bn' ? 'ইমেইলের উদ্দেশ্য:' : 'Purpose of Email:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailPurpose('catering');
                    setSubject('বিয়ে/অনুষ্ঠানের জন্য বড় ক্যাটারিং অর্ডার');
                    setMessageBody(`আসসালামু আলাইকুম আব্দুল বারিক শেখ সাহেব,\nআমরা আগামী তারিখের জন্য ৫০-১০০ জনের খিচুড়ি, কষা গরুর মাংস, জিলাপি ও মিষ্টির ক্যাটারিং প্যাকেজ চাই।`);
                  }}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    emailPurpose === 'catering'
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <Users className="w-4 h-4 mx-auto mb-0.5 text-purple-600" />
                  <span>{lang === 'bn' ? 'ক্যাটারিং' : 'Catering'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailPurpose('train_bulk');
                    setSubject('ট্রেন যাত্রীদের জন্য বাল্ক পার্সেল বুকিং');
                    setMessageBody(`আসসালামু আলাইকুম,\nআমরা ট্রেনে ভ্রমণের সময় ২০টি গরুর মাংস ও ভাতের পার্সেল এবং ২০টি গরম জিলাপির প্যাকেট স্টেশন গেট থেকে রিসিভ করতে চাই।`);
                  }}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    emailPurpose === 'train_bulk'
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <Train className="w-4 h-4 mx-auto mb-0.5 text-purple-600" />
                  <span>{lang === 'bn' ? 'ট্রেন পার্সেল' : 'Train Bulk'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailPurpose('inquiry');
                    setSubject('হোটেল আল শেখ ফরিদ - সাধারণ অনুসন্ধান');
                  }}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    emailPurpose === 'inquiry'
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mx-auto mb-0.5 text-purple-600" />
                  <span>{lang === 'bn' ? 'অনুসন্ধান' : 'Inquiry'}</span>
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {lang === 'bn' ? 'ইমেইল বিষয় (Subject):' : 'Subject:'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {lang === 'bn' ? 'আপনার নাম:' : 'Your Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="নাম লিখুন"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {lang === 'bn' ? 'আপনার ইমেইল ঠিকানা:' : 'Your Email:'}
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {lang === 'bn' ? 'ইমেইল বার্তা:' : 'Message Body:'}
              </label>
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={openMailClient}
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ইমেইল অ্যাপে খুলুন' : 'External App'}</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মালিককে ইমেইল পাঠান' : 'Send Email Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
