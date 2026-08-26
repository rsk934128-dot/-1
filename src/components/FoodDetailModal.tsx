import React, { useState } from 'react';
import { X, Flame, Sparkles, Clock, Check, Plus, Minus, ShoppingBag } from 'lucide-react';
import { FoodItem, CartItem } from '../types';
import { VoiceSpecialNoteInput } from './VoiceSpecialNoteInput';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  lang: 'bn' | 'en';
}

const AVAILABLE_ADDONS = [
  { id: 'lemon_chili', nameBn: 'অতিরিক্ত লেবু ও কাঁচামরিচ', nameEn: 'Extra Lemon & Green Chili', price: 0 },
  { id: 'extra_gravy', nameBn: 'অতিরিক্ত গরম ঝোল (ফ্রি)', nameEn: 'Extra Hot Gravy (Free)', price: 0 },
  { id: 'salad', nameBn: 'শসা ও পেঁয়াজ সালাদ', nameEn: 'Cucumber & Onion Salad', price: 0 },
  { id: 'extra_fried', nameBn: 'কড়া ভাজা / কড়া মচমচে', nameEn: 'Extra Well Done / Crispy', price: 0 },
];

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  onClose,
  onAddToCart,
  lang,
}) => {
  const [selectedPortionIdx, setSelectedPortionIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialInstruction, setSpecialInstruction] = useState<string>('');

  React.useEffect(() => {
    setSelectedPortionIdx(0);
    setQuantity(1);
    setSelectedAddons([]);
    setSpecialInstruction('');
  }, [food?.id]);

  if (!food) return null;

  const currentPrice = food.portions && food.portions.length > 0
    ? food.portions[selectedPortionIdx].price
    : food.price;

  const currentPortion = food.portions && food.portions.length > 0
    ? food.portions[selectedPortionIdx]
    : undefined;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleAdd = () => {
    onAddToCart({
      food,
      quantity,
      selectedPortion: currentPortion,
      specialInstruction: specialInstruction.trim() || undefined,
      addons: selectedAddons,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Image */}
        <div className="relative h-64 w-full bg-stone-100">
          <img
            src={food.image}
            alt={food.nameBn}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {food.isHot && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'গরম গরম' : 'Fresh & Hot'}
              </span>
            )}
            {food.isSpecial && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'হোটেল স্পেশাল' : 'Hotel Special'}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold font-serif">{lang === 'bn' ? food.nameBn : food.nameEn}</h2>
            <p className="text-xs text-amber-200 mt-0.5">
              {lang === 'bn' ? `প্রস্তুতি সময়: প্রায় ${food.preparationTimeMinutes} মিনিট` : `Prep time: ~${food.preparationTimeMinutes} mins`}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              {lang === 'bn' ? 'খাবারের বিবরণ' : 'Description'}
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">
              {lang === 'bn' ? food.descriptionBn : food.descriptionEn}
            </p>
          </div>

          {/* Portions */}
          {food.portions && food.portions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {lang === 'bn' ? 'পরিমাণ নির্বাচন করুন' : 'Select Portion'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {food.portions.map((portion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPortionIdx(idx)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedPortionIdx === idx
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-500/20'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span>{lang === 'bn' ? portion.labelBn : portion.labelEn}</span>
                      <span className="text-amber-700 font-extrabold">৳ {portion.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Free Add-ons */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {lang === 'bn' ? 'ফ্রি সুবিধা ও পছন্দ (Add-ons)' : 'Preferences & Extras'}
            </h4>
            <div className="space-y-2">
              {AVAILABLE_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{lang === 'bn' ? addon.nameBn : addon.nameEn}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Cooking Note with Voice Support */}
          <VoiceSpecialNoteInput
            value={specialInstruction}
            onChange={setSpecialInstruction}
            lang={lang}
            label={lang === 'bn' ? 'বিশেষ নির্দেশনা বা অনুরোধ (ভয়েস নোট):' : 'Special Cooking Request (Voice Note):'}
            placeholder={lang === 'bn' ? 'বাবুর্চির জন্য নির্দেশনা মুখে বলুন বা লিখুন (যেমন: ঝাল কম / পোড়া বেশি)...' : 'Dictate or type cooking request for chef...'}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-500 block">
              {lang === 'bn' ? 'সর্বমোট মূল্য' : 'Total Price'}
            </span>
            <span className="text-2xl font-black text-amber-700">
              ৳ {currentPrice * quantity}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-stone-300">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAdd}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অর্ডারে যোগ করুন' : 'Add to Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
