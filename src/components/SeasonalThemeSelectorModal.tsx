import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Palette, 
  Calendar, 
  Wand2, 
  Moon, 
  Sun, 
  CloudRain, 
  Flame, 
  Crown, 
  PartyPopper,
  Info,
  Layers,
  Award
} from 'lucide-react';
import { 
  SeasonalTheme, 
  SeasonalThemeId, 
  SEASONAL_THEMES, 
  getAutoDetectedSeason 
} from '../utils/seasonalTheme';

interface SeasonalThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: SeasonalThemeId;
  onSelectTheme: (themeId: SeasonalThemeId) => void;
  lang?: 'bn' | 'en';
}

export const SeasonalThemeSelectorModal: React.FC<SeasonalThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  lang = 'bn',
}) => {
  const [selectedPreview, setSelectedPreview] = useState<SeasonalThemeId>(currentThemeId);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTheme = SEASONAL_THEMES[selectedPreview];
  const autoSeasonId = getAutoDetectedSeason();

  const handleApplyTheme = (themeId: SeasonalThemeId) => {
    setSelectedPreview(themeId);
    onSelectTheme(themeId);
    setJustApplied(true);
    setTimeout(() => {
      setJustApplied(false);
      onClose();
    }, 400);
  };

  const handleAutoDetect = () => {
    handleApplyTheme(autoSeasonId);
  };

  const themesList = Object.values(SEASONAL_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[90vh]"
        style={{
          boxShadow: `0 25px 50px -12px ${currentTheme.glowColor}`,
        }}
      >
        {/* Modal Top Header with Selected Theme Gradient */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${currentTheme.topNoticeGradient} border-b border-stone-800 relative`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs uppercase tracking-wider flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  {lang === 'bn' ? 'মৌসুমি ও উৎসবের রূপসজ্জা' : 'Seasonal & Festive Themes'}
                </span>
                <span className="text-xl">{currentTheme.emoji}</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
                {lang === 'bn' ? 'উৎসব ও ঋতু অনুযায়ী অ্যাপের থিম পরিবর্তন করুন' : 'Personalize Festive & Seasonal Atmosphere'}
              </h3>
              
              <p className="text-xs text-white/80 max-w-xl">
                {lang === 'bn'
                  ? 'ঈদ, পহেলা বৈশাখ, বর্ষা বা শীতকালের বিশেষ খাবারের আমেজ ফুটিয়ে তুলতে আপনার পছন্দের কালার প্যালেট ও ডেকোরেশন বেছে নিন।'
                  : 'Transform colors, festive decorative motifs, and celebratory greetings to match festivals and recurring dining moods.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-black/30 hover:bg-black/50 text-white/90 transition-all cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Auto-Detect Button */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/15">
            <div className="text-xs text-white/90 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {lang === 'bn' 
                  ? `ক্যালেন্ডার অনুযায়ী বর্তমান ঋতু: ` 
                  : `Real-time Calendar Season: `}
                <strong className="text-amber-200 underline">{SEASONAL_THEMES[autoSeasonId].nameBn} ({SEASONAL_THEMES[autoSeasonId].emoji})</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleAutoDetect}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs cursor-pointer shadow-xs border border-white/30"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-200" />
              <span>{lang === 'bn' ? 'অটো-সিলেকশন প্রয়োগ করুন' : 'Auto-Match Season'}</span>
            </button>
          </div>
        </div>

        {/* Theme Cards Grid Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {themesList.map((theme) => {
              const isSelected = currentThemeId === theme.id;
              const isAuto = autoSeasonId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleApplyTheme(theme.id)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left overflow-hidden ${
                    isSelected
                      ? 'bg-stone-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                  style={{
                    borderColor: isSelected ? theme.primaryColorHex : undefined,
                  }}
                >
                  {/* Top Badge & Emoji */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                        style={{ backgroundColor: `${theme.primaryColorHex}25`, border: `1px solid ${theme.primaryColorHex}60` }}
                      >
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-wider text-stone-400">
                          {lang === 'bn' ? theme.seasonLabelBn : theme.seasonLabelEn}
                        </div>
                        <h4 className="text-sm font-black text-stone-100 font-serif line-clamp-1">
                          {lang === 'bn' ? theme.nameBn : theme.nameEn}
                        </h4>
                      </div>
                    </div>

                    {isSelected && (
                      <span 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0"
                        style={{ backgroundColor: theme.primaryColorHex }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-400 line-clamp-2 my-2">
                    {lang === 'bn' ? theme.themeDescriptionBn : theme.themeDescriptionEn}
                  </p>

                  {/* Color Palette Preview Swatches */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20 shadow-2xs" 
                        style={{ backgroundColor: theme.primaryColorHex }}
                        title="Primary Color"
                      />
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20 shadow-2xs" 
                        style={{ backgroundColor: theme.secondaryColorHex }}
                        title="Secondary Color"
                      />
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20 shadow-2xs" 
                        style={{ backgroundColor: theme.accentColorHex }}
                        title="Accent Color"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {theme.motifIcons.slice(0, 3).map((m, idx) => (
                        <span key={idx} className="text-xs">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Auto season tag */}
                  {isAuto && (
                    <div className="mt-2 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'bn' ? 'বর্তমান মৌসুম অনুযায়ী সুপারিশকৃত' : 'Recommended for current season'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Theme Preview Strip */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? 'নির্বাচিত থিমের বিশেষ বার্তা ও অফার প্রিভিউ:' : 'Active Theme Banner & Offer Preview:'}
              </span>
              <span className="font-mono text-amber-400 font-bold">{currentTheme.nameBn}</span>
            </div>

            <div className={`p-3 rounded-xl bg-gradient-to-r ${currentTheme.topNoticeGradient} text-white text-xs flex items-center justify-between gap-3 shadow-inner`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentTheme.emoji}</span>
                <div>
                  <div className="font-bold font-serif">{lang === 'bn' ? currentTheme.bannerGreetingBn : currentTheme.bannerGreetingEn}</div>
                  <div className="text-[11px] text-white/80">{lang === 'bn' ? currentTheme.specialOfferBn : currentTheme.specialOfferEn}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-lg shrink-0">
                {currentTheme.motifIcons.map((icon, i) => (
                  <span key={i} className="animate-pulse">{icon}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">
            {lang === 'bn' 
              ? 'থিম নির্বাচন আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।' 
              : 'Theme preference is automatically saved locally.'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold cursor-pointer transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
