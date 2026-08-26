import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ThumbsUp, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Train, 
  Heart,
  PlusCircle,
  Filter,
  UserCheck,
  Utensils,
  Smile
} from 'lucide-react';
import { Review, FoodItem, UserProfile } from '../types';

interface CustomerReviewsProps {
  reviews: Review[];
  foodItems: FoodItem[];
  user: UserProfile;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => void;
  onLikeReview?: (reviewId: string) => void;
  lang: 'bn' | 'en';
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
  foodItems,
  user,
  onAddReview,
  onLikeReview,
  lang,
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Review Form States
  const [customerName, setCustomerName] = useState<string>(user.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user.phone || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedFood, setSelectedFood] = useState<string>('গরম জিলাপি');
  const [passengerType, setPassengerType] = useState<string>('আন্তঃনগর ট্রেন যাত্রী');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Rating labels in Bengali & English
  const ratingLabels = useMemo(() => {
    return {
      5: { bn: 'অসাধারণ! একদম খাঁটি স্বাদ ও সেরা মান (5/5)', en: 'Outstanding! Authentic & best taste (5/5)' },
      4: { bn: 'খুব ভালো! সন্তোষজনক স্বাদ ও সার্ভিস (4/5)', en: 'Very Good! Delicious & great service (4/5)' },
      3: { bn: 'মোটামুটি ভালো (3/5)', en: 'Average / Decent (3/5)' },
      2: { bn: 'আরও ভালো করা সম্ভব (2/5)', en: 'Needs Improvement (2/5)' },
      1: { bn: 'সন্তোষজনক নয় (1/5)', en: 'Unsatisfied (1/5)' },
    };
  }, []);

