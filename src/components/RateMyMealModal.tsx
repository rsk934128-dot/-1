import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Check, 
  Sparkles, 
  Award, 
  MessageSquare, 
  Heart, 
  ThumbsUp, 
  Package, 
  Clock, 
  Utensils, 
  ChefHat, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, MealRating, ItemFeedback, UserProfile } from '../types';
import { SoundNotificationService } from '../services/soundNotificationService';

interface RateMyMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSaveRating: (orderId: string, rating: MealRating) => void;
  lang: 'bn' | 'en';
  user?: UserProfile;
}

const COMMON_ITEM_TAGS_BN = [
  'গরম ও টাটকা',
  'খাঁটি ঘরোয়া স্বাদ',
  'পর্যাপ্ত পরিমাণ',
  'ঝাল ও মশলা সঠিক',
  'নরম ও সুসিদ্ধ',
  'সুগন্ধি ঘিয়ের ঘ্রাণ',
  'কম ঝাল পছন্দ',
  'তেল একটু বেশি'
];

const COMMON_ITEM_TAGS_EN = [
  'Hot & Fresh',
  'Homestyle Taste',
  'Generous Portion',
  'Balanced Spices',
  'Tender & Soft',
  'Rich Aroma',
  'Prefer Mild Spice',
  'Slightly Oily'
];

const OVERALL_TAGS_BN = [
  'ট্রেনের সেরা খাবার',
  'দ্রুত ডেলিভারি',
  'পরিচ্ছন্ন প্যাকেজিং',
  'গরম ধোঁয়া ওঠা',
  'সাশ্রয়ী ও ন্যায্য দাম',
  'আবার অর্ডার করবো'
];

const OVERALL_TAGS_EN = [
  'Best Station Food',
  'Fast Service',
  'Clean Packaging',
  'Steaming Hot',
  'Great Value',
  'Will Order Again'
];

