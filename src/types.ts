export type FoodCategory = 'all' | 'breakfast' | 'lunch_dinner' | 'fish_meat' | 'sweets_snacks' | 'beverage';

export interface PortionOption {
  labelBn: string;
  labelEn: string;
  multiplier: number;
  price: number;
}

export interface FoodItem {
  id: string;
  nameBn: string;
  nameEn: string;
  category: FoodCategory;
  price: number; // in BDT
  unitBn: string; // e.g. "কেজি", "প্লেট", "পিস", "বাটি"
  unitEn: string;
  descriptionBn: string;
  descriptionEn: string;
  image: string;
  isSpecial?: boolean;
  isHot?: boolean;
  inStock: boolean;
  availableTimesBn: string;
  calories?: number;
  preparationTimeMinutes: number;
  portions?: PortionOption[];
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
  selectedPortion?: PortionOption;
  specialInstruction?: string;
  addons?: string[];
}

export type OrderType = 'delivery' | 'dine_in' | 'parcel';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'cash';

export type OrderStatus = 'pending' | 'confirmed' | 'cooking' | 'on_the_way' | 'completed' | 'cancelled';

export type CallType = 'audio' | 'video';

export interface PointsHistoryItem {
  id: string;
  date: string;
  type: 'earned' | 'redeemed' | 'bonus';
  points: number;
  descriptionBn: string;
  descriptionEn: string;
  orderId?: string;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LeaderboardCustomer {
  id: string;
  rank: number;
  name: string;
  phoneMasked: string;
  avatar?: string;
  points: number;
  ordersCount: number;
  tier: LoyaltyTier;
  favoriteFoodBn: string;
  favoriteFoodEn: string;
  isCurrentUser?: boolean;
  badgeBn?: string;
  badgeEn?: string;
  rewardBn?: string;
  rewardEn?: string;
  streakDays?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  total: number;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid' | 'verified';
  transactionId?: string;
  status: OrderStatus;
  createdAt: string;
  specialNote?: string;
  estimatedDeliveryMinutes: number;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  stationAreaDetails?: string;
  photoURL?: string;
  avatar?: string;
  role?: 'customer' | 'admin';
  savedAddresses: {
    id: string;
    title: string;
    address: string;
  }[];
  joinedDate: string;
  totalOrdersCount: number;
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  pointsHistory?: PointsHistoryItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'owner' | 'system';
  senderName: string;
  textBn: string;
  textEn?: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
}

export const SUPER_ADMIN_EMAILS = [
  'fs2217732@gmail.com',
  'rubels1k994@gmail.com',
];

export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.trim().toLowerCase());
};

export interface WebRtcCallSession {
  id: string;
  type: CallType;
  callerName: string;
  callerRole: 'customer' | 'admin';
  callerEmail?: string;
  callerPhone?: string;
  receiverName: string;
  receiverRole: 'customer' | 'admin';
  adminEmail: string;
  status: 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';
  startTime: string;
  durationSeconds: number;
  iceConnectionState: 'new' | 'checking' | 'connected' | 'completed' | 'disconnected' | 'closed';
  codec: string;
  bandwidthKbps: number;
  rttMs: number;
  packetLossPercent: number;
}

export interface HotelInfo {
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  proprietorBn: string;
  proprietorEn: string;
  locationBn: string;
  locationEn: string;
  phone1: string;
  phone2: string;
  email: string;
  openingHoursBn: string;
  openingHoursEn: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
}

export type TableType = 'standard' | 'family_cabin' | 'vip_ac' | 'train_view' | 'rooftop';
export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'checked_in' | 'seated';

export interface ActiveTableSession {
  tableNumber: string;
  tableLabelBn: string;
  tableLabelEn: string;
  tableType?: TableType;
  checkInTime: string;
  customerName?: string;
  guestCount?: number;
  reservationId?: string;
  source: 'camera_qr' | 'manual' | 'reservation_sync';
}

export interface TableReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  guestCount: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "01:30 PM (Lunch)"
  tableType: TableType;
  tableNumber?: string; // Assigned table number e.g. "T-04", "VIP-1"
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
  occasion?: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  serviceRating?: number; // 1 to 5
  foodName?: string;
  comment: string;
  createdAt: string;
  passengerType?: string;
  verifiedOrder?: boolean;
  orderId?: string;
  tags?: string[];
  likes?: number;
}