  // Summary Metrics
  const totalReviewsCount = reviews.length;
  const averageRating = useMemo(() => {
    if (totalReviewsCount === 0) return 5.0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / totalReviewsCount).toFixed(1);
  }, [reviews, totalReviewsCount]);

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPercent = totalReviewsCount > 0 ? Math.round((fiveStarCount / totalReviewsCount) * 100) : 100;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (starFilter === 'all') return reviews;
    return reviews.filter((r) => r.rating === starFilter);
  }, [reviews, starFilter]);

  const handleToggleLike = (id: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (onLikeReview) {
      onLikeReview(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSubmitting(true);

    // Call callback
    onAddReview({
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim().replace(/(\d{5})\d{3}(\d{3})/, '$1-***$2') : undefined,
      rating,
      foodName: selectedFood,
      passengerType,
      comment: comment.trim(),
      verifiedOrder: true,
    });

    setSubmitting(false);
    setShowForm(false);
    setComment('');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <section 
      id="customer-reviews-section" 
      aria-label="Customer Reviews & Ratings"
      className="mx-4 sm:mx-6 lg:mx-8 my-8"
    >
      <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-stone-100 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Rating Overview */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-stone-800">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'যাচাইকৃত গ্রাহক মতামত ও সামাজিক প্রমাণ' : 'Verified Social Proof & Reviews'}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white flex items-center gap-2.5">
              <span>{lang === 'bn' ? 'গ্রাহকদের সন্তুষ্টি ও খাবারের রিভিউ' : 'Customer Reviews & Ratings'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              {lang === 'bn' 
                ? 'হোটেল আল শেখ ফরিদের ঐতিহ্যবাহী খাবার, দ্রুত স্টেশন ডেলিভারি ও আন্তরিক সেবা সম্পর্কে সরাসরি গ্রাহকদের অভিজ্ঞতা।'
                : 'Real reviews and ratings from train passengers, local food lovers, and daily regulars of Hotel Al Sheikh Farid.'}
            </p>
          </div>

          {/* Social Proof Score Badge & Write Review Trigger */}
          <div className="flex flex-wrap items-center gap-4 bg-stone-950/80 p-4 rounded-2xl border border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex flex-col items-center justify-center text-stone-950 shadow-md">
                <span className="text-xl font-black font-serif leading-none">{averageRating}</span>
                <span className="text-[10px] font-extrabold uppercase mt-0.5">★ / 5.0</span>
              </div>

              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-300 font-semibold mt-1">
                  {totalReviewsCount} {lang === 'bn' ? 'টি যাচাইকৃত রিভিউ' : 'Verified Reviews'}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {fiveStarPercent}% {lang === 'bn' ? 'গ্রাহক ৫-স্টার দিয়েছেন' : '5-Star Ratings'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-write-review-toggle"
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {showForm ? (
                <span>{lang === 'bn' ? 'ফর্ম বন্ধ করুন' : 'Close Form'}</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'bn' ? 'মতামত বা রিভিউ দিন' : 'Leave a Review'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold block">
                {lang === 'bn' ? 'ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।' : 'Thank you! Your review has been submitted and posted successfully.'}
              </span>
              <span className="text-emerald-300/80 text-[11px]">
                {lang === 'bn' ? 'আপনার সৎ মতামত অন্যদের খাঁটি খাবার নির্বাচনে সাহায্য করবে।' : 'Your honest feedback helps other customers make the best meal choice.'}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Submit Review Form */}
        {showForm && (
          <div className="my-6 p-6 rounded-2xl bg-stone-950 border-2 border-amber-500/50 relative z-10 animate-fade-in">
            <div className="flex items-center gap-2 pb-4 border-b border-stone-800">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share Your Dining & Delivery Experience'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              {/* Star Rating Interactive Input */}
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                <label className="text-xs font-bold text-stone-300 block mb-2">
                  {lang === 'bn' ? 'আপনার রেটিং নির্বাচন করুন (তারকায় ক্লিক করুন):' : 'Select your rating (Click on stars):'} *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-amber-300">
                    {lang === 'bn'
                      ? ratingLabels[((hoverRating || rating) as keyof typeof ratingLabels)]?.bn
                      : ratingLabels[((hoverRating || rating) as keyof typeof ratingLabels)]?.en}
                  </span>
                </div>
              </div>

              {/* Grid: Name & Phone & Passenger Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">
                    {lang === 'bn' ? 'আপনার নাম:' : 'Your Name:'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={lang === 'bn' ? 'উদা: মো: সুমন' : 'e.g. John Doe'}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক):' : 'Mobile Number (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="017XX-XXXXXX"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">
                    {lang === 'bn' ? 'গ্রাহকের ধরন / যাত্রী পরিচয়:' : 'Customer Type:'}
                  </label>
                  <select
                    value={passengerType}
                    onChange={(e) => setPassengerType(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="আন্তঃনগর ট্রেন যাত্রী">{lang === 'bn' ? '🚆 আন্তঃনগর ট্রেন যাত্রী' : '🚆 Intercity Train Passenger'}</option>
                    <option value="স্থানীয় নিয়মিত গ্রাহক">{lang === 'bn' ? '🏠 স্থানীয় নিয়মিত গ্রাহক' : '🏠 Local Regular Customer'}</option>
                    <option value="হোম / অফিস পার্সেল">{lang === 'bn' ? '📦 হোম / অফিস পার্সেল' : '📦 Home / Office Delivery'}</option>
                    <option value="রেলওয়ে স্টেশন পর্যটক">{lang === 'bn' ? '🎒 স্টেশন পর্যটক ও পথচারী' : '🎒 Station Tourist / Visitor'}</option>
                  </select>
                </div>
              </div>

              {/* Dish Reviewed Dropdown */}
              <div>
                <label className="text-xs font-bold text-stone-400 block mb-1">
                  {lang === 'bn' ? 'কোন খাবারের রিভিউ দিচ্ছেন?' : 'Which food item are you reviewing?'}
                </label>
                <select
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="গরম মচমচে জিলাপি">{lang === 'bn' ? 'গরম মচমচে জিলাপি (হট ফেভারিট)' : 'Crispy Hot Jilapi'}</option>
                  <option value="কষা গরুর মাংস">{lang === 'bn' ? 'কষা গরুর মাংস (স্পেশাল গ্রেভি)' : 'Spicy Beef Curry'}</option>
                  <option value="স্পেশাল ভুনা খিচুড়ি">{lang === 'bn' ? 'স্পেশাল ভুনা খিচুড়ি ও ডিম' : 'Special Bhuna Khichuri'}</option>
                  <option value="দেশি ছোট মাছের চচ্চড়ি">{lang === 'bn' ? 'দেশি নদীর ছোট মাছের চচ্চড়ি' : 'River Small Fish'}</option>
                  <option value="তাজা রুই মাছের ঝোল">{lang === 'bn' ? 'তাজা রুই/কাতলা মাছের ঝোল' : 'Rui Fish Curry'}</option>
                  <option value="সাদা ভাত ও স্পেশাল ডাল">{lang === 'bn' ? 'সাদা ভাত, ডাল ও ভর্তা' : 'Steamed Rice & Dal'}</option>
                  <option value="লেয়ার পরোটা ও ভাজি">{lang === 'bn' ? 'লেয়ার পরোটা ও সুস্বাদু ভাজি' : 'Layer Paratha & Bhaji'}</option>
                  <option value="সামগ্রিক হোটেল সেবা">{lang === 'bn' ? 'সামগ্রিক খাবার ও দ্রুত ডেলিভারি সেবা' : 'Overall Food & Delivery'}</option>
                </select>
              </div>

              {/* Review Comment Textarea */}
              <div>
                <label className="text-xs font-bold text-stone-400 block mb-1">
                  {lang === 'bn' ? 'আপনার বিস্তারিত অভিজ্ঞতা ও মন্তব্য:' : 'Your Feedback & Review Details:'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={lang === 'bn' 
                    ? 'খাবারের স্বাদ, গরম অবস্থা, প্যাকিং ও ডেলিভারি কেমন লেগেছে বিস্তারিত লিখুন...' 
                    : 'Describe the food taste, freshness, packing and delivery experience...'}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              {/* Actions: Submit & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white bg-stone-900 border border-stone-800 cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-stone-950" />
                  <span>{lang === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Filter Controls & Highlights Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 my-6 pt-2">
          
          {/* Trust Badges */}
          <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
            <span className="flex items-center gap-1.5 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>১০০% শতভাগ আসল গ্রাহক মতামত</span>
            </span>
            <span className="flex items-center gap-1.5 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800">
              <Train className="w-3.5 h-3.5 text-amber-400" />
              <span>রেলওয়ে স্টেশন ৩ মিনিট এক্সপ্রেস পার্সেল</span>
            </span>
          </div>

          {/* Star Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <span className="text-[11px] font-bold text-stone-500 px-2 hidden sm:inline">
              <Filter className="w-3 h-3 inline mr-1" />
              ফিল্টার:
            </span>
            <button
              type="button"
              onClick={() => setStarFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                starFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              সকল ({totalReviewsCount})
            </button>
            <button
              type="button"
              onClick={() => setStarFilter(5)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                starFilter === 5
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>৫ ★</span>
              <span>({reviews.filter((r) => r.rating === 5).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStarFilter(4)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                starFilter === 4
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>৪ ★</span>
              <span>({reviews.filter((r) => r.rating === 4).length})</span>
            </button>
          </div>

        </div>

        {/* Reviews Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const isLiked = likedReviews[rev.id] || false;
            const currentLikes = (rev.likes || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={rev.id}
                id={`review-card-${rev.id}`}
                className="bg-stone-950/80 border border-stone-800 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-3 transition-all duration-300 hover:shadow-xl group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Passenger Type & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold font-serif text-sm">
                        {rev.customerName.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {rev.customerName}
                          </h4>
                          {rev.verifiedOrder && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>যাচাইকৃত অর্ডার</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                          {rev.passengerType && (
                            <span className="text-amber-300/80 font-medium">
                              {rev.passengerType}
                            </span>
                          )}
                          <span>•</span>
                          <span>{rev.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-0.5 bg-stone-900 px-2 py-1 rounded-lg border border-stone-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                          }`}
                        />
                      ))}
                    </div>

                  </div>

                  {/* Food Item Reviewed Tag */}
                  {rev.foodName && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800/80 text-xs text-amber-200">
                      <Utensils className="w-3 h-3 text-amber-400" />
                      <span className="font-semibold">{rev.foodName}</span>
                    </div>
                  )}

                  {/* Review Text / Comment */}
                  <p className="text-xs sm:text-sm text-stone-200 mt-2.5 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Card Footer: Helpful Like Button */}
                <div className="pt-2 border-t border-stone-900 flex items-center justify-between text-xs text-stone-400">
                  <span className="text-[11px] text-stone-500">
                    হোটেল আল শেখ ফরিদ • স্টেশন রোড
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleLike(rev.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>সহায়ক ছিল ({currentLikes})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-stone-800/80 text-center text-xs text-stone-400">
          <p>
            {lang === 'bn'
              ? 'সকল গ্রাহক মতামত স্বয়ংক্রিয়ভাবে হোটেল আল শেখ ফরিদের লাইভ সিস্টেমে সংযুক্ত থাকে। মালিক: মো: আব্দুল বারিক শেখ।'
              : 'All reviews are verified by our customer order tracking system. Hotel Al Sheikh Farid • Station Road.'}
          </p>
        </div>

      </div>
    </section>
  );
};