export const RateMyMealModal: React.FC<RateMyMealModalProps> = ({
  isOpen,
  onClose,
  order,
  onSaveRating,
  lang,
  user,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [overallHover, setOverallHover] = useState<number>(0);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [serviceHover, setServiceHover] = useState<number>(0);
  const [overallComment, setOverallComment] = useState<string>('');
  const [selectedOverallTags, setSelectedOverallTags] = useState<string[]>(['গরম ও টাটকা', 'খাঁটি ঘরোয়া স্বাদ']);
  const [itemFeedbacks, setItemFeedbacks] = useState<Record<string, { rating: number; tags: string[]; note: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Initialize form whenever order changes or modal opens
  useEffect(() => {
    if (!order) return;

    if (order.mealRating) {
      // Existing rating
      setOverallRating(order.mealRating.overallRating);
      setServiceRating(order.mealRating.serviceRating || 5);
      setOverallComment(order.mealRating.overallComment || '');
      setSelectedOverallTags(order.mealRating.quickTags || []);

      const existingMap: Record<string, { rating: number; tags: string[]; note: string }> = {};
      order.mealRating.itemFeedbacks.forEach((fb) => {
        existingMap[fb.foodId] = {
          rating: fb.rating,
          tags: fb.tags || [],
          note: fb.note || '',
        };
      });
      setItemFeedbacks(existingMap);
    } else {
      // New rating defaults
      setOverallRating(5);
      setServiceRating(5);
      setOverallComment('');
      setSelectedOverallTags(lang === 'bn' ? ['গরম ও টাটকা', 'খাঁটি ঘরোয়া স্বাদ'] : ['Hot & Fresh', 'Homestyle Taste']);

      const initialMap: Record<string, { rating: number; tags: string[]; note: string }> = {};
      order.items.forEach((it) => {
        initialMap[it.food.id] = {
          rating: 5,
          tags: [lang === 'bn' ? 'গরম ও টাটকা' : 'Hot & Fresh'],
          note: '',
        };
      });
      setItemFeedbacks(initialMap);
    }
    setIsSubmitted(false);
  }, [order, lang]);

  if (!isOpen || !order) return null;

  const handleItemRatingChange = (foodId: string, rating: number) => {
    setItemFeedbacks((prev) => ({
      ...prev,
      [foodId]: {
        ...(prev[foodId] || { tags: [], note: '' }),
        rating,
      },
    }));
  };

  const handleToggleItemTag = (foodId: string, tag: string) => {
    setItemFeedbacks((prev) => {
      const current = prev[foodId] || { rating: 5, tags: [], note: '' };
      const exists = current.tags.includes(tag);
      const nextTags = exists
        ? current.tags.filter((t) => t !== tag)
        : [...current.tags, tag];
      return {
        ...prev,
        [foodId]: {
          ...current,
          tags: nextTags,
        },
      };
    });
  };

  const handleItemNoteChange = (foodId: string, note: string) => {
    setItemFeedbacks((prev) => ({
      ...prev,
      [foodId]: {
        ...(prev[foodId] || { rating: 5, tags: [] }),
        note,
      },
    }));
  };

  const handleToggleOverallTag = (tag: string) => {
    setSelectedOverallTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const compiledItemFeedbacks: ItemFeedback[] = order.items.map((it) => {
      const fb = itemFeedbacks[it.food.id] || { rating: overallRating, tags: [], note: '' };
      return {
        foodId: it.food.id,
        foodNameBn: it.food.nameBn,
        foodNameEn: it.food.nameEn,
        rating: fb.rating,
        tags: fb.tags,
        note: fb.note,
      };
    });

    const mealRatingData: MealRating = {
      overallRating,
      serviceRating,
      overallComment: overallComment.trim(),
      quickTags: selectedOverallTags,
      itemFeedbacks: compiledItemFeedbacks,
      ratedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', আজ',
      customerName: order.customerName || user?.name || 'সম্মানিত অতিথি',
      awardedPoints: 15,
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6'],
      });
    } catch {
      // Canvas confetti fallback
    }

    SoundNotificationService.playNotificationChime();

    setTimeout(() => {
      onSaveRating(order.id, mealRatingData);
      setIsSubmitting(false);
      setIsSubmitted(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    }, 400);
  };

  const getRatingLabel = (score: number) => {
    if (lang === 'bn') {
      switch (score) {
        case 5: return 'অসাধারণ ও পারফেক্ট! ★★★★★';
        case 4: return 'খুব ভালো ও সুস্বাদু ★★★★☆';
        case 3: return 'মোটামুটি / ভালো ★★★☆☆';
        case 2: return 'সন্তোষজনক নয় ★★☆☆☆';
        case 1: return 'খারাপ ★☆☆☆☆';
        default: return '';
      }
    } else {
      switch (score) {
        case 5: return 'Outstanding & Delicious! ★★★★★';
        case 4: return 'Very Good ★★★★☆';
        case 3: return 'Average / Decent ★★★☆☆';
        case 2: return 'Below Expectations ★★☆☆☆';
        case 1: return 'Poor ★☆☆☆☆';
        default: return '';
      }
    }
  };

  const itemTagsList = lang === 'bn' ? COMMON_ITEM_TAGS_BN : COMMON_ITEM_TAGS_EN;
  const overallTagsList = lang === 'bn' ? OVERALL_TAGS_BN : OVERALL_TAGS_EN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 text-white p-4 sm:p-5 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-lg">
                <Star className="w-5 h-5 fill-stone-950 text-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-amber-300 font-serif">
                    {lang === 'bn' ? 'রেট মাই মিল (খাবারের মান মূল্যায়ন)' : 'Rate My Meal'}
                  </h3>
                  <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    {order.id}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {lang === 'bn' 
                    ? 'আপনার খাবারের স্বাদ ও অভিজ্ঞতা শেয়ার করুন এবং পয়েন্ট রিওয়ার্ড নিন!' 
                    : 'Rate your ordered items and earn instant loyalty bonus points!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
              </div>
              <h4 className="text-lg font-black text-stone-900 font-serif">
                {lang === 'bn' ? 'রেটিং সফলভাবে সেভ হয়েছে!' : 'Rating Saved Successfully!'}
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                {lang === 'bn'
                  ? 'আপনার মূল্যায়ন ও ফিডব্যাক অর্ডার হিস্ট্রিতে সংরক্ষণ করা হয়েছে। আপনার একাউন্টে +১৫ রিওয়ার্ড পয়েন্ট যোগ হয়েছে!'
                  : 'Your feedback has been saved to your order history and +15 loyalty points have been awarded!'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Info & Bonus Points Pill */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-950">
                    {lang === 'bn' ? 'ফিডব্যাক বোনাস:' : 'Feedback Bonus:'}
                  </span>
                  <span className="text-xs font-black text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-300">
                    +১৫ পয়েন্ট রিওয়ার্ড
                  </span>
                </div>
                <div className="text-[11px] text-stone-600">
                  {order.orderType === 'dine_in' ? `টেবিল: ${order.tableNumber || 'ডাইন-ইন'}` : order.orderType === 'parcel' ? 'পার্সেল পিক-আপ' : 'স্টেশন ডেলিভারি'}
                </div>
              </div>

              {/* SECTION 1: OVERALL STAR RATING */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                    {lang === 'bn' ? '১. সার্বিক খাবারের সন্তুষ্টি (Overall Meal Rating)' : '1. Overall Meal Experience'}
                  </label>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'bn' ? 'খাবারের স্বাদ, মান ও প্রস্তুতি কেমন লেগেছে?' : 'How was the taste, quality and overall food?'}
                  </p>
                </div>

                {/* Big Star Selector */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (overallHover || overallRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        onMouseEnter={() => setOverallHover(star)}
                        onMouseLeave={() => setOverallHover(0)}
                        className="p-1 rounded-xl transition-transform active:scale-90 hover:scale-115 focus:outline-none cursor-pointer"
                        title={`${star} Star`}
                      >
                        <Star
                          className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-stone-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {getRatingLabel(overallRating)}
                </div>

                {/* Secondary Packaging/Service Rating */}
                <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-stone-600 font-medium">
                    {lang === 'bn' ? 'প্যাকেজিং ও পরিবেশন মান:' : 'Packaging & Delivery:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setServiceRating(st)}
                        onMouseEnter={() => setServiceHover(st)}
                        onMouseLeave={() => setServiceHover(0)}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            st <= (serviceHover || serviceRating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] font-bold text-stone-700 ml-1">
                      ({serviceRating}/5)
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ITEM-SPECIFIC FEEDBACK & RATINGS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                    {lang === 'bn' ? '২. প্রতিটি খাবারের নির্দিষ্ট মূল্যায়ন (Item-Specific Feedback)' : '2. Feedback Specific to Ordered Items'}
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {order.items.length} {lang === 'bn' ? 'টি পদ' : 'items'}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((it, idx) => {
                    const fb = itemFeedbacks[it.food.id] || { rating: 5, tags: [], note: '' };
                    const itemRating = fb.rating;
                    const itemTags = fb.tags;

                    return (
                      <div
                        key={it.food.id || idx}
                        className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5 hover:border-amber-300 transition-colors"
                      >
                        {/* Food Item Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={it.food.image}
                              alt={it.food.nameBn}
                              className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div>
                              <h5 className="text-xs font-bold text-stone-900 leading-tight">
                                {lang === 'bn' ? it.food.nameBn : it.food.nameEn}
                              </h5>
                              <p className="text-[11px] text-stone-500">
                                {it.selectedPortion ? (lang === 'bn' ? it.selectedPortion.labelBn : it.selectedPortion.labelEn) : ''} • {it.quantity} {lang === 'bn' ? it.food.unitBn : it.food.unitEn}
                              </p>
                            </div>
                          </div>

                          {/* Star Rating for this item */}
                          <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200 shrink-0">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleItemRatingChange(it.food.id, r)}
                                className="p-0.5 cursor-pointer hover:scale-120 transition-transform"
                                title={`${r} Star`}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    r <= itemRating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-[11px] font-black text-amber-800 ml-1">
                              {itemRating}/5
                            </span>
                          </div>
                        </div>

                        {/* Quick Tags for this specific item */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-stone-500 font-semibold block">
                            {lang === 'bn' ? 'পদটির বিশেষ গুণাবলী বা মতামত:' : 'Quick tags for this item:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {itemTagsList.map((tag) => {
                              const active = itemTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleItemTag(it.food.id, tag)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border ${
                                    active
                                      ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-2xs'
                                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  {active ? '✓ ' : '+ '}
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick short note input */}
                        <div>
                          <input
                            type="text"
                            placeholder={lang === 'bn' ? `এই পদটি সম্পর্কে কোনো বিশেষ মন্তব্য (ঐচ্ছিক)` : 'Quick note about this item (optional)'}
                            value={fb.note}
                            onChange={(e) => handleItemNoteChange(it.food.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 text-[11px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: OVERALL QUICK TAGS */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  {lang === 'bn' ? '৩. সার্বিক অভিজ্ঞতার ট্যাগ' : '3. Overall Quick Highlights'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {overallTagsList.map((tag) => {
                    const active = selectedOverallTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleOverallTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                          active
                            ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {active ? '✓ ' : ''}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: WRITTEN FEEDBACK & SUGGESTIONS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  {lang === 'bn' ? '৪. আপনার বিস্তারিত মন্তব্য বা পরামর্শ (ঐচ্ছিক)' : '4. Additional Comments & Suggestions (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'খাবারটি কেমন উপভোগ করলেন? শেফ বা হোটেল স্টাফদের জন্য আপনার কোনো প্রশংসা বা পরামর্শ থাকলে জানান...'
                      : 'Share your compliments or suggestions for the kitchen and staff...'
                  }
                  className="w-full p-3 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'পরে মূল্যায়ন করবো' : 'Skip for Now'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Star className="w-4 h-4 fill-stone-950" />
                  <span>
                    {isSubmitting 
                      ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') 
                      : (lang === 'bn' ? 'রেটিং ও ফিডব্যাক সেভ করুন' : 'Submit & Save Rating')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
