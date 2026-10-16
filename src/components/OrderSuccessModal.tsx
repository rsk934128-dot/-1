import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Mail, 
  PhoneCall, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Receipt,
  X,
  FileDown,
  Loader2,
  Check,
  MessageCircle,
  Star,
  Sparkles,
  Send,
  ThumbsUp,
  Award,
  ShieldCheck,
  Utensils,
  PackageCheck,
  Heart,
  Smile,
  Flame,
  Coins
} from 'lucide-react';
import { Order, Review, UserProfile, OrderStatus } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { downloadOrderSummaryPdf } from '../utils/pdfGenerator';
import { openDirectWhatsApp } from '../utils/whatsappHelper';
import { printOrderReceipt } from '../utils/printReceiptHelper';
import { PrintableOrderReceipt } from './PrintableOrderReceipt';
import { ThermalReceiptView } from './ThermalReceiptView';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenCall: () => void;
  onOpenEmailInvoice: (order: Order) => void;
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
  onAwardPoints?: (points: number, reasonBn: string) => void;
  user?: UserProfile;
  lang: 'bn' | 'en';
  onOpenShopMap?: () => void;
  onOpenRateMeal?: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onOpenCall,
  onOpenEmailInvoice,
  onAddReview,
  onUpdateOrderStatus,
  onAwardPoints,
  user,
  lang,
  onOpenShopMap,
  onOpenRateMeal,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);

  // Status simulation / Interactive toggle
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'cooking');

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [foodHoverRating, setFoodHoverRating] = useState<number>(0);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [serviceHoverRating, setServiceHoverRating] = useState<number>(0);
  const [selectedFoodItem, setSelectedFoodItem] = useState<string>('');
  const [passengerType, setPassengerType] = useState<string>('আন্তঃনগর ট্রেন যাত্রী');
  const [selectedTags, setSelectedTags] = useState<string[]>(['খাঁটি ঘরোয়া স্বাদ', 'গরম ও টাটকা']);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerPhone, setReviewerPhone] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [submittedReviewData, setSubmittedReviewData] = useState<{
    foodRating: number;
    serviceRating: number;
    foodName: string;
    comment: string;
  } | null>(null);

  // Initialize values from order
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
      setReviewerName(order.customerName || user?.name || '');
      setReviewerPhone(order.customerPhone || user?.phone || '');
      
      const firstItem = order.items?.[0]?.food;
      if (firstItem) {
        setSelectedFoodItem(firstItem.nameBn);
      } else {
        setSelectedFoodItem('হোটেল আল শেখ ফরিদ স্পেশাল খাবার');
      }

      if (order.orderType === 'dine_in') {
        setPassengerType('ডাইন-ইন টেবিল গ্রাহক');
      } else if (order.orderType === 'parcel') {
        setPassengerType('পার্সেল / টেক-অ্যাওয়ে যাত্রী');
      } else {
        setPassengerType('স্টেশন হোম ডেলিভারি গ্রাহক');
      }

      // If order is already completed, show feedback form by default
      if (order.status === 'completed') {
        setShowFeedbackForm(true);
      }
    }
  }, [order, user]);

  if (!order) return null;

  const handlePrint = () => {
    if (!order) return;
    printOrderReceipt(order, lang);
  };

  const handleDownloadPdf = async () => {
    if (!order) return;
    setIsDownloadingPdf(true);
    try {
      await downloadOrderSummaryPdf(order, lang);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Mark order as completed / received
  const handleMarkAsCompleted = () => {
    setCurrentStatus('completed');
    if (onUpdateOrderStatus && order) {
      onUpdateOrderStatus(order.id, 'completed');
    }
    setShowFeedbackForm(true);
  };

  // Quick reaction tags
  const availableTags = [
    { bn: 'খাঁটি ঘরোয়া স্বাদ', en: 'Authentic Taste' },
    { bn: 'গরম ও টাটকা', en: 'Hot & Fresh' },
    { bn: 'দ্রুত ডেলিভারি', en: 'Fast Delivery' },
    { bn: 'চমৎকার প্যাকিং', en: 'Neat Packing' },
    { bn: 'পর্যাপ্ত পরিমাণ', en: 'Generous Portion' },
    { bn: 'ন্যায্য মূল্য', en: 'Value for Money' },
    { bn: 'আন্তরিক ব্যবহার', en: 'Courteous Staff' },
  ];

  const handleToggleTag = (tagBn: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagBn) ? prev.filter((t) => t !== tagBn) : [...prev, tagBn]
    );
  };

  // Rating labels
  const foodRatingLabels: Record<number, { bn: string; en: string }> = {
    5: { bn: 'অসাধারণ স্বাদ! খাঁটি ও সেরা মান (5/5)', en: 'Outstanding! Authentic & Best Taste (5/5)' },
    4: { bn: 'খুব ভালো স্বাদ ও মান (4/5)', en: 'Very Good Taste & Quality (4/5)' },
    3: { bn: 'মোটামুটি ভালো (3/5)', en: 'Average / Decent (3/5)' },
    2: { bn: 'আরও ভালো করার সুযোগ আছে (2/5)', en: 'Needs Improvement (2/5)' },
    1: { bn: 'সন্তোষজনক নয় (1/5)', en: 'Unsatisfied (1/5)' },
  };

  const serviceRatingLabels: Record<number, { bn: string; en: string }> = {
    5: { bn: 'দ্রুততম ও আন্তরিক সেবা (5/5)', en: 'Super fast & Courteous (5/5)' },
    4: { bn: 'ভালো ও সময়োপযোগী ডেলিভারি (4/5)', en: 'Good & Timely Service (4/5)' },
    3: { bn: 'চলতি মান (3/5)', en: 'Decent (3/5)' },
    2: { bn: 'দেরি হয়েছে (2/5)', en: 'Slow Service (2/5)' },
    1: { bn: 'খারাপ সেবা (1/5)', en: 'Poor Service (1/5)' },
  };

  // Submit feedback & review
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    setIsSubmittingReview(true);

    const finalComment = feedbackComment.trim() 
      ? feedbackComment.trim() 
      : `${selectedTags.join(', ')}। খাবারের স্বাদ এবং সার্ভিস চমৎকার লেগেছে।`;

    const newReviewPayload: Omit<Review, 'id' | 'createdAt' | 'likes'> = {
      customerName: reviewerName.trim(),
      customerPhone: reviewerPhone ? reviewerPhone.trim().replace(/(\d{5})\d{3}(\d{3})/, '$1-***$2') : undefined,
      rating: foodRating,
      serviceRating: serviceRating,
      foodName: selectedFoodItem || order.items[0]?.food?.nameBn || 'হোটেল আল শেখ ফরিদ স্পেশাল',
      passengerType,
      comment: finalComment,
      verifiedOrder: true,
      orderId: order.id,
      tags: selectedTags,
    };

    if (onAddReview) {
      onAddReview(newReviewPayload);
    }

    // Award bonus loyalty points for feedback
    if (onAwardPoints) {
      onAwardPoints(15, `অর্ডার #${order.id} এ রিভিউ দেওয়ায় বোনাস পয়েন্ট`);
    }

    setSubmittedReviewData({
      foodRating,
      serviceRating,
      foodName: selectedFoodItem || order.items[0]?.food?.nameBn || 'স্পেশাল খাবার',
      comment: finalComment,
    });

    setIsSubmittingReview(false);
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-6">
        
        {/* Top Success Banner */}
        <div className={`p-5 sm:p-6 text-white text-center relative ${
          currentStatus === 'completed' 
            ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800' 
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-13 h-13 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg mb-2.5">
            {currentStatus === 'completed' ? (
              <PackageCheck className="w-8 h-8 text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-amber-600" />
            )}
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold font-serif">
            {currentStatus === 'completed' 
              ? (lang === 'bn' ? 'অর্ডার ডেলিভারি সফলভাবে সম্পন্ন হয়েছে!' : 'Order Successfully Delivered & Completed!')
              : (lang === 'bn' ? 'অর্ডার সফলভাবে গৃহীত হয়েছে!' : 'Order Placed Successfully!')}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            {currentStatus === 'completed'
              ? (lang === 'bn' ? 'খাবার উপভোগ করুন! নিচে আপনার মূল্যবান মতামত ও রেটিং জানান' : 'Enjoy your meal! Please rate your experience below')
              : (lang === 'bn' ? 'হোটেল আল শেখ ফরিদ আপনার খাবার যত্নসহকারে প্রস্তুত করছে' : 'Hotel Al Sheikh Farid is preparing your meal with care')}
          </p>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[66vh] overflow-y-auto" id="printable-order-receipt">
          
          {/* Header Info */}
          <div className="text-center pb-3 border-b border-stone-200">
            <h4 className="font-serif font-black text-base text-stone-900">{HOTEL_INFO.nameBn}</h4>
            <p className="text-xs text-stone-500">প্রোপাইটার: {HOTEL_INFO.proprietorBn} ({HOTEL_INFO.phone2})</p>
            <p className="text-[11px] text-stone-500">{HOTEL_INFO.locationBn} | হেল্পলাইন: {HOTEL_INFO.phone1}</p>
          </div>

          {/* Token & Order ID Pill */}
          <div className="flex justify-between items-center bg-amber-50/90 p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                {lang === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}
              </span>
              <p className="font-mono text-sm font-black text-amber-950">{order.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                {lang === 'bn' ? 'টাইমস্ট্যাম্প' : 'Time'}
              </span>
              <p className="text-xs font-semibold text-stone-700">{order.createdAt}</p>
            </div>
          </div>

          {/* Order Status Progress Stepper */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-stone-600">{lang === 'bn' ? 'অর্ডারের বর্তমান অবস্থা:' : 'Current Order Status:'}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                currentStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentStatus === 'on_the_way'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {currentStatus === 'completed' 
                  ? (lang === 'bn' ? '✓ ডেলিভারি সম্পন্ন (Completed)' : '✓ Completed')
                  : currentStatus === 'on_the_way'
                  ? (lang === 'bn' ? '🛵 ডেলিভারির পথে (On the way)' : '🛵 On the way')
                  : currentStatus === 'cooking'
                  ? (lang === 'bn' ? '🍳 রান্না হচ্ছে (Cooking)' : '🍳 Cooking')
                  : (lang === 'bn' ? 'অপেক্ষমান (Pending)' : 'Pending')}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                ১. অর্ডার কনফার্মড ✓
              </div>
              <div className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                currentStatus === 'cooking' || currentStatus === 'on_the_way' || currentStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-stone-200 text-stone-600 border-stone-300'
              }`}>
                ২. রান্না ও প্রস্তুতি ✓
              </div>
              <div className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                currentStatus === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-stone-200 text-stone-600 border-stone-300'
              }`}>
                ৩. ডেলিভারি সম্পন্ন {currentStatus === 'completed' ? '✓' : ''}
              </div>
            </div>

            {/* Quick action to Mark Completed if not yet completed */}
            {currentStatus !== 'completed' && (
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-500">
                  {lang === 'bn' ? 'খাবার হাতে পেলে সম্পন্ন চিহ্নিত করুন:' : 'Mark completed once received:'}
                </span>
                <button
                  type="button"
                  onClick={handleMarkAsCompleted}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'খাবার পেয়েছি (সম্পন্ন)' : 'Mark Received'}</span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION: FEEDBACK & RATING FORM (Appears when completed or user expands) */}
          {/* ========================================================================= */}
          {(currentStatus === 'completed' || showFeedbackForm) && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-100/70 border-2 border-amber-400 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Feedback Form Header */}
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-950 font-serif flex items-center gap-1.5">
                      <span>{lang === 'bn' ? 'খাবার ও সেবার মান রিভিউ' : 'Rate Food & Service Quality'}</span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-stone-950">
                        {lang === 'bn' ? '+১৫ পয়েন্ট রিওয়ার্ড' : '+15 Pts'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-amber-800">
                      {lang === 'bn' ? 'আপনার মূল্যবান মতামত সরাসরি ভেরিফাইড রিভিউ হিসেবে যুক্ত হবে' : 'Your feedback will be published to verified customer reviews'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'bn' ? 'ভেরিফাইড অর্ডার' : 'Verified Order'}</span>
                </span>
              </div>

              {onOpenRateMeal && order && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRateMeal(order);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  <Star className="w-4 h-4 fill-stone-950" />
                  <span>{lang === 'bn' ? '⭐ প্রতিটি পদের নির্দিষ্ট মূল্যায়ন দিন (Rate My Meal)' : '⭐ Rate My Meal (Item-Specific Ratings)'}</span>
                </button>
              )}

              {/* POST-SUBMISSION STATE */}
              {reviewSubmitted && submittedReviewData ? (
                <div className="p-4 bg-white rounded-2xl border border-emerald-400 text-center space-y-3 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-bold text-stone-900 font-serif">
                      {lang === 'bn' ? '🎉 আপনার রিভিউ সফলভাবে প্রকাশিত হয়েছে!' : '🎉 Feedback Published Successfully!'}
                    </h5>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {lang === 'bn' 
                        ? 'হোটেল আল শেখ ফরিদের সাথে থাকার জন্য ধন্যবাদ। আপনার রিভিউ কাস্টমার রিভিউ তালিকায় যোগ হয়েছে।' 
                        : 'Thank you for your valuable feedback. It has been added to our public reviews.'}
                    </p>
                  </div>

                  {/* Submitted Card Preview */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{reviewerName}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{submittedReviewData.foodRating}.0 / 5.0</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">পদ: {submittedReviewData.foodName}</p>
                    <p className="text-stone-700 italic text-[11px]">"{submittedReviewData.comment}"</p>
                    
                    <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-600" />
                        <span>+১৫ লয়্যালটি বোনাস পয়েন্ট ক্রেডিট হয়েছে</span>
                      </span>
                      <span>✓ ভেরিফাইড অর্ডার #{order.id}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE FEEDBACK FORM */
                <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                  
                  {/* Rating 1: Food Quality Rating */}
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-600" />
                        <span>{lang === 'bn' ? '১. খাবারের স্বাদ ও গুণমান রেটিং:' : '1. Food Taste & Quality Rating:'}</span>
                      </span>
                      <span className="text-[11px] font-black text-amber-700">
                        {foodHoverRating || foodRating} / 5
                      </span>
                    </label>

                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFoodHoverRating(star)}
                          onMouseLeave={() => setFoodHoverRating(0)}
                          onClick={() => setFoodRating(star)}
                          className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              (foodHoverRating || foodRating) >= star
                                ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-center font-semibold text-amber-900 bg-amber-50/80 py-1 rounded-xl">
                      {foodRatingLabels[foodHoverRating || foodRating]?.[lang] || ''}
                    </p>
                  </div>

                  {/* Rating 2: Service & Delivery Quality */}
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'bn' ? '২. ডেলিভারি ও সেবার মান রেটিং:' : '2. Service & Delivery Rating:'}</span>
                      </span>
                      <span className="text-[11px] font-black text-emerald-700">
                        {serviceHoverRating || serviceRating} / 5
                      </span>
                    </label>

                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setServiceHoverRating(star)}
                          onMouseLeave={() => setServiceHoverRating(0)}
                          onClick={() => setServiceRating(star)}
                          className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                              (serviceHoverRating || serviceRating) >= star
                                ? 'text-emerald-500 fill-emerald-500 drop-shadow-sm'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-center font-semibold text-emerald-900 bg-emerald-50/80 py-1 rounded-xl">
                      {serviceRatingLabels[serviceHoverRating || serviceRating]?.[lang] || ''}
                    </p>
                  </div>

                  {/* Which Food Item Are You Reviewing */}
                  <div className="space-y-1 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 block">
                      {lang === 'bn' ? 'প্রধান খাবার নির্বাচন করুন:' : 'Select Food Item Reviewed:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {order.items.map((item, i) => {
                        const name = lang === 'bn' ? item.food.nameBn : item.food.nameEn;
                        const isSelected = selectedFoodItem === item.food.nameBn;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedFoodItem(item.food.nameBn)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-amber-100'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSelectedFoodItem('সবগুলো খাবার')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selectedFoodItem === 'সবগুলো খাবার'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-amber-100'
                        }`}
                      >
                        {lang === 'bn' ? 'সব খাবার সামগ্রিক' : 'All Items'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Tags Chips */}
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 block">
                      {lang === 'bn' ? 'দ্রুত অভিজ্ঞতা ট্যাগ (ক্লিক করে নির্বাচন করুন):' : 'Quick Feedback Tags:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((tag, idx) => {
                        const isSelected = selectedTags.includes(tag.bn);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleTag(tag.bn)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {lang === 'bn' ? tag.bn : tag.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Type / Dining Mode */}
                  <div className="space-y-1 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 block">
                      {lang === 'bn' ? 'আপনার গ্রাহক ধরন:' : 'Customer Dining Type:'}
                    </label>
                    <select
                      value={passengerType}
                      onChange={(e) => setPassengerType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                    >
                      <option value="আন্তঃনগর ট্রেন যাত্রী">আন্তঃনগর ট্রেন যাত্রী (Railway Passenger)</option>
                      <option value="রেলওয়ে স্টেশন লোকাল গ্রাহক">রেলওয়ে স্টেশন লোকাল গ্রাহক (Station Local)</option>
                      <option value="ডাইন-ইন টেবিল গ্রাহক">ডাইন-ইন টেবিল গ্রাহক (Dine-In)</option>
                      <option value="পার্সেল টেক-অ্যাওয়ে যাত্রী">পার্সেল টেক-অ্যাওয়ে যাত্রী (Takeaway)</option>
                      <option value="হোম ডেলিভারি গ্রাহক">হোম ডেলিভারি গ্রাহক (Delivery)</option>
                    </select>
                  </div>

                  {/* Written Comment Textarea */}
                  <div className="space-y-1 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'বিস্তারিত মন্তব্য বা অভিজ্ঞতা লিখুন:' : 'Detailed Feedback / Experience:'}</span>
                      <span className="text-[10px] text-stone-400">(ঐচ্ছিক)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder={lang === 'bn' 
                        ? 'খাবারের স্বাদ, ঝাল-লবণ বা ডেলিভারি কেমন ছিল? আপনার অভিজ্ঞতা লিখুন...' 
                        : 'Share your thoughts about taste, seasoning or delivery speed...'}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setFeedbackComment('খাবারটি অত্যন্ত সুস্বাদু এবং ধোঁয়া ওঠা গরম ছিল! ধন্যবাদ হোটেল আল শেখ ফরিদ।')}
                        className="text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md font-medium cursor-pointer"
                      >
                        + খুব সুস্বাদু ও গরম ছিল
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackComment('ট্রেন স্টেশনে খুব দ্রুত পার্সেল ডেলিভারি পেয়েছি। জিলাপি ও খিচুড়ি সেরা!')}
                        className="text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md font-medium cursor-pointer"
                      >
                        + ট্রেন স্টেশনে দ্রুত ডেলিভারি পেয়েছি
                      </button>
                    </div>
                  </div>

                  {/* Reviewer Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-0.5">
                        {lang === 'bn' ? 'আপনার নাম:*' : 'Your Name:*'}
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-0.5">
                        {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Phone Number:'}
                      </label>
                      <input
                        type="text"
                        value={reviewerPhone}
                        onChange={(e) => setReviewerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit Feedback Action */}
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewerName.trim()}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{lang === 'bn' ? 'রিভিউ জমা হচ্ছে...' : 'Submitting Feedback...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>{lang === 'bn' ? 'রিভিউ ও রেটিং পোস্ট করুন (কাস্টমার ফিডব্যাক)' : 'Submit Review & Rating'}</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Customer & Delivery Mode */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">{lang === 'bn' ? 'গ্রাহকের নাম:' : 'Customer:'}</span>
              <span className="font-bold text-stone-900">{order.customerName} ({order.customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{lang === 'bn' ? 'অর্ডারের ধরন:' : 'Order Type:'}</span>
              <span className="font-bold text-amber-800">
                {order.orderType === 'dine_in' ? `হোটেলে খাওয়া (${order.tableNumber})` : order.orderType === 'parcel' ? 'পার্সেল / টেক-অ্যাওয়ে' : 'হোম ডেলিভারি'}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-stone-500">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                <span className="font-medium text-stone-900 text-right max-w-[220px]">{order.deliveryAddress}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-stone-200">
              <span className="text-stone-500">{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
              <span className="font-bold text-emerald-700 uppercase">
                {order.paymentMethod} {order.transactionId ? `(TrxID: ${order.transactionId})` : ''} - {order.paymentStatus === 'paid' || order.paymentStatus === 'verified' ? (lang === 'bn' ? 'পরিশোধিত' : 'PAID') : (lang === 'bn' ? 'বাকি/ক্যাশ' : 'CASH DUE')}
              </span>
            </div>

            {/* Self-Pickup Store Location Guidance */}
            {order.orderType === 'parcel' && (
              <div className="pt-2 mt-2 border-t border-amber-200 bg-amber-50 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <span className="font-black text-amber-950 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{lang === 'bn' ? 'দোকানে এসে খাবার সংগ্রহের স্থান:' : 'Store Pickup Location:'}</span>
                  </span>
                  <p className="text-[11px] text-amber-800">
                    {HOTEL_INFO.nameBn} - {HOTEL_INFO.locationBn} (রেলওয়ে স্টেশন মেইন গেট)
                  </p>
                </div>
                {onOpenShopMap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenShopMap();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? '🗺️ দোকানের ম্যাপ দেখুন' : '🗺️ View Map'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <div className="bg-stone-100 px-3 py-2 text-[11px] font-bold text-stone-700 flex justify-between">
              <span>{lang === 'bn' ? 'খাবারের নাম' : 'Item'}</span>
              <span>{lang === 'bn' ? 'পরিমাণ x মূল্য' : 'Qty x Price'}</span>
            </div>
            <div className="divide-y divide-stone-100 p-1">
              {order.items.map((item, idx) => {
                const itemPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;
                return (
                  <div key={idx} className="p-2 flex justify-between text-xs items-center">
                    <div>
                      <p className="font-bold text-stone-900">
                        {lang === 'bn' ? item.food.nameBn : item.food.nameEn}
                      </p>
                      {item.selectedPortion && (
                        <p className="text-[10px] text-stone-500">
                          {lang === 'bn' ? item.selectedPortion.labelBn : item.selectedPortion.labelEn}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-stone-600">{item.quantity} x ৳{itemPrice}</span>
                      <p className="font-bold text-stone-950">৳ {item.quantity * itemPrice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Calculation Summary */}
          <div className="space-y-1 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>{lang === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
              <span className="font-medium text-stone-900">৳ {order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{lang === 'bn' ? 'লয়্যালটি পয়েন্ট ছাড়:' : 'Points Discount:'}</span>
                <span>- ৳ {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{lang === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
              <span className="font-medium text-stone-900">
                {order.deliveryFee === 0 ? (lang === 'bn' ? 'ফ্রি' : 'Free') : `৳ ${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>{lang === 'bn' ? 'সর্বমোট পরিশোধিত:' : 'Total Amount:'}</span>
              <span className="text-amber-700 text-base">৳ {order.total}</span>
            </div>
          </div>

          {/* Dedicated Thermal POS Receipt Quick Action Card */}
          <div className="p-3 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl border border-stone-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
                  <span>{lang === 'bn' ? 'থার্মাল পিওএস ক্যাশ মেমো' : 'Thermal POS Cash Memo'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    58mm / 80mm
                  </span>
                </h5>
                <p className="text-[10px] text-stone-400">
                  {lang === 'bn' ? 'ক্যাশ কাউন্টার ও কিচেন রোল প্রিন্টারের উপযোগী রসিদ' : 'Ready for counter & kitchen thermal roll printers'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowThermalReceipt(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'রসিদ দেখুন' : 'View POS'}</span>
            </button>
          </div>

          {/* Prompt to leave feedback if not yet open */}
          {currentStatus !== 'completed' && !showFeedbackForm && (
            <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-950">
                  {lang === 'bn' ? 'খাবার পাওয়ার পর আপনার মূল্যবান মতামত দিন' : 'Rate food & service quality once delivered'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackForm(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] shrink-0 cursor-pointer hover:bg-amber-700"
              >
                {lang === 'bn' ? 'রিভিউ ফর্ম খুলুন' : 'Leave Review'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-stone-800 shadow-xs'
              }`}
              title="PDF অর্ডার রসিদ ডাউনলোড"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{lang === 'bn' ? 'ডাউনলোড সম্পন্ন ✓' : 'Downloaded ✓'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'PDF চালান' : 'PDF Receipt'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowThermalReceipt(true)}
              className="p-2.5 rounded-xl border border-amber-500 bg-amber-50 hover:bg-amber-100 text-stone-900 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              title={lang === 'bn' ? 'থার্মাল প্রিন্টার ক্যাশ মেমো ভিউ ও প্রিন্ট' : 'Thermal POS receipt view & print'}
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>{lang === 'bn' ? 'থার্মাল রসিদ' : 'Thermal Receipt'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="প্রিন্ট রশিদ"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={() => openDirectWhatsApp(order, undefined, lang)}
              className="p-2.5 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="WhatsApp এ অর্ডার ডিটেইলস পাঠান"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'WhatsApp' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={() => onOpenEmailInvoice(order)}
              className="p-2.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="ইমেইল রিসিট পাঠান"
            >
              <Mail className="w-4 h-4 text-purple-600" />
              <span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCall}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>{lang === 'bn' ? 'কল' : 'Call'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {lang === 'bn' ? 'ঠিক আছে' : 'Done'}
            </button>
          </div>
        </div>
      </div>
      {/* Hidden container formatted specifically for browser POS printing */}
      <PrintableOrderReceipt order={order} lang={lang} />

      {/* Dedicated Thermal Receipt View Component Modal */}
      {showThermalReceipt && (
        <ThermalReceiptView
          order={order}
          lang={lang}
          onClose={() => setShowThermalReceipt(false)}
          onDirectPrint={() => window.print()}
        />
      )}
    </div>
  );
};
