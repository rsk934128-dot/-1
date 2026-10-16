import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  X, 
  Check, 
  Share2, 
  Sparkles, 
  UtensilsCrossed, 
  Download, 
  Loader2, 
  Filter, 
  Phone, 
  MapPin, 
  Info,
  Calendar,
  Clock,
  QrCode,
  Flame,
  Award
} from 'lucide-react';
import { FoodItem, FoodCategory } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { downloadDailyMenuPdf, printDailyMenuDirect } from '../utils/menuPdfGenerator';

interface PrintableDailyMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItems: FoodItem[];
  lang?: 'bn' | 'en';
}

export const PrintableDailyMenuModal: React.FC<PrintableDailyMenuModalProps> = ({
  isOpen,
  onClose,
  foodItems,
  lang = 'bn',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories: { id: FoodCategory; labelBn: string; labelEn: string; icon: string }[] = [
    { id: 'all', labelBn: 'সকল আইটেম', labelEn: 'All Categories', icon: '🍽️' },
    { id: 'breakfast', labelBn: 'সকালের নাস্তা', labelEn: 'Breakfast', icon: '🍳' },
    { id: 'lunch_dinner', labelBn: 'দুপুর ও রাত', labelEn: 'Lunch & Dinner', icon: '🍛' },
    { id: 'fish_meat', labelBn: 'মাছ ও মাংস', labelEn: 'Fish & Meat', icon: '🐟' },
    { id: 'sweets_snacks', labelBn: 'মিষ্টি ও স্ন্যাক্স', labelEn: 'Sweets & Snacks', icon: '🍯' },
    { id: 'beverage', labelBn: 'চা ও পানীয়', labelEn: 'Tea & Drinks', icon: '☕' },
  ];

  const displayedItems = selectedCategory === 'all'
    ? foodItems
    : foodItems.filter(item => item.category === selectedCategory);

  const currentLang: 'bn' | 'en' = lang === 'en' ? 'en' : 'bn';

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadDailyMenuPdf(foodItems, {
        category: selectedCategory,
        lang: currentLang,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    printDailyMenuDirect(displayedItems, currentLang);
  };

  const handleShareMenu = () => {
    const text = `${HOTEL_INFO.nameBn} - দৈনিক খাবারের মেনু তালিকা ও রেট কার্ড\n📍 ${HOTEL_INFO.locationBn}\n📞 কল/WhatsApp: ${HOTEL_INFO.phone1}\nওয়েবসাইট: https://ais-pre-5noa4rgmntakcycowas2ol-480315954464.asia-east1.run.app`;
    if (navigator.share) {
      navigator.share({
        title: `${HOTEL_INFO.nameBn} Daily Menu`,
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 border-b border-amber-500/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <FileDown className="w-3 h-3" />
                {lang === 'bn' ? 'প্রিন্টার-ফ্রেন্ডলি মেনু' : 'Printer-Friendly Daily Menu'}
              </span>
              <span className="text-xs text-amber-200 font-bold hidden sm:inline">
                {currentDateFormatted}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
              {lang === 'bn' ? 'দৈনিক খাবারের মেনু ডাউনলোড ও প্রিন্ট' : 'Download & Print Walk-in Daily Menu'}
            </h3>

            <p className="text-xs text-stone-300 max-w-xl">
              {lang === 'bn' 
                ? 'হোটেলের সম্মানিত ওয়াক-ইন গেস্ট এবং পার্সেল গ্রাহকদের জন্য পরিচ্ছন্ন ও হাই-রেজোলিউশন বাংলা পিডিএফ ফরম্যাট।' 
                : 'Generate a clean, official A4 printable PDF and print sheet of current food items, portion sizes and prices.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Category Filter Ribbon */}
        <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-xl no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? foodItems.length 
                : foodItems.filter(f => f.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
                  <span className={`text-[10px] px-1 rounded-md ${isSelected ? 'bg-amber-600 text-stone-950 font-black' : 'bg-stone-900 text-stone-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Download High-Res PDF Menu"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-white" />
                  <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Print Menu Immediately"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Menu'}</span>
            </button>

            {/* Share / Copy Button */}
            <button
              onClick={handleShareMenu}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all cursor-pointer"
              title="Share Menu"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-stone-300" />}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {pdfSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? '✓ দৈনিক মেনু পিডিএফ সফলভাবে ডাউনলোড করা হয়েছে!' : '✓ Daily Menu PDF downloaded successfully!'}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">{lang === 'bn' ? 'A4 পেজ ফরম্যাট' : 'A4 Format'}</span>
          </div>
        )}

        {/* Paper Document Preview Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-900/50">
          <div className="max-w-3xl mx-auto bg-white text-stone-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-300 text-left font-sans">
            
            {/* Paper Header */}
            <div className="border-b-2 border-stone-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] mb-1">
                  <Award className="w-3 h-3 text-amber-700" />
                  <span>১৯৯৮ সাল থেকে খাঁটি স্বাদ ও ঐতিহ্য</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif leading-tight">
                  {HOTEL_INFO.nameBn}
                </h1>
                <p className="text-xs font-bold text-stone-600">{HOTEL_INFO.nameEn}</p>
                <div className="text-[11px] text-stone-600 mt-1 space-y-0.5">
                  <p>প্রোপাইটার: <strong>{HOTEL_INFO.proprietorBn}</strong> ({HOTEL_INFO.phone2})</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-stone-500" /> {HOTEL_INFO.locationBn}</p>
                  <p className="flex items-center gap-1 text-blue-700 font-bold">
                    <Phone className="w-3 h-3" /> মালিক: {HOTEL_INFO.phone2} | হেল্পলাইন: {HOTEL_INFO.phone1}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-stone-50 p-3 rounded-xl border border-stone-200 shrink-0">
                <div className="bg-stone-900 text-amber-400 px-2.5 py-1 rounded text-[10px] font-black tracking-wider uppercase inline-block">
                  দৈনিক রেট কার্ড • DAILY MENU
                </div>
                <div className="text-xs font-bold text-stone-800 mt-1.5">
                  {currentDateFormatted}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  খোলা: {HOTEL_INFO.openingHoursBn}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  বিকাশ/নগদ: {HOTEL_INFO.bkashNumber}
                </div>
              </div>
            </div>

            {/* Quick Food Items Table Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 pb-1 border-b border-stone-200">
                <span>খাবারের বিবরণ ও সাইজ ({displayedItems.length}টি পদ)</span>
                <span>মূল্য (টাকা)</span>
              </div>

              <div className="divide-y divide-stone-100">
                {displayedItems.map((food, idx) => (
                  <div key={food.id} className="py-2.5 flex items-start justify-between gap-4 hover:bg-amber-50/50 px-1.5 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-stone-900">
                          {idx + 1}. {food.nameBn}
                        </span>
                        {food.isSpecial && (
                          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                            স্পেশাল
                          </span>
                        )}
                        {food.isHot && (
                          <span className="bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                            গরম
                          </span>
                        )}
                        <span className="text-[10px] text-stone-500 font-medium">({food.nameEn})</span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        {food.descriptionBn}
                      </p>

                      {food.portions && food.portions.length > 0 && (
                        <div className="text-[10px] text-amber-800 font-semibold flex flex-wrap gap-1.5 pt-0.5">
                          {food.portions.map((p, pIdx) => (
                            <span key={pIdx} className="bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                              {p.labelBn}: ৳{p.price}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-amber-900 font-mono">
                        ৳{food.price}
                      </div>
                      <div className="text-[10px] font-semibold text-stone-500">
                        প্রতি {food.unitBn}
                      </div>
                      <div className="text-[9.5px] font-bold mt-0.5">
                        {food.inStock ? (
                          <span className="text-emerald-600">মজুদ আছে ✓</span>
                        ) : (
                          <span className="text-red-500">স্টক শেষ</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paper Footer */}
            <div className="mt-6 pt-4 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-600">
              <div>
                <p className="font-bold text-stone-800">
                  হোটেল আল শেখ ফরিদ — রেলওয়ে স্টেশন এলাকা, জয়পুরহাট
                </p>
                <p>পার্সেল, ক্যাটারিং ও ট্রেনের সিটে খাবারের জন্য সরাসরি যোগাযোগ করুন।</p>
              </div>

              <div className="text-center sm:text-right font-mono text-[11px] text-amber-900 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                হটলাইন ও WhatsApp: 01761869921
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'bn' 
                ? 'পিডিএফ ডাউনলোড করলে স্বয়ংক্রিয়ভাবে A4 পেজ সাইজে হাই-কোয়ালিটি বাংলা ফন্টে সেভ হবে।' 
                : 'PDF downloads in crisp A4 layout with full Unicode Bengali typography.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-stone-950" />
              <span>{lang === 'bn' ? 'পিডিএফ সেভ করুন' : 'Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer transition-colors"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
