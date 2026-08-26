import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Phone,
  User,
  Mail,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Train,
  Wind,
  Layers,
  Heart,
  Briefcase,
  Compass
} from 'lucide-react';
import { TableReservation, TableType, UserProfile } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { SoundNotificationService } from '../services/soundNotificationService';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (reservation: TableReservation) => void;
  user: UserProfile;
  lang: 'bn' | 'en';
}

interface TableOptionConfig {
  type: TableType;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: React.ElementType;
  badgeBn: string;
  badgeEn: string;
  colorClass: string;
  maxSeats: number;
}

const TABLE_OPTIONS: TableOptionConfig[] = [
  {
    type: 'train_view',
    titleBn: '🚂 ট্রেন ও প্ল্যাটফর্ম ভিউ টেবিল',
    titleEn: '🚂 Station & Train Platform View',
    descBn: 'ট্রেন আসা-যাওয়া ও মনোরম প্ল্যাটফর্মের চমৎকার দৃশ্য সংবলিত জানালার পাশের টেবিল।',
    descEn: 'Window-side premium table offering direct views of railway platforms and arriving trains.',
    icon: Train,
    badgeBn: 'সবচেয়ে জনপ্রিয়',
    badgeEn: 'Most Popular',
    colorClass: 'border-amber-500/80 bg-amber-500/10 text-amber-900',
    maxSeats: 8,
  },
  {
    type: 'vip_ac',
    titleBn: '❄️ ভিআইপি এসি ফ্যামিলি কেবিন',
    titleEn: '❄️ VIP Air-Conditioned Cabin',
    descBn: 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত শান্ত ও নিরিবিলি কেবিন, পরিবার ও বৈঠকের জন্য পারফেক্ট।',
    descEn: 'Fully air-conditioned, secluded private cabin ideal for families, executives, and quiet dining.',
    icon: Wind,
    badgeBn: 'প্রিমিয়াম এসি',
    badgeEn: 'VIP Luxury',
    colorClass: 'border-blue-500/80 bg-blue-500/10 text-blue-950',
    maxSeats: 12,
  },
  {
    type: 'standard',
    titleBn: '🍽️ প্রধান ডাইনিং হল (মেইন স্পেস)',
    titleEn: '🍽️ Main Dining Hall',
    descBn: 'হোটেলের মূল প্রাণবন্ত ডাইনিং স্পেস, দ্রুত সার্ভিস ও তাজা খাবার উপভোগের সুবিধা।',
    descEn: 'Vibrant main restaurant hall with quick table service and fresh culinary atmosphere.',
    icon: UtensilsCrossed,
    badgeBn: 'ক্লাসিক ডাইনিং',
    badgeEn: 'Classic Dining',
    colorClass: 'border-stone-400/80 bg-stone-100 text-stone-900',
    maxSeats: 20,
  },
  {
    type: 'family_cabin',
    titleBn: '👨‍👩‍👧‍👦 ট্র্যাডিশনাল পর্দাযুক্ত ফ্যামিলি কেবিন',
    titleEn: '👨‍👩‍👧‍👦 Traditional Family Cabin',
    descBn: 'পর্দা ও কাঠের পার্টিশন সংবলিত ঘরোয়া আরামদায়ক পারিবারিক বসার জায়গা।',
    descEn: 'Private curtained partition cabin ensuring traditional family privacy and comfort.',
    icon: Layers,
    badgeBn: 'প্রাইভেট কেবিন',
    badgeEn: 'Private Family',
    colorClass: 'border-emerald-500/80 bg-emerald-500/10 text-emerald-950',
    maxSeats: 10,
  },
  {
    type: 'rooftop',
    titleBn: '🌿 রুফটপ ওপেন ভিউ কর্নার',
    titleEn: '🌿 Rooftop Garden View',
    descBn: 'উন্মুক্ত মনোরম হাওয়া এবং স্টেশন রোড ট্রাফিক ও আকাশ দেখার রোমান্টিক কর্নার।',
    descEn: 'Open-air breezy corner with romantic evening sky and station road views.',
    icon: Compass,
    badgeBn: 'মুক্ত পরিবেশ',
    badgeEn: 'Open Air',
    colorClass: 'border-purple-500/80 bg-purple-500/10 text-purple-950',
    maxSeats: 6,
  },
];

const TIME_SLOTS = [
  { group: 'Breakfast & Morning', groupBn: 'সকালের নাস্তা', slots: ['07:30 AM', '08:30 AM', '09:30 AM', '10:30 AM'] },
  { group: 'Lunch & Noon Feast', groupBn: 'দুপুরের খাবার', slots: ['12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM', '03:30 PM'] },
  { group: 'Evening Snacks & Tea', groupBn: 'বিকেলের নাস্তা ও চা', slots: ['04:30 PM', '05:30 PM', '06:15 PM', '07:00 PM'] },
  { group: 'Dinner & Night Transit', groupBn: 'রাতের ডিনার ও ট্রানজিট', slots: ['08:00 PM', '08:45 PM', '09:30 PM', '10:15 PM', '11:00 PM'] },
];

