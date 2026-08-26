import React, { useState } from 'react';
import { Plus, Minus, Flame, Sparkles, Clock, Eye, Check } from 'lucide-react';
import { FoodItem, CartItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onAddToCart: (item: CartItem) => void;
  onOpenDetails: (food: FoodItem) => void;
  lang: 'bn' | 'en';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onAddToCart,
  onOpenDetails,
  lang,
}) => {
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const currentPrice = food.portions && food.portions.length > 0
    ? food.portions[selectedPortionIndex].price
    : food.price;

  const currentPortion = food.portions && food.portions.length > 0
    ? food.portions[selectedPortionIndex]
    : undefined;

  const handleAdd = () => {
    onAddToCart({
      food,
      quantity,
      selectedPortion: currentPortion,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setQuantity(1);
    }, 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={food.image}
          alt={food.nameBn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {food.isHot && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 animate-pulse" />
              {lang === 'bn' ? 'গরম গরম' : 'Hot & Fresh'}
            </span>
          )}
          {food.isSpecial && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-stone-950" />
              {lang === 'bn' ? 'স্পেশাল' : 'Special'}
            </span>
          )}
        </div>

        {/* Quick View Button on Image */}
        <button
          onClick={() => onOpenDetails(food)}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all opacity-90 group-hover:opacity-100"
          title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Preparation Time & Price Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs text-[11px]">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{food.preparationTimeMinutes} {lang === 'bn' ? 'মিনিট' : 'mins'}</span>
          </span>
          <span className="bg-amber-600/90 text-white font-extrabold px-2.5 py-0.5 rounded-md shadow-xs">
            {lang === 'bn' ? food.availableTimesBn : 'Available Today'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-700 transition-colors font-serif">
              {lang === 'bn' ? food.nameBn : food.nameEn}
            </h3>
          </div>

          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {lang === 'bn' ? food.descriptionBn : food.descriptionEn}
          </p>

          {/* Portions / Weights Pill Selector (e.g. for Jilapi) */}
          {food.portions && food.portions.length > 0 && (
            <div className="mt-3">
              <label className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                {lang === 'bn' ? 'পরিমাণ বেছে নিন:' : 'Select Portion:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {food.portions.map((portion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPortionIndex(idx)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold text-left transition-all border ${
                      selectedPortionIndex === idx
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{lang === 'bn' ? portion.labelBn : portion.labelEn}</span>
                      <span className="text-amber-700 font-bold">৳{portion.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Price & Add to Cart Controls */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
              {lang === 'bn' ? 'মূল্য' : 'Price'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-700">
                ৳ {currentPrice}
              </span>
              {!currentPortion && (
                <span className="text-xs text-stone-500 font-medium">
                  / {lang === 'bn' ? food.unitBn : food.unitEn}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition-colors"
                title="কমান"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold text-stone-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition-colors"
                title="বাড়ান"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!food.inStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : food.inStock
                  ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'যোগ হয়েছে' : 'Added'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অর্ডার' : 'Add'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