const OCCASIONS = [
  { id: 'casual', labelBn: 'ঘরোয়া খাবার / ক্যাজুয়াল ডাইনিং', labelEn: 'Casual Dining', icon: UtensilsCrossed },
  { id: 'family', labelBn: 'পারিবারিক মিলনমেলা ও খাওয়া', labelEn: 'Family Gathering', icon: Heart },
  { id: 'transit', labelBn: 'ট্রেন বিরতি ও ট্রানজিট যাত্রাবিরতি', labelEn: 'Train Transit Stopover', icon: Train },
  { id: 'meeting', labelBn: 'অফিস মিটিং ও ব্যবসায়িক আলাপ', labelEn: 'Business Meeting', icon: Briefcase },
  { id: 'birthday', labelBn: 'জন্মদিন / বিশেষ উদযাপন', labelEn: 'Celebration / Birthday', icon: Sparkles },
];

export const TableBookingModal: React.FC<TableBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirmBooking,
  user,
  lang,
}) => {
  // Booking Form State
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [date, setDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>('01:15 PM');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [tableType, setTableType] = useState<TableType>('train_view');
  const [occasion, setOccasion] = useState<string>('casual');
  
  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReservation, setSuccessReservation] = useState<TableReservation | null>(null);

  // Auto-sync customer details when user props change
  React.useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.phone && !phone) setPhone(user.phone);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  if (!isOpen) return null;

  const selectedTableConfig = TABLE_OPTIONS.find((t) => t.type === tableType) || TABLE_OPTIONS[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন।' : 'Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = tableType === 'train_view' ? 'TR' : tableType === 'vip_ac' ? 'VIP' : tableType === 'rooftop' ? 'RT' : 'TB';
    const assignedTable = `${prefix}-${Math.floor(1 + Math.random() * 8)}`;

    const newReservation: TableReservation = {
      id: `RES-${randomNum}`,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      customerId: user?.uid || user?.id || undefined,
      guestCount,
      date,
      timeSlot,
      tableType,
      tableNumber: `${assignedTable} (${lang === 'bn' ? selectedTableConfig.badgeBn : selectedTableConfig.badgeEn})`,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      occasion,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessReservation(newReservation);
      onConfirmBooking(newReservation);
      SoundNotificationService.playNewOrderBell();
    }, 450);
  };

  const handleResetAndClose = () => {
    setSuccessReservation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-amber-200/80 animate-in fade-in zoom-in-95 duration-200 my-4">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-serif tracking-tight text-amber-100">
                  {lang === 'bn' ? 'টেবিল ও সিট রিজার্ভেশন' : 'Table & Seat Reservation'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {lang === 'bn' ? 'ফ্রি বুকিং' : 'Free Booking'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'bn' 
                  ? `${HOTEL_INFO.nameBn} • স্টেশন রোড, গৌরীপুর জংশন` 
                  : `${HOTEL_INFO.nameEn} • Station Road`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {successReservation ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="p-6 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                {lang === 'bn' ? '✓ রিজার্ভেশন কনফার্মড!' : '✓ Reservation Confirmed!'}
              </span>
              <h4 className="text-xl font-black font-serif text-stone-900 pt-2">
                {lang === 'bn' ? 'আপনার টেবিল নিশ্চিত করা হয়েছে' : 'Your Table has been Reserved'}
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                {lang === 'bn' 
                  ? `ধন্যবাদ ${successReservation.customerName}! হোটেল আল শেখ ফরিদ-এ নির্দিষ্ট সময়ে আপনার আসন প্রস্তুত থাকবে।`
                  : `Thank you ${successReservation.customerName}! Your table will be ready for you at the reserved time.`}
              </p>
            </div>

            {/* Reservation Summary Pass Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border-2 border-dashed border-amber-300 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase">
                    {lang === 'bn' ? 'রিজার্ভেশন নম্বর' : 'Reservation ID'}
                  </span>
                  <p className="text-sm font-black font-mono text-amber-900">{successReservation.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">
                    {lang === 'bn' ? 'বরাদ্দকৃত টেবিল' : 'Assigned Table'}
                  </span>
                  <p className="text-xs font-bold text-emerald-800">{successReservation.tableNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'তারিখ' : 'Date'}
                  </span>
                  <p className="font-bold text-stone-800">{successReservation.date}</p>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'সময়' : 'Time'}
                  </span>
                  <p className="font-bold text-stone-800">{successReservation.timeSlot}</p>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'অতিথি সংখ্যা' : 'Guests'}
                  </span>
                  <p className="font-bold text-stone-800">
                    {successReservation.guestCount} {lang === 'bn' ? 'জন' : 'people'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'ফোন' : 'Phone'}
                  </span>
                  <p className="font-bold text-stone-800">{successReservation.customerPhone}</p>
                </div>
              </div>

              {successReservation.specialRequests && (
                <div className="pt-2 border-t border-amber-200/60 text-xs">
                  <span className="text-[10px] font-semibold text-stone-500">
                    {lang === 'bn' ? 'বিশেষ অনুরোধ:' : 'Special Request:'}
                  </span>
                  <p className="text-stone-700 italic">"{successReservation.specialRequests}"</p>
                </div>
              )}
            </div>

            {/* Action buttons in success */}
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'অ্যাকাউন্টে বুকিং দেখুন' : 'View in My Account'}
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleBookingSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Step 1: Table Seating Category */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-serif">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">1</span>
                  {lang === 'bn' ? 'টেবিলের ধরন ও বসার স্থান পছন্দ করুন' : 'Select Seating Category'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold">{selectedTableConfig.badgeBn}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TABLE_OPTIONS.map((opt) => {
                  const isSelected = tableType === opt.type;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        setTableType(opt.type);
                        if (guestCount > opt.maxSeats) setGuestCount(opt.maxSeats);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? `${opt.colorClass} ring-2 ring-amber-500 shadow-xs font-bold`
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`} />
                          <span className="text-xs font-black">{lang === 'bn' ? opt.titleBn : opt.titleEn}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {lang === 'bn' ? opt.descBn : opt.descEn}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-stone-200/60">
                        <span>{lang === 'bn' ? opt.badgeBn : opt.badgeEn}</span>
                        <span>{lang === 'bn' ? `সর্বোচ্চ ${opt.maxSeats} আসন` : `Max ${opt.maxSeats} seats`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Time Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-black text-stone-900 flex items-center gap-1.5 font-serif">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">2</span>
                {lang === 'bn' ? 'তারিখ ও সময় নির্বাচন করুন' : 'Select Date & Time'}
              </label>

              {/* Quick Date Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    date === todayStr
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {lang === 'bn' ? 'আজ (Today)' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrowStr)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    date === tomorrowStr
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {lang === 'bn' ? 'আগামীকাল (Tomorrow)' : 'Tomorrow'}
                </button>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="py-1.5 px-3 rounded-xl text-xs border border-stone-300 bg-white font-medium text-stone-800 cursor-pointer focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Time Slots Grid grouped */}
              <div className="space-y-2 pt-1">
                {TIME_SLOTS.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {lang === 'bn' ? group.groupBn : group.group}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                      {group.slots.map((slot) => {
                        const isChosen = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeSlot(slot)}
                            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${
                              isChosen
                                ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs scale-105'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Guest Count & Occasion */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-black text-stone-900 flex items-center gap-1.5 font-serif">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">3</span>
                {lang === 'bn' ? 'অতিথি সংখ্যা ও উপলক্ষ' : 'Guest Count & Occasion'}
              </label>

              {/* Guest Count Counter */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-xs font-bold text-stone-800">
                    {lang === 'bn' ? 'অতিথি / সিট সংখ্যা' : 'Number of Guests'}
                  </span>
                  <p className="text-[10px] text-stone-500">
                    {lang === 'bn' ? `(এই টেবিলের সর্বোচ্চ সীমা ${selectedTableConfig.maxSeats} জন)` : `(Max ${selectedTableConfig.maxSeats} seats)`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 text-stone-800 font-black text-sm flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-black font-mono text-base text-amber-900">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount((g) => Math.min(selectedTableConfig.maxSeats, g + 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 text-stone-800 font-black text-sm flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Occasion Selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {OCCASIONS.map((occ) => {
                  const Icon = occ.icon;
                  const isOccSelected = occasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1 border transition-all cursor-pointer ${
                        isOccSelected
                          ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{lang === 'bn' ? occ.labelBn : occ.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Customer Details & Special Requests */}
            <div className="space-y-2.5 pt-2 border-t border-stone-200">
              <label className="text-xs font-black text-stone-900 flex items-center gap-1.5 font-serif">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">4</span>
                {lang === 'bn' ? 'যোগাযোগের তথ্য ও বিশেষ নির্দেশ' : 'Contact & Special Requests'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                    {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder={lang === 'bn' ? 'যেমন: তানভীর হাসান' : 'Your name'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                    {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="017XX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                  {lang === 'bn' ? 'বিশেষ অনুরোধ বা ট্রেনের সময় (ঐচ্ছিক)' : 'Special Requests or Train Timing (Optional)'}
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <textarea
                    rows={2}
                    placeholder={
                      lang === 'bn'
                        ? 'যেমন: বাচ্চার জন্য উঁচু চেয়ার, তিতুমীর এক্সপ্রেস ট্রেন পৌঁছানোর সাথে সাথে গরম খাবার চাই...'
                        : 'e.g. Baby high-chair needed, sync food with arriving train timing...'
                    }
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {lang === 'bn' ? 'রিজার্ভেশন সম্পন্ন হচ্ছে...' : 'Reserving Table...'}
                  </span>
                ) : (
                  <>
                    <UtensilsCrossed className="w-4 h-4 text-amber-200" />
                    <span>
                      {lang === 'bn' 
                        ? `টেবিল বুকিং নিশ্চিত করুন (${guestCount} জন • ${date} ${timeSlot})`
                        : `Confirm Table Reservation (${guestCount} Guests • ${date} ${timeSlot})`}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-stone-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{lang === 'bn' ? 'কোনো অগ্রিম বুকিং ফি নেই • ফ্রি বাতিল সুবিধা' : 'No advance reservation fee • Free cancellation'}</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
