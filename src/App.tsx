import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Flame, 
  PhoneCall, 
  Video, 
  MessageSquare, 
  Mail, 
  ShoppingBag, 
  Store, 
  Award, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  Filter, 
  User, 
  Phone,
  MessageCircle,
  WifiOff,
  Database,
  HardDrive,
  QrCode,
  Share2,
  FileDown,
  Printer,
  Eye,
  Crown
} from 'lucide-react';
import { 
  FoodItem, 
  FoodCategory, 
  CartItem, 
  Order, 
  UserProfile, 
  PaymentMethod, 
  OrderType,
  OrderStatus,
  CallType,
  Review,
  PointsHistoryItem,
  LoyaltyTier,
  TableReservation,
  TableType,
  ActiveTableSession,
  MealRating,
  isUserAdmin,
  SUPER_ADMIN_EMAILS
} from './types';
import { HOTEL_INFO, INITIAL_FOOD_ITEMS, INITIAL_USER, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_RESERVATIONS } from './data/initialData';
import { Header } from './components/Header';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Banner } from './components/Banner';
import { TodaysSpecialBanner } from './components/TodaysSpecialBanner';
import { FoodGallery } from './components/FoodGallery';
import { CustomerReviews } from './components/CustomerReviews';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CallModal } from './components/CallModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import { callSignalingService, CallSession } from './services/callSignalingService';
import { ringtoneService } from './utils/ringtoneService';
import { ChatDrawer } from './components/ChatDrawer';
import { EmailModal } from './components/EmailModal';
import { UserAccountModal } from './components/UserAccountModal';
import { TableBookingModal } from './components/TableBookingModal';
import { TableQrScannerModal } from './components/TableQrScannerModal';
import { LoyaltyLeaderboardModal } from './components/LoyaltyLeaderboardModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AiAssistantModal } from './components/AiAssistantModal';
import { BrowserPushNotificationToast } from './components/BrowserPushNotificationToast';
import { ActiveOrderTracker } from './components/ActiveOrderTracker';
import { OrderDeliveryMap } from './components/OrderDeliveryMap';
import { GmailInvoiceModal } from './components/GmailInvoiceModal';
import { BkashSmsNotificationBar } from './components/BkashSmsNotificationBar';
import { BkashSmsLetterModal } from './components/BkashSmsLetterModal';
import { VoiceCommandListener } from './components/VoiceCommandListener';
import { OfflineCachedBanner } from './components/OfflineCachedBanner';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { AppShareAndInstallModal } from './components/AppShareAndInstallModal';
import { SaaSMarketplaceModal } from './components/SaaSMarketplaceModal';
import { SeasonalThemeSelectorModal } from './components/SeasonalThemeSelectorModal';
import { PrintableDailyMenuModal } from './components/PrintableDailyMenuModal';
import { BackgroundSyncModal } from './components/BackgroundSyncModal';
import { ShopLocationMapModal } from './components/ShopLocationMapModal';
import { ShopLocationSection } from './components/ShopLocationSection';
import { RateMyMealModal } from './components/RateMyMealModal';
import { MobileNotificationPermissionBanner } from './components/MobileNotificationPermissionBanner';
import { LowPowerModeBanner } from './components/LowPowerModeBanner';
import { IncomingOrderRingtoneAlert } from './components/IncomingOrderRingtoneAlert';
import { BackgroundSyncService } from './services/backgroundSyncService';
import { 
  SeasonalThemeId, 
  SEASONAL_THEMES, 
  getSavedSeasonalTheme, 
  saveSeasonalTheme 
} from './utils/seasonalTheme';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { 
  BkashSmsLetter, 
  generateBkashSmsLetter, 
  matchSmsWithOrders 
} from './services/bkashSmsService';
import { openDirectWhatsApp } from './utils/whatsappHelper';
import { 
  sendSimulatedPushNotification, 
  PushNotificationPayload, 
  requestPushNotificationPermission 
} from './services/notificationService';
import { SoundNotificationService } from './services/soundNotificationService';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  saveOrderToFirestore, 
  updateOrderStatusInFirestore, 
  updateUserProfileInFirestore,
  isUnauthorizedDomainError,
  subscribeToOrders
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { safeStorage } from './utils/safeStorage';

export default function App() {
  // Network and Local Cache Status
  const {
    isOnline,
    isSimulatedOffline,
    isCachedMode,
    lastSyncTime,
    justReconnected,
    toggleSimulatedOffline,
    checkConnection,
  } = useNetworkStatus();

  // State Management with safeStorage resilience
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return safeStorage.getItem('al_sheikh_farid_admin_auth') === 'true';
  });
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'customer_preview'>('admin');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isStaffMode, setIsStaffMode] = useState<boolean>(() => {
    return safeStorage.getItem('al_sheikh_farid_staff_mode') === 'true';
  });
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    return safeStorage.getJSON<FoodItem[]>('al_sheikh_farid_menu', safeStorage.getJSON<FoodItem[]>('al_sheeth_pori_menu', INITIAL_FOOD_ITEMS));
  });

  const [user, setUser] = useState<UserProfile>(() => {
    return safeStorage.getJSON<UserProfile>('al_sheikh_farid_user', safeStorage.getJSON<UserProfile>('al_sheeth_pori_user', INITIAL_USER));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return safeStorage.getJSON<Order[]>('al_sheikh_farid_orders', safeStorage.getJSON<Order[]>('al_sheeth_pori_orders', INITIAL_ORDERS));
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeStorage.getJSON<CartItem[]>('al_sheikh_farid_cart', safeStorage.getJSON<CartItem[]>('al_sheeth_pori_cart', []));
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return safeStorage.getJSON<Review[]>('al_sheikh_farid_reviews', INITIAL_REVIEWS);
  });

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    return safeStorage.getJSON<TableReservation[]>('al_sheikh_farid_reservations', INITIAL_RESERVATIONS);
  });

  // UI Navigation & Modal States
  const [activeTableSession, setActiveTableSession] = useState<ActiveTableSession | null>(() => {
    return safeStorage.getJSON<ActiveTableSession | null>('al_sheikh_farid_table_session', null);
  });
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>(() => {
    const session = safeStorage.getJSON<ActiveTableSession | null>('al_sheikh_farid_table_session', null);
    if (session && session.specialtyCategory) {
      return session.specialtyCategory;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [seasonalTheme, setSeasonalTheme] = useState<SeasonalThemeId>(() => getSavedSeasonalTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isTableBookingOpen, setIsTableBookingOpen] = useState<boolean>(false);
  const [isTableQrScannerOpen, setIsTableQrScannerOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSaaSMarketplaceOpen, setIsSaaSMarketplaceOpen] = useState<boolean>(false);
  const [isPrintMenuModalOpen, setIsPrintMenuModalOpen] = useState<boolean>(false);
  const [isShopLocationMapOpen, setIsShopLocationMapOpen] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // Call & Ringtone States
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [callType, setCallType] = useState<CallType>('audio');
  const [activeCallSessionId, setActiveCallSessionId] = useState<string | undefined>();
  const [isCallIncomingReceived, setIsCallIncomingReceived] = useState<boolean>(false);
  const [incomingCallSession, setIncomingCallSession] = useState<CallSession | null>(null);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState<boolean>(false);
  const [isRingtoneMuted, setIsRingtoneMuted] = useState<boolean>(false);

  // Modals for Items & Orders
  const [detailFood, setDetailFood] = useState<FoodItem | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<{
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    specialNote?: string;
    subtotal: number;
    deliveryFee: number;
    discount?: number;
    pointsRedeemed?: number;
    pointsEarned?: number;
    total: number;
  } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [emailInvoiceOrder, setEmailInvoiceOrder] = useState<Order | null>(null);
  const [gmailInvoiceOrder, setGmailInvoiceOrder] = useState<Order | null>(null);
  const [isGmailInvoiceOpen, setIsGmailInvoiceOpen] = useState<boolean>(false);
  const [isRateMyMealOpen, setIsRateMyMealOpen] = useState<boolean>(false);
  const [rateMyMealOrder, setRateMyMealOrder] = useState<Order | null>(null);

  // Push Notification Simulation State
  const [pushNotification, setPushNotification] = useState<PushNotificationPayload | null>(null);
  const [isBackgroundSyncOpen, setIsBackgroundSyncOpen] = useState<boolean>(false);

  // Hook up real-time background notification toast handler
  useEffect(() => {
    BackgroundSyncService.setInAppToastHandler((payload) => {
      setPushNotification(payload);
    });
  }, []);

  // bKash SMS Notification Bar & Letter Verification State
  const [activeBkashSms, setActiveBkashSms] = useState<BkashSmsLetter | null>(null);
  const [isBkashLetterModalOpen, setIsBkashLetterModalOpen] = useState<boolean>(false);
  const [selectedLetterForModal, setSelectedLetterForModal] = useState<BkashSmsLetter | null>(null);
  const [recentSmsLetters, setRecentSmsLetters] = useState<BkashSmsLetter[]>([]);

  // Initialize first sample SMS letter
  useEffect(() => {
    const bkashInitial = orders.find(o => o.paymentMethod === 'bkash') || orders[0];
    if (bkashInitial) {
      const initSms = generateBkashSmsLetter(bkashInitial, bkashInitial.customerPhone);
      setRecentSmsLetters([initSms]);
    }
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setIsGoogleSignedIn(true);
        const email = fbUser.email;
        const isOwner = isUserAdmin(email);
        setUser((prev) => ({
          ...prev,
          uid: fbUser.uid,
          name: fbUser.displayName || prev.name,
          email: email || prev.email,
          photoURL: fbUser.photoURL || undefined,
          avatar: fbUser.photoURL || undefined,
          role: isOwner ? 'admin' : 'customer',
        }));
        if (isOwner) {
          setIsAdmin(true);
          setAdminViewMode('admin');
          safeStorage.setItem('al_sheikh_farid_admin_auth', 'true');
        }
      } else {
        // In preview/dev mode, check if a verified session was saved in safe storage
        const parsed = safeStorage.getJSON<{ email?: string; role?: string; name?: string } | null>('al_sheikh_farid_preview_auth', null);
        if (parsed && parsed.email) {
          setIsGoogleSignedIn(true);
          const isOwner = isUserAdmin(parsed.email);
          setUser((prev) => ({
            ...prev,
            ...parsed,
            role: isOwner ? 'admin' : ((parsed.role as any) || 'customer'),
          }));
          if (isOwner) {
            setIsAdmin(true);
            setAdminViewMode('admin');
            safeStorage.setItem('al_sheikh_farid_admin_auth', 'true');
          }
          return;
        }
        setIsGoogleSignedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time incoming orders from Firestore so hotel owner gets real-time ringtone on any device
  useEffect(() => {
    try {
      const unsubscribe = subscribeToOrders(user.uid, isAdmin, (fetchedOrders) => {
        if (fetchedOrders && fetchedOrders.length > 0) {
          setOrders(fetchedOrders);
          safeStorage.setJSON('al_sheikh_farid_orders', fetchedOrders);
        }
      });
      return () => unsubscribe();
    } catch {
      // offline fallback
    }
  }, [user.uid, isAdmin]);

  // Persistent Ringtone Watchdog: keeps the ringtone ringing continuously as long as any order is pending hotel owner confirmation!
  useEffect(() => {
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    if (pendingOrders.length > 0) {
      pendingOrders.forEach((ord) => {
        SoundNotificationService.startOrderRingtone(ord.id);
      });
    } else {
      // All orders confirmed! Stop the ringtone!
      SoundNotificationService.stopOrderRingtone();
    }
  }, [orders]);

  // Google Sign-In / Account Creation
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const authResult = await signInWithGoogle();
      if (!authResult) {
        // User closed or cancelled the popup - gracefully return without error
        return;
      }
      const { user: authedUser } = authResult;
      const isOwner = isUserAdmin(authedUser.email);
      const finalUser = {
        ...authedUser,
        role: isOwner ? ('admin' as const) : ('customer' as const),
      };
      setUser(finalUser);
      setIsGoogleSignedIn(true);

      if (isOwner) {
        setIsAdmin(true);
        setAdminViewMode('admin');
        safeStorage.setItem('al_sheikh_farid_admin_auth', 'true');
      }
      
      // Send greeting notification
      sendSimulatedPushNotification(
        {
          id: `auth-${Date.now()}`,
          title: lang === 'bn' 
            ? (isOwner ? '👑 হোটেল মালিক হিসেবে সাইন-ইন সফল!' : '🎉 গুগল সাইন-ইন সফল হয়েছে!') 
            : (isOwner ? '👑 Signed in as Hotel Owner!' : '🎉 Google Sign-in Successful!'),
          body: lang === 'bn' 
            ? (isOwner 
                ? `স্বাগতম মোহাম্মদ আব্দুল বারিক শেখ! সম্পূর্ণ অ্যাডমিন কন্ট্রোল সক্রিয় হয়েছে।`
                : `স্বাগতম ${authedUser.name}! হোটেল আল শেখ ফরিদ-এ আপনার অ্যাকাউন্ট যুক্ত হয়েছে।`)
            : `Welcome ${authedUser.name}! Your account is connected.`,
          timestamp: 'এখন মাত্র',
          statusText: isOwner ? 'মালিক মোড ✓' : 'ভেরিফাইড অ্যাকাউন্ট ✓',
        },
        (payload) => setPushNotification(payload)
      );
    } catch (err: unknown) {
      if (isUnauthorizedDomainError(err)) {
        // Handled gracefully in signInWithGoogle fallback
        console.warn('Google Sign-In note: Preview domain authorization handled gracefully.');
      } else {
        console.warn('Google Sign-In notice:', err);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setIsGoogleSignedIn(false);
    setIsAdmin(false);
    setAdminViewMode('admin');
    safeStorage.removeItem('al_sheikh_farid_admin_auth');
    safeStorage.removeItem('al_sheikh_farid_preview_auth');
    setUser(INITIAL_USER);
  };

  const handleAdminSuccess = (adminEmail: string) => {
    setIsAdmin(true);
    setAdminViewMode('admin');
    safeStorage.setItem('al_sheikh_farid_admin_auth', 'true');
    setUser((prev) => ({
      ...prev,
      role: 'admin',
      email: prev.email || adminEmail,
      name: prev.name === 'অতিথি ব্যবহারকারী' ? HOTEL_INFO.proprietorBn : prev.name,
    }));
    sendSimulatedPushNotification(
      {
        id: `admin-auth-${Date.now()}`,
        title: lang === 'bn' ? '👑 অ্যাডমিন মোড সক্রিয়!' : '👑 Admin Mode Activated!',
        body: lang === 'bn' 
          ? 'হোটেল আল শেখ ফরিদ অ্যাডমিন কন্ট্রোল সক্রিয় হয়েছে। আপনি এখন সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ করতে পারবেন।' 
          : 'Hotel Al Sheikh Farid Admin Control Activated.',
        timestamp: 'এখন মাত্র',
        statusText: 'মালিক মোড ✓',
      },
      (payload) => setPushNotification(payload)
    );
  };

  const handleExitAdmin = () => {
    setIsAdmin(false);
    setAdminViewMode('admin');
    safeStorage.removeItem('al_sheikh_farid_admin_auth');
    setUser((prev) => ({
      ...prev,
      role: 'customer',
    }));
    sendSimulatedPushNotification(
      {
        id: `admin-exit-${Date.now()}`,
        title: lang === 'bn' ? 'কাস্টমার মোডে ফিরেছেন' : 'Returned to Customer Mode',
        body: lang === 'bn' ? 'অ্যাডমিন মোড থেকে সফলভাবে বের হওয়া হয়েছে।' : 'Exited admin mode successfully.',
        timestamp: 'এখন মাত্র',
        statusText: 'কাস্টমার ভিউ',
      },
      (payload) => setPushNotification(payload)
    );
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      if (prev.uid) {
        updateUserProfileInFirestore(prev.uid, newUser);
      }
      return newUser;
    });
  };

  // Sync to safe storage
  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_menu', foodItems);
  }, [foodItems]);

  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_cart', cart);
  }, [cart]);

  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_user', user);
  }, [user]);

  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeStorage.setJSON('al_sheikh_farid_reservations', reservations);
  }, [reservations]);

  // Review Handlers
  const handleAddReview = (newRevData: Omit<Review, 'id' | 'createdAt' | 'likes'>) => {
    const newRevId = `rev-${Date.now()}`;
    const newRev: Review = {
      ...newRevData,
      id: newRevId,
      createdAt: lang === 'bn' ? 'এইমাত্র' : 'Just now',
      likes: 0,
    };
    setReviews((prev) => [newRev, ...prev]);

    // Send push notification about new review
    sendSimulatedPushNotification(
      {
        id: `push-review-${Date.now()}`,
        title: '🌟 নতুন গ্রাহক রিভিউ যুক্ত হয়েছে!',
        body: `${newRevData.customerName}: "${newRevData.comment.substring(0, 45)}..." (${newRevData.rating}★)`,
        icon: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80',
        timestamp: lang === 'bn' ? 'এইমাত্র' : 'Just now',
        statusText: 'রিভিউ প্রকাশিত',
      },
      (payload) => {
        setPushNotification(payload);
      }
    );
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
  };

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.food.id === item.food.id &&
          ci.selectedPortion?.labelBn === item.selectedPortion?.labelBn &&
          ci.specialInstruction === item.specialInstruction
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
    } else {
      setCart((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Payment & Order Confirmation
  const handleProceedToPayment = (details: typeof pendingCheckout) => {
    setPendingCheckout(details);
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handleConfirmOrder = (paymentInfo: {
    method: PaymentMethod;
    transactionId?: string;
    paymentStatus: 'paid' | 'unpaid' | 'verified';
  }) => {
    if (!pendingCheckout) return;

    const discountAmount = pendingCheckout.discount || 0;
    const pointsRedeemed = pendingCheckout.pointsRedeemed || 0;
    const pointsEarned = pendingCheckout.pointsEarned || Math.floor(pendingCheckout.subtotal / 10);

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      items: [...cart],
      subtotal: pendingCheckout.subtotal,
      deliveryFee: pendingCheckout.deliveryFee,
      discount: discountAmount,
      pointsRedeemed,
      pointsEarned,
      total: pendingCheckout.total,
      orderType: pendingCheckout.orderType,
      tableNumber: pendingCheckout.tableNumber,
      deliveryAddress: pendingCheckout.deliveryAddress,
      customerName: pendingCheckout.customerName,
      customerPhone: pendingCheckout.customerPhone,
      customerEmail: pendingCheckout.customerEmail,
      customerId: user.uid,
      paymentMethod: paymentInfo.method,
      paymentStatus: paymentInfo.paymentStatus,
      transactionId: paymentInfo.transactionId,
      status: paymentInfo.method === 'bkash' ? 'pending' : 'cooking',
      createdAt: 'এখন মাত্র',
      specialNote: pendingCheckout.specialNote,
      estimatedDeliveryMinutes: pendingCheckout.orderType === 'dine_in' ? 8 : 15,
    };

    // Update User Loyalty Points & Ledger
    setUser((prevUser) => {
      const currentPts = prevUser.loyaltyPoints !== undefined ? prevUser.loyaltyPoints : 75;
      const netPoints = Math.max(0, currentPts - pointsRedeemed + pointsEarned);
      const newHistory: PointsHistoryItem[] = [...(prevUser.pointsHistory || [])];

      if (pointsRedeemed > 0) {
        newHistory.unshift({
          id: `pts-${Date.now()}-redeem`,
          date: 'আজ',
          type: 'redeemed',
          points: pointsRedeemed,
          descriptionBn: `অর্ডার #${newOrder.id} এ ক্যাশ ডিসকাউন্ট ব্যবহার`,
          descriptionEn: `Discount redeemed on Order #${newOrder.id}`,
        });
      }

      if (pointsEarned > 0) {
        newHistory.unshift({
          id: `pts-${Date.now()}-earn`,
          date: 'আজ',
          type: 'earned',
          points: pointsEarned,
          descriptionBn: `অর্ডার #${newOrder.id} থেকে পয়েন্ট ক্যাশব্যাক`,
          descriptionEn: `Cashback earned from Order #${newOrder.id}`,
        });
      }

      const nextTier = netPoints >= 200 ? 'platinum' : netPoints >= 100 ? 'gold' : netPoints >= 50 ? 'silver' : 'bronze';

      return {
        ...prevUser,
        loyaltyPoints: netPoints,
        loyaltyTier: nextTier,
        pointsHistory: newHistory,
      };
    });

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToFirestore(newOrder, user.uid);
    setCart([]);
    setIsPaymentOpen(false);
    setPendingCheckout(null);
    setCompletedOrder(newOrder);

    // Start continuous ringtone loop for new incoming order until hotel owner confirms it
    SoundNotificationService.startOrderRingtone(newOrder.id);

    // If bKash payment, generate SMS letter and trigger the Mobile Notification Bar!
    if (paymentInfo.method === 'bkash') {
      const smsLetter = generateBkashSmsLetter(newOrder, pendingCheckout.customerPhone);
      setActiveBkashSms(smsLetter);
      setSelectedLetterForModal(smsLetter);
      setRecentSmsLetters((prev) => [smsLetter, ...prev]);
    }
  };

  // 1-Click bKash SMS Verification & Order Confirmation Handler
  const handleVerifyOrderWithSms = (orderId: string, trxId?: string) => {
    // Stop continuous incoming order ringtone
    SoundNotificationService.stopOrderRingtone(orderId);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'verified',
              status: o.status === 'pending' ? 'confirmed' : o.status,
              transactionId: trxId || o.transactionId,
            }
          : o
      )
    );
    updateOrderStatusInFirestore(orderId, 'confirmed');

    // Play pleasant bKash SMS verification success sound (instant audio feedback for kitchen)
    SoundNotificationService.playBkashVerificationSuccess();

    // Update active SMS state if matched
    setActiveBkashSms((prev) =>
      prev && prev.matchedOrderId === orderId ? { ...prev, isVerified: true } : prev
    );
  };

  // Open Full bKash SMS Letter & Verification Modal
  const handleOpenBkashSmsModal = (targetOrder?: Order) => {
    if (targetOrder) {
      const existing = recentSmsLetters.find((s) => s.matchedOrderId === targetOrder.id);
      if (existing) {
        setSelectedLetterForModal(existing);
      } else {
        const generated = generateBkashSmsLetter(targetOrder);
        setSelectedLetterForModal(generated);
      }
    } else if (activeBkashSms) {
      setSelectedLetterForModal(activeBkashSms);
    } else if (recentSmsLetters.length > 0) {
      setSelectedLetterForModal(recentSmsLetters[0]);
    } else if (orders.length > 0) {
      const bkashOrd = orders.find((o) => o.paymentMethod === 'bkash') || orders[0];
      const generated = generateBkashSmsLetter(bkashOrd);
      setSelectedLetterForModal(generated);
    } else {
      setSelectedLetterForModal(null);
    }
    setIsBkashLetterModalOpen(true);
  };

  // WebRTC Call Signaling & Incoming Ringtone Subscription
  useEffect(() => {
    const unsubscribe = callSignalingService.subscribe((signal) => {
      if (signal.action === 'initiate') {
        // If this tab was the initiator of the call, don't show incoming call modal on self
        if (signal.session.initiatorClientId === callSignalingService.clientId) {
          return;
        }

        // On hotel owner's side (or other tab / device), ring with incoming call modal & melodic ringtone
        setIncomingCallSession(signal.session);
        setIsIncomingCallOpen(true);
        ringtoneService.startIncomingRingtone(0.85);

        // Also show browser notification toast for hotel owner
        setPushNotification({
          id: `call-${Date.now()}`,
          title: lang === 'bn' ? '📞 ইনকামিং লাইভ কল আসছে!' : '📞 Incoming Live Call!',
          body: lang === 'bn'
            ? `${signal.session.callerName} (${signal.session.callerPhone}) হোটেল মালিককে কল দিয়েছেন। রিসিভ করতে ক্লিক করুন।`
            : `${signal.session.callerName} (${signal.session.callerPhone}) is calling the hotel owner. Click to answer.`,
          orderId: signal.session.id,
          timestamp: 'এখনই',
          statusText: lang === 'bn' ? 'কল বাজছে 📞' : 'Ringing 📞',
        });
      } else if (signal.action === 'accept') {
        setIsIncomingCallOpen(false);
        ringtoneService.stop();
      } else if (signal.action === 'decline' || signal.action === 'end') {
        setIsIncomingCallOpen(false);
        setIncomingCallSession(null);
        ringtoneService.stop();
      }
    });

    return () => {
      unsubscribe();
      ringtoneService.stop();
    };
  }, [lang]);

  // Customer or Admin initiates call
  const handleStartCall = (type: CallType, customerName?: string, customerPhone?: string) => {
    const session = callSignalingService.initiateCall(
      type,
      customerName || user.name || (isAdmin ? 'হোটেল এডমিন' : 'অনলাইন কাস্টমার / অতিথি'),
      customerPhone || user.phone || '01761869921',
      isAdmin ? 'admin' : 'customer'
    );
    setCallType(type);
    setActiveCallSessionId(session.id);
    setIsCallIncomingReceived(false);
    setIsCallOpen(true);
  };

  const handleAcceptIncomingCall = () => {
    ringtoneService.stop();
    ringtoneService.playCallConnected();
    setIsIncomingCallOpen(false);
    if (incomingCallSession) {
      callSignalingService.acceptCall(incomingCallSession.id);
      setCallType(incomingCallSession.type);
      setActiveCallSessionId(incomingCallSession.id);
      setIsCallIncomingReceived(true);
      setIsCallOpen(true);
    }
  };

  const handleDeclineIncomingCall = () => {
    ringtoneService.stop();
    ringtoneService.playCallEnded();
    if (incomingCallSession) {
      callSignalingService.declineCall(incomingCallSession.id);
    }
    setIsIncomingCallOpen(false);
    setIncomingCallSession(null);
  };

  const handleToggleMuteRingtone = () => {
    const nextMuted = !isRingtoneMuted;
    setIsRingtoneMuted(nextMuted);
    ringtoneService.setMuted(nextMuted);
  };

  const handleTestIncomingCall = (type: CallType = 'audio') => {
    const testSession: CallSession = {
      id: `CALL-TEST-${Date.now()}`,
      type,
      callerName: 'মো: আব্দুল্লাহ (গ্রাহক - ঈশ্বরদী জংশন)',
      callerPhone: '01761869921',
      callerRole: 'customer',
      targetRole: 'admin',
      status: 'ringing',
      startedAt: Date.now(),
      initiatorClientId: 'test-simulation',
    };
    setIncomingCallSession(testSession);
    setIsIncomingCallOpen(true);
    ringtoneService.startIncomingRingtone(0.85);
  };

  // Re-order past order: Clones items into cart, closes profile modal, and opens cart for instant checkout
  const handleReOrder = (pastOrder: Order) => {
    const clonedItems = pastOrder.items.map((item) => ({
      food: { ...item.food },
      quantity: item.quantity,
      selectedPortion: item.selectedPortion ? { ...item.selectedPortion } : undefined,
    }));
    setCart(clonedItems);
    setIsAccountOpen(false);
    setIsCartOpen(true);
    SoundNotificationService.playNotificationChime();
  };

  // Order status updater with Browser Push Notification Alert and Firestore sync
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    
    // Check if transitioning to completed/delivered from cooking/on_the_way
    if (existingOrder && (status === 'completed') && existingOrder.status !== 'completed') {
      const itemsSummary = existingOrder.items
        .map((i) => (lang === 'bn' ? i.food.nameBn : i.food.nameEn))
        .slice(0, 2)
        .join(', ');
      const extraCount = existingOrder.items.length > 2 ? ` (+${existingOrder.items.length - 2}টি)` : '';

      sendSimulatedPushNotification(
        {
          id: `push-${orderId}-${Date.now()}`,
          title: lang === 'bn' ? '🔔 খাবার প্রস্তুত ও ডেলিভারি সম্পন্ন!' : '🔔 Your Order is Delivered!',
          body: lang === 'bn'
            ? `অর্ডার #${orderId} (${itemsSummary}${extraCount}) সফলভাবে ডেলিভারি হয়েছে। গরম গরম সুস্বাদু খাবার উপভোগ করুন!`
            : `Order #${orderId} (${itemsSummary}) is freshly prepared and delivered. Enjoy your meal!`,
          orderId: orderId,
          order: { ...existingOrder, status: 'completed' },
          timestamp: 'এখন মাত্র',
          statusText: lang === 'bn' ? 'ডেলিভারি সম্পন্ন ✓' : 'Delivered ✓',
        },
        (payload) => {
          setPushNotification(payload);
        }
      );

      // Auto-trigger 'Rate My Meal' modal when order is marked as completed
      const completedOrd: Order = { ...existingOrder, status: 'completed' };
      setTimeout(() => {
        setRateMyMealOrder(completedOrd);
        setIsRateMyMealOpen(true);
      }, 600);
    }

    // Stop continuous incoming order ringtone when owner changes status from pending
    if (status !== 'pending') {
      SoundNotificationService.stopOrderRingtone(orderId);
    }

    if (status === 'confirmed') {
      SoundNotificationService.playKitchenBell();
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    // Sync to Firestore
    updateOrderStatusInFirestore(orderId, status);
  };

  // Hotel Owner Explicit Order Confirmation Handler (Stops continuous ringtone and confirms order)
  const handleHotelOwnerConfirmOrder = (orderId: string) => {
    SoundNotificationService.stopOrderRingtone(orderId);
    SoundNotificationService.playKitchenBell();
    handleUpdateOrderStatus(orderId, 'confirmed');

    const targetOrder = orders.find((o) => o.id === orderId);
    const summary = targetOrder
      ? targetOrder.items.map((i) => (lang === 'bn' ? i.food.nameBn : i.food.nameEn)).join(', ')
      : '';

    setPushNotification({
      id: `confirm-${orderId}-${Date.now()}`,
      title: lang === 'bn' ? '✓ অর্ডার কনফার্ম করা হয়েছে!' : '✓ Order Confirmed!',
      body: lang === 'bn' 
        ? `অর্ডার #${orderId} (${summary}) হোটেল মালিক কনফার্ম করেছেন। রিংটোন বন্ধ হয়েছে।` 
        : `Order #${orderId} (${summary}) confirmed by hotel owner. Ringtone stopped.`,
      orderId,
      timestamp: 'এখন মাত্র',
      statusText: lang === 'bn' ? 'কনফার্মড ✓' : 'Confirmed ✓',
    });
  };

  // Save Meal Rating to order history, award loyalty points & sync customer review
  const handleSaveMealRating = (orderId: string, mealRating: MealRating) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              mealRating,
            }
          : o
      )
    );

    // Award +15 loyalty points to the user
    setUser((prevUser) => {
      const currentPts = prevUser.loyaltyPoints !== undefined ? prevUser.loyaltyPoints : 75;
      const newPoints = currentPts + 15;
      const newHistoryItem: PointsHistoryItem = {
        id: `pts-${Date.now()}-rating`,
        date: 'আজ',
        type: 'bonus',
        points: 15,
        descriptionBn: `অর্ডার #${orderId} এর খাবারে রেটিং ও ফিডব্যাক বোনাস`,
        descriptionEn: `Feedback & rating bonus for Order #${orderId}`,
        orderId,
      };
      const nextTier: LoyaltyTier = newPoints >= 200 ? 'platinum' : newPoints >= 100 ? 'gold' : newPoints >= 50 ? 'silver' : 'bronze';
      const updatedUser: UserProfile = {
        ...prevUser,
        loyaltyPoints: newPoints,
        loyaltyTier: nextTier,
        pointsHistory: [newHistoryItem, ...(prevUser.pointsHistory || [])],
      };
      if (prevUser.uid) {
        updateUserProfileInFirestore(prevUser.uid, updatedUser);
      }
      return updatedUser;
    });

    // Also persist updated order with mealRating to Firestore
    const ratedOrder = orders.find((o) => o.id === orderId);
    if (ratedOrder) {
      saveOrderToFirestore({ ...ratedOrder, mealRating }, user.uid);
    }

    // If an overall comment is written, also publish to public customer reviews
    if (mealRating.overallComment && mealRating.overallComment.trim().length > 0) {
      const topItems = mealRating.itemFeedbacks.map((f) => f.foodNameBn).slice(0, 2).join(' ও ');
      const newReview: Review = {
        id: `rev-order-${orderId}-${Date.now()}`,
        customerName: mealRating.customerName || user.name || 'সম্মানিত অতিথি',
        customerPhone: user.phone || '01712-***000',
        rating: mealRating.overallRating,
        serviceRating: mealRating.serviceRating || 5,
        foodName: topItems || 'হোটেল আল শেখ ফরিদ স্পেশাল খাবার',
        comment: mealRating.overallComment,
        createdAt: 'আজ, মাত্র',
        passengerType: 'যাচাইকৃত খাবার ক্রেতা (Verified Order)',
        verifiedOrder: true,
        orderId: orderId,
        tags: mealRating.quickTags || [],
        likes: 1,
      };
      setReviews((prev) => [newReview, ...prev]);
    }
  };

  // Trigger simulated push notification manually for instant test
  const handleTriggerTestPush = () => {
    const latestOrder = orders[0];
    const orderId = latestOrder ? latestOrder.id : 'ORD-2026';
    const itemsSummary = latestOrder 
      ? latestOrder.items.map((i) => (lang === 'bn' ? i.food.nameBn : i.food.nameEn)).slice(0, 2).join(', ')
      : (lang === 'bn' ? 'স্পেশাল ভুনা খিচুড়ি ও কষা গরুর মাংস' : 'Special Khichuri & Beef');

    sendSimulatedPushNotification(
      {
        id: `push-test-${Date.now()}`,
        title: lang === 'bn' ? '🔔 খাবার প্রস্তুত ও ডেলিভারি সম্পন্ন!' : '🔔 Your Order is Delivered!',
        body: lang === 'bn'
          ? `অর্ডার #${orderId} (${itemsSummary}) রান্না সম্পন্ন করে ডেলিভারি দেয়া হয়েছে। হোটেল আল শেখ ফরিদ-এ আপনাকে ধন্যবাদ!`
          : `Order #${orderId} (${itemsSummary}) is cooked and delivered. Thank you for choosing Hotel Al Sheikh Farid!`,
        orderId: orderId,
        order: latestOrder,
        timestamp: 'এখন মাত্র',
        statusText: lang === 'bn' ? 'টেস্ট অ্যালার্ট সম্পন্ন ✓' : 'Test Alert ✓',
      },
      (payload) => {
        setPushNotification(payload);
      }
    );
  };

  const handleViewOrderFromNotification = (orderId?: string) => {
    if (!orderId) {
      setIsAccountOpen(true);
      return;
    }
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      setCompletedOrder(target);
    } else {
      setIsAccountOpen(true);
    }
  };

  const handleNewReservation = (newRes: TableReservation) => {
    setReservations((prev) => [newRes, ...prev]);
    // Browser Push Notification for reservation confirmation
    sendSimulatedPushNotification(
      {
        id: `push-res-${newRes.id}-${Date.now()}`,
        title: lang === 'bn' ? '🍽️ টেবিল রিজার্ভেশন নিশ্চিত হয়েছে!' : '🍽️ Table Reservation Confirmed!',
        body: lang === 'bn'
          ? `রিজার্ভেশন #${newRes.id}: ${newRes.tableNumber} (${newRes.guestCount} জন, ${newRes.date} ${newRes.timeSlot}) সফলভাবে সংরক্ষিত হয়েছে।`
          : `Reservation #${newRes.id}: ${newRes.tableNumber} (${newRes.guestCount} Guests, ${newRes.date} ${newRes.timeSlot}) is confirmed.`,
        timestamp: 'এখন মাত্র',
        statusText: lang === 'bn' ? 'রিজার্ভেশন সম্পন্ন ✓' : 'Reserved ✓',
      },
      (payload) => {
        setPushNotification(payload);
      }
    );
  };

  const handleCancelReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
    );
  };

  // Table QR Check-In & Active Table Session Handlers
  const handleTableCheckIn = (session: ActiveTableSession) => {
    setActiveTableSession(session);
    safeStorage.setJSON('al_sheikh_farid_table_session', session);
    if (session.reservationId) {
      setReservations((prev) =>
        prev.map((r) => (r.id === session.reservationId ? { ...r, status: 'checked_in' } : r))
      );
    }
    // Automatically filter main food menu based on scanned table's unique location or specialty preference
    if (session.specialtyCategory) {
      setSelectedCategory(session.specialtyCategory);
      setSearchQuery('');
    }
    SoundNotificationService.playQrScanSuccess();
    sendSimulatedPushNotification(
      {
        id: `push-table-checkin-${Date.now()}`,
        title: lang === 'bn' ? '📍 টেবিলে চেক-ইন সফল হয়েছে!' : '📍 Table Check-In Verified!',
        body: lang === 'bn'
          ? `${session.tableLabelBn}-এ আপনার সেশন শুরু হয়েছে। ${session.locationZoneBn ? `(${session.locationZoneBn}) ` : ''}টেবিলের স্পেশাল মেনু স্বয়ংক্রিয়ভাবে ফিল্টার করা হয়েছে!`
          : `Active at ${session.tableLabelEn}. Food menu automatically filtered for this table's location and specialty preference.`,
        timestamp: 'এখন মাত্র',
        statusText: lang === 'bn' ? 'চেক-ইন সম্পন্ন ✓' : 'Checked In ✓',
      },
      (payload) => {
        setPushNotification(payload);
      }
    );
  };

  const handleFilterMenuByTable = (category: FoodCategory, session?: ActiveTableSession) => {
    setSelectedCategory(category);
    setSearchQuery('');
    const targetSession = session || activeTableSession;
    if (targetSession) {
      SoundNotificationService.playNotificationChime();
    }
    setTimeout(() => {
      const menuEl = document.getElementById('food-menu-section');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleOrderForTable = (_tableNumber: string, _tableLabelBn?: string, _tableType?: TableType) => {
    setIsCartOpen(true);
  };

  const handleClearTableSession = () => {
    setActiveTableSession(null);
    safeStorage.removeItem('al_sheikh_farid_table_session');
    SoundNotificationService.playNotificationChime();
  };

  // Staff Mode & Kitchen Management Toggle
  const handleToggleStaffMode = () => {
    setIsStaffMode((prev) => {
      const next = !prev;
      safeStorage.setItem('al_sheikh_farid_staff_mode', String(next));
      if (next && !isAdmin) {
        setIsAdmin(true); // Open admin dashboard automatically when staff mode is activated
      }
      return next;
    });
  };

  const handleUpdateFoodPrice = (foodId: string, newPrice: number) => {
    setFoodItems((prev) =>
      prev.map((f) => (f.id === foodId ? { ...f, price: newPrice } : f))
    );
  };

  const handleToggleFoodStock = (foodId: string) => {
    setFoodItems((prev) =>
      prev.map((f) => (f.id === foodId ? { ...f, inStock: !f.inStock } : f))
    );
  };

  // Seasonal Theme Selector Handler
  const handleSelectSeasonalTheme = (themeId: SeasonalThemeId) => {
    setSeasonalTheme(themeId);
    saveSeasonalTheme(themeId);
    SoundNotificationService.playNotificationChime();

    const selectedThemeObj = SEASONAL_THEMES[themeId];
    if (selectedThemeObj) {
      sendSimulatedPushNotification(
        {
          id: `theme-changed-${Date.now()}`,
          title: lang === 'bn' 
            ? `🎨 ${selectedThemeObj.emoji} নতুন থিম সক্রিয়: ${selectedThemeObj.nameBn}` 
            : `🎨 ${selectedThemeObj.emoji} Theme Activated: ${selectedThemeObj.nameEn}`,
          body: lang === 'bn'
            ? selectedThemeObj.taglineBn
            : selectedThemeObj.taglineEn,
          timestamp: 'এখন মাত্র',
          statusText: lang === 'bn' ? 'থিম আপডেট সম্পন্ন ✓' : 'Theme Updated ✓',
        },
        (payload) => {
          setPushNotification(payload);
        }
      );
    }
  };

  // Voice Navigation Handlers
  const handleGoToMenu = (cat?: FoodCategory) => {
    if (cat) {
      setSelectedCategory(cat);
    }
    setSearchQuery('');
    setTimeout(() => {
      const menuEl = document.getElementById('food-menu-section');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSearchFood = (query: string) => {
    setSelectedCategory('all');
    setSearchQuery(query);
    setTimeout(() => {
      const menuEl = document.getElementById('food-menu-section');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleScrollToGallery = () => {
    setTimeout(() => {
      const galEl = document.getElementById('food-gallery-section');
      if (galEl) {
        galEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Filter food items
  const filteredFoods = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.nameBn.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.descriptionBn.toLowerCase().includes(query) ||
      item.descriptionEn.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categories: { id: FoodCategory; labelBn: string; labelEn: string; icon: string }[] = [
    { id: 'all', labelBn: 'সব খাবার', labelEn: 'All Items', icon: '🍽️' },
    { id: 'sweets_snacks', labelBn: 'জিলাপি ও সিঙ্গারা', labelEn: 'Jilapi & Snacks', icon: '🥨' },
    { id: 'lunch_dinner', labelBn: 'ভাত, খিচুড়ি ও ডাল', labelEn: 'Rice & Khichuri', icon: '🍚' },
    { id: 'fish_meat', labelBn: 'মাছ, মাংস ও ডিম', labelEn: 'Fish & Meat', icon: '🥩' },
    { id: 'breakfast', labelBn: 'সকালের নাস্তা ও পরোটা', labelEn: 'Breakfast', icon: '🫓' },
    { id: 'beverage', labelBn: 'স্পেশাল চা', labelEn: 'Tea & Beverage', icon: '☕' },
  ];

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Main Navigation */}
      <Header
        cartCount={cartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTableBooking={() => setIsTableBookingOpen(true)}
        onOpenTableQrScanner={() => setIsTableQrScannerOpen(true)}
        activeTableSession={activeTableSession}
        onOpenShopLocationMap={() => setIsShopLocationMapOpen(true)}
        onOpenBackgroundSync={() => setIsBackgroundSyncOpen(true)}
        onOpenShareAndQr={() => setIsShareModalOpen(true)}
        onStartCall={handleStartCall}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmail={() => setIsEmailOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenBkashSms={() => handleOpenBkashSmsModal()}
        onOpenFoodGallery={handleScrollToGallery}
        onOpenSaaSMarketplace={() => setIsSaaSMarketplaceOpen(true)}
        onToggleVoiceCommand={() => setIsVoiceListening(!isVoiceListening)}
        isVoiceListening={isVoiceListening}
        unreadSmsCount={activeBkashSms && !activeBkashSms.isVerified ? 1 : 0}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          if (!isAdmin) {
            setIsAdminAuthOpen(true);
          } else {
            setAdminViewMode((prev) => (prev === 'admin' ? 'customer_preview' : 'admin'));
          }
        }}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        adminViewMode={adminViewMode}
        onToggleAdminViewMode={() => setAdminViewMode((prev) => (prev === 'admin' ? 'customer_preview' : 'admin'))}
        onExitAdmin={handleExitAdmin}
        isStaffMode={isStaffMode}
        onToggleStaffMode={handleToggleStaffMode}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        user={user}
        isGoogleSignedIn={isGoogleSignedIn}
        isCachedMode={isCachedMode}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        currentThemeId={seasonalTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Offline & Cached Mode Notification Banner */}
      <OfflineCachedBanner
        isCachedMode={isCachedMode}
        isSimulatedOffline={isSimulatedOffline}
        lastSyncTime={lastSyncTime}
        justReconnected={justReconnected}
        onRetryConnection={checkConnection}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        lang={lang}
      />

      {/* Customer Preview Notice Banner (Shown when Admin is previewing Customer View) */}
      {isAdmin && adminViewMode === 'customer_preview' && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-4 py-2.5 shadow-md border-b border-amber-600 sticky top-18 z-30 flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Eye className="w-4 h-4 text-stone-950 animate-pulse shrink-0" />
            <span>
              {lang === 'bn' 
                ? '👁️ কাস্টমার প্রিভিউ মোড চলছে: সাধারণ কাস্টমাররা যেভাবে অ্যাপটি দেখেন আপনি এখন ঠিক সেভাবে দেখছেন।' 
                : '👁️ Customer Preview Mode: Viewing the app exactly as an ordinary customer sees it.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAdminViewMode('admin')}
            className="px-3 py-1 bg-stone-950 hover:bg-stone-800 text-amber-300 hover:text-white rounded-lg text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ডে ফিরুন' : 'Back to Admin Panel'}</span>
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full pb-20">
        {/* Active Order Progress & Push Notification Simulation Tracker */}
        <ActiveOrderTracker
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onViewOrderDetails={(ord) => setCompletedOrder(ord)}
          onEmailInvoice={(ord) => {
            setGmailInvoiceOrder(ord);
            setIsGmailInvoiceOpen(true);
          }}
          onOpenBkashSms={(ord) => handleOpenBkashSmsModal(ord)}
          onTriggerTestPush={handleTriggerTestPush}
          lang={lang}
        />

        {/* Live Delivery Route Map Visualization (For 'on_the_way' orders) */}
        <OrderDeliveryMap
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onCallRider={(phone, name) => {
            handleStartCall('audio');
          }}
          lang={lang}
        />

        {/* Admin Dashboard if activated and in Admin Mode */}
        {isAdmin && adminViewMode === 'admin' && (
          <AdminDashboard
            orders={orders}
            foodItems={foodItems}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateFoodPrice={handleUpdateFoodPrice}
            onToggleFoodStock={handleToggleFoodStock}
            onEmailInvoice={(ord) => {
              setGmailInvoiceOrder(ord);
              setIsGmailInvoiceOpen(true);
            }}
            onOpenBkashSms={(ord) => handleOpenBkashSmsModal(ord)}
            onStartCallWithCustomer={(name, phone, type) => handleStartCall(type, name, phone)}
            onTestIncomingCall={() => handleTestIncomingCall('audio')}
            onCloseAdmin={() => setAdminViewMode('customer_preview')}
            isStaffMode={isStaffMode}
            onToggleStaffMode={handleToggleStaffMode}
            lang={lang}
          />
        )}

        {/* Hero Banner */}
        <Banner
          onQuickCategory={(cat) => setSelectedCategory(cat as FoodCategory)}
          onStartCall={handleStartCall}
          onOpenTableBooking={() => setIsTableBookingOpen(true)}
          onOpenTableQrScanner={() => setIsTableQrScannerOpen(true)}
          activeTableSession={activeTableSession}
          onOpenShareAndQr={() => setIsShareModalOpen(true)}
          onOpenFoodGallery={handleScrollToGallery}
          onOpenSaaSMarketplace={() => setIsSaaSMarketplaceOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          currentThemeId={seasonalTheme}
          lang={lang}
        />

        {/* PWA Mobile App Install Bar */}
        <PwaInstallBanner 
          lang={lang} 
          onOpenShareAndQr={() => setIsShareModalOpen(true)} 
        />

        {/* Dynamic Today's Special Banner */}
        <TodaysSpecialBanner
          foodItems={foodItems}
          onAddToCart={handleAddToCart}
          onOpenDetails={(food) => setDetailFood(food)}
          onStartCall={handleStartCall}
          lang={lang}
        />

        {/* 8K Food Visual Gallery, Live Kitchen Stream & AI Studio */}
        <FoodGallery
          foodItems={foodItems}
          onAddToCart={handleAddToCart}
          onOpenDetails={(food) => setDetailFood(food)}
          onStartCall={handleStartCall}
          lang={lang}
        />

        {/* Search & Category Filter Section */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'জিলাপি, খিচুড়ি, মাংস বা মাছ খুঁজুন...' : 'Search Jilapi, Khichuri, Meat...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50/50"
              />
            </div>

            {/* Quick Special Badges */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-stone-500 shrink-0 hidden md:inline">
                {lang === 'bn' ? 'জনপ্রিয় আইটেম:' : 'Popular:'}
              </span>
              <button
                onClick={() => setSearchQuery('জিলাপি')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold shrink-0 transition-colors"
              >
                জিলাপি (১৬০ ৳)
              </button>
              <button
                onClick={() => setSearchQuery('গরু')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold shrink-0 transition-colors"
              >
                গরুর মাংস (৮০ ৳)
              </button>
              <button
                onClick={() => setSearchQuery('খিচুড়ি')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold shrink-0 transition-colors"
              >
                ভুনা খিচুড়ি (৩০ ৳)
              </button>
            </div>
          </div>

          {/* Active Table Session Banner when Dine-In session is live */}
          {activeTableSession && (
            <div className="mb-3.5 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white shadow-lg border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-amber-300">
                      {lang === 'bn' ? activeTableSession.tableLabelBn : activeTableSession.tableLabelEn}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {lang === 'bn' ? '● চেক-ইন সক্রিয়' : '● Checked In'}
                    </span>
                    {activeTableSession.locationZoneBn && (
                      <span className="text-xs text-stone-300">
                        📍 {lang === 'bn' ? activeTableSession.locationZoneBn : activeTableSession.locationZoneEn}
                      </span>
                    )}
                  </div>

                  {activeTableSession.specialtyCategory && (
                    <p className="text-xs text-amber-200/90 mt-1 flex items-center gap-1.5 flex-wrap">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold">
                        {lang === 'bn' ? 'টেবিলের লোকেশন অনুযায়ী স্পেশাল মেনু:' : 'Location Specialty Filter:'}
                      </span>
                      <span className="text-stone-200 font-medium">
                        {lang === 'bn' ? activeTableSession.specialtyTitleBn : activeTableSession.specialtyTitleEn}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {activeTableSession.specialtyCategory && (
                  <button
                    type="button"
                    onClick={() => handleFilterMenuByTable(activeTableSession.specialtyCategory!, activeTableSession)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      selectedCategory === activeTableSession.specialtyCategory
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                        : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'স্পেশাল মেনু' : 'Specialty'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-stone-700 text-white font-black'
                      : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {lang === 'bn' ? 'সব খাবার' : 'All Items'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsTableQrScannerOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold border border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title={lang === 'bn' ? 'টেবিল কিউআর মডাল' : 'Table QR Scanner'}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'টেবিল পরিবর্তন' : 'Change'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearTableSession}
                  className="px-2 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 text-xs font-bold cursor-pointer transition-colors"
                  title={lang === 'bn' ? 'টেবিল সেশন সমাপ্ত' : 'End Session'}
                >
                  {lang === 'bn' ? 'চেক-আউট' : 'Exit'}
                </button>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isTableSpecialty = activeTableSession?.specialtyCategory === cat.id;
              const count = cat.id === 'all'
                ? foodItems.length
                : foodItems.filter((f) => f.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]'
                      : isTableSpecialty
                      ? 'bg-amber-50 text-amber-900 border-2 border-amber-400 hover:bg-amber-100'
                      : 'bg-white text-stone-700 hover:bg-amber-50 border border-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
                  {isTableSpecialty && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-stone-950">
                      {lang === 'bn' ? '✨ টেবিল পছন্দ' : '✨ Table'}
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Menu Catalog Grid */}
        <div id="food-menu-section" className="px-4 sm:px-6 lg:px-8 mt-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-stone-900 font-serif">
                  {lang === 'bn' ? 'তাজা ও গরম খাবারের মেনু' : 'Fresh & Hot Menu'}
                </h3>
                {isCachedMode && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                    <Database className="w-3 h-3 text-amber-700" />
                    <span>{lang === 'bn' ? '📦 ক্যাশ মোড সক্রিয় (লোকাল স্টোরেজ)' : '📦 Cached Mode (Local Storage)'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'bn' 
                  ? `মোট ${filteredFoods.length}টি খাবার প্রদর্শিত হচ্ছে ${isCachedMode ? '• লোকাল ক্যাশ থেকে দ্রুত লোডকৃত' : '• স্টেশন এলাকায় দ্রুততম পার্সেল ও ডেলিভারি'}` 
                  : `Showing ${filteredFoods.length} meals ${isCachedMode ? '• Loaded from resilient local cache' : ''}`}
              </p>
            </div>

            {/* Download/Print Menu Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="download-print-menu-btn"
                onClick={() => setIsPrintMenuModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-md border border-amber-500/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
                title={lang === 'bn' ? 'দৈনিক খাবারের মেনু ডাউনলোড ও প্রিন্ট করুন' : 'Download or Print Daily Food Menu PDF'}
              >
                <div className="p-1 rounded-lg bg-black/25 text-amber-300 group-hover:rotate-6 transition-transform">
                  <FileDown className="w-3.5 h-3.5" />
                </div>
                <span>{lang === 'bn' ? 'মেনু ডাউনলোড / প্রিন্ট' : 'Download / Print Menu'}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[10px] bg-amber-400 text-stone-950 font-black">
                  PDF
                </span>
              </button>
            </div>
          </div>

          {filteredFoods.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <p className="text-sm font-semibold text-stone-600">
                {lang === 'bn' ? 'কোনো খাবার খুঁজে পাওয়া যায়নি।' : 'No food item matched your search.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                {lang === 'bn' ? 'সব খাবার দেখুন' : 'View All Menu'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onAddToCart={handleAddToCart}
                  onOpenDetails={(f) => setDetailFood(f)}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews & Social Proof Section */}
        <CustomerReviews
          reviews={reviews}
          foodItems={foodItems}
          user={user}
          onAddReview={handleAddReview}
          onLikeReview={handleLikeReview}
          lang={lang}
        />

        {/* Store Location Map & Self-Pickup Directions Section */}
        <ShopLocationSection
          onOpenFullMapModal={() => setIsShopLocationMapOpen(true)}
          lang={lang}
        />

        {/* Station Hotel Trust & Hospitality Card */}
        <div className="px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{lang === 'bn' ? 'হোটেল আল শেখ ফরিদের অঙ্গীকার' : 'Hotel Commitment'}</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black font-serif text-stone-900">
                {lang === 'bn' ? 'খাঁটি ঘরোয়া স্বাদ ও ট্রেনের যাত্রীদের জন্য বিশেষ সুবিধা' : 'Authentic Station Hospitality'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {lang === 'bn' 
                  ? `প্রোপাইটার মোহাম্মদ আব্দুল বারিক শেখের নেতৃত্বে প্রতিদিন সকাল ৬টা থেকে রাত ১২টা পর্যন্ত টাটকা ভোজ্যতেলে রান্না করা গরম জিলাপি, খিচুড়ি, নদীর তাজা মাছ এবং কষা গরুর মাংস পরিবেশন করা হয়। কোনো প্রশ্ন বা প্রি-অর্ডারে সরাসরি অডিও/ভিডিও কল করুন!`
                  : `Run by Md. Abdul Barik Sheikh. Clean, fresh, delicious meals for all station travelers and local guests.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => openDirectWhatsApp(undefined, user, lang)}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
                title={lang === 'bn' ? 'সরাসরি হোটেলের নম্বরে WhatsApp চ্যাট খুলুন' : 'Open direct WhatsApp chat with the hotel'}
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'সরাসরি WhatsApp' : 'Direct WhatsApp'}</span>
              </button>

              <button
                onClick={() => handleStartCall('audio')}
                className="px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'bn' ? 'মালিককে অডিও কল' : 'Audio Call'}</span>
              </button>

              <button
                onClick={() => handleStartCall('video')}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>{lang === 'bn' ? 'লাইভ ভিডিও কল' : 'Video Call'}</span>
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="px-5 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'bn' ? 'লাইভ চ্যাট' : 'Chat Desk'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Buttons for Quick Access on Mobile */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden flex items-center justify-between gap-1.5 bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl border border-stone-700 shadow-xl">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
          title="QR ও শেয়ার"
        >
          <QrCode className="w-3.5 h-3.5 text-stone-950" />
          <span>QR</span>
        </button>

        <button
          onClick={() => openDirectWhatsApp(undefined, user, lang)}
          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
          title="WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={() => handleStartCall('audio')}
          className="flex-1 py-2 rounded-xl bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center gap-1"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'কল' : 'Call'}</span>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex-1 py-2 rounded-xl bg-stone-800 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 border border-stone-700"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'চ্যাট' : 'Chat'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'ব্যাগ' : 'Cart'} {cartItemsCount > 0 ? `(${cartItemsCount})` : ''}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/60 bg-stone-950 flex items-center justify-center shrink-0 shadow-md">
                <img 
                  src="/icon.svg" 
                  alt="Hotel Al Sheikh Farid Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h4 className="text-base font-bold font-serif text-white">{HOTEL_INFO.nameBn}</h4>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {HOTEL_INFO.taglineBn}
            </p>
            <p className="text-xs text-amber-300 font-semibold">
              প্রোপাইটার: {HOTEL_INFO.proprietorBn}
            </p>
            <a 
              href={`tel:${HOTEL_INFO.phone2}`}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-200 mt-1 font-mono transition-colors"
              title="মালিকের সাথে কথা বলুন"
            >
              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
              <span>মালিকের মোবাইল: {HOTEL_INFO.phone2}</span>
            </a>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">মেনু ও স্পেশাল মূল্য</h5>
            <ul className="space-y-1.5 text-stone-400">
              <li>জিলাপি: ১৬০ ৳/কেজি</li>
              <li>সাদা ভাত: ২০ ৳ | পরোটা: ২০ ৳</li>
              <li>ভুনা খিচুড়ি: ৩০ ৳ | ডাল: ১০ ৳</li>
              <li>কষা গরুর মাংস: ৮০ ৳ | ডিম: ২০ ৳</li>
              <li>তাজা মাছ / ছোট মাছ: ৬০-৮০ ৳</li>
              <li>গরম সিঙ্গারা: ১০ ৳ | স্পেশাল চা: ১০ ৳</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">যোগাযোগ ও ঠিকানা</h5>
            <div className="space-y-2 text-stone-400">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{HOTEL_INFO.locationBn}</span>
              </p>
              <a 
                href={`tel:${HOTEL_INFO.phone2}`}
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-100 transition-colors font-medium py-0.5"
                title="হোটেল মালিক আব্দুল বারিক শেখকে সরাসরি কল দিন"
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>মালিক (আব্দুল বারিক শেখ): {HOTEL_INFO.phone2}</span>
              </a>
              <button
                type="button"
                onClick={() => openDirectWhatsApp(undefined, user, lang)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer text-left py-0.5"
                title={lang === 'bn' ? 'সরাসরি WhatsApp চ্যাট শুরু করুন' : 'Chat on WhatsApp'}
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {HOTEL_INFO.phone1} ({lang === 'bn' ? 'সরাসরি চ্যাট' : 'Direct Chat'})</span>
              </button>
              <a 
                href={`tel:${HOTEL_INFO.phone1}`}
                className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors py-0.5"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'bn' ? 'হেল্পলাইন:' : 'Helpline:'} {HOTEL_INFO.phone1}</span>
              </a>
              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{HOTEL_INFO.email}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{HOTEL_INFO.openingHoursBn}</span>
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">পেমেন্ট ও অ্যাকাউন্ট সুবিধা</h5>
            <p className="text-xs text-stone-400 mb-3">
              বিকাশ, নগদ, রকেট ও ক্যাশ অন ডেলিভারির মাধ্যমে সহজ পেমেন্ট।
            </p>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 bg-pink-900/60 border border-pink-700/50 text-pink-300 rounded font-bold text-[10px]">
                bKash
              </span>
              <span className="px-2 py-1 bg-orange-900/60 border border-orange-700/50 text-orange-300 rounded font-bold text-[10px]">
                Nagad
              </span>
              <span className="px-2 py-1 bg-purple-900/60 border border-purple-700/50 text-purple-300 rounded font-bold text-[10px]">
                Rocket
              </span>
              <span className="px-2 py-1 bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 rounded font-bold text-[10px]">
                Cash
              </span>
            </div>

            {/* Direct App QR & Media Share Button in Footer */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? '📲 অ্যাপ শেয়ার ও QR কোড' : '📲 Share App & QR Code'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 text-center text-[11px] text-stone-500">
          © ২০২৬ {HOTEL_INFO.nameBn}। সর্বস্বত্ব সংরক্ষিত। প্রোপাইটার: {HOTEL_INFO.proprietorBn}।
        </div>
      </footer>

      {/* Modals & Drawers */}
      <FoodDetailModal
        food={detailFood}
        onClose={() => setDetailFood(null)}
        onAddToCart={handleAddToCart}
        lang={lang}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToPayment={handleProceedToPayment}
        user={user}
        lang={lang}
        isCachedMode={isCachedMode}
        activeTableSession={activeTableSession}
        onOpenTableQrScanner={() => setIsTableQrScannerOpen(true)}
        onOpenShopMap={() => setIsShopLocationMapOpen(true)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderDetails={pendingCheckout}
        onConfirmOrder={handleConfirmOrder}
        lang={lang}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onOpenCall={() => {
          setCompletedOrder(null);
          handleStartCall('audio');
        }}
        onOpenEmailInvoice={(ord) => {
          setGmailInvoiceOrder(ord);
          setIsGmailInvoiceOpen(true);
        }}
        onOpenShopMap={() => setIsShopLocationMapOpen(true)}
        onOpenRateMeal={(ord) => {
          setRateMyMealOrder(ord);
          setIsRateMyMealOpen(true);
        }}
        onAddReview={handleAddReview}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAwardPoints={(points, reasonBn) => {
          setUser((prev) => {
            const newPoints = (prev.loyaltyPoints !== undefined ? prev.loyaltyPoints : 75) + points;
            const newHistoryItem: PointsHistoryItem = {
              id: `pts-${Date.now()}-bonus`,
              date: 'আজ',
              type: 'bonus',
              points,
              descriptionBn: reasonBn,
              descriptionEn: 'Review bonus points',
            };
            const nextTier = newPoints >= 200 ? 'platinum' : newPoints >= 100 ? 'gold' : newPoints >= 50 ? 'silver' : 'bronze';
            return {
              ...prev,
              loyaltyPoints: newPoints,
              loyaltyTier: nextTier,
              pointsHistory: [newHistoryItem, ...(prev.pointsHistory || [])],
            };
          });
        }}
        user={user}
        lang={lang}
      />

      <RateMyMealModal
        isOpen={isRateMyMealOpen}
        onClose={() => setIsRateMyMealOpen(false)}
        order={rateMyMealOrder}
        onSaveRating={handleSaveMealRating}
        lang={lang}
        user={user}
      />

      <IncomingCallModal
        session={incomingCallSession}
        isOpen={isIncomingCallOpen}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
        lang={lang}
        isRingtoneMuted={isRingtoneMuted}
        onToggleMuteRingtone={handleToggleMuteRingtone}
      />

      <CallModal
        isOpen={isCallOpen}
        onClose={() => {
          setIsCallOpen(false);
          setIsCallIncomingReceived(false);
          if (activeCallSessionId) {
            callSignalingService.endCall(activeCallSessionId);
            setActiveCallSessionId(undefined);
          }
        }}
        initialType={callType}
        lang={lang}
        currentUserRole={isAdmin ? 'admin' : 'customer'}
        currentAdminEmail="fs2217732@gmail.com"
        targetCustomerName={incomingCallSession?.callerName || user.name || 'অনলাইন কাস্টমার / অতিথি'}
        targetCustomerPhone={incomingCallSession?.callerPhone || user.phone || '01761869921'}
        isIncomingReceived={isCallIncomingReceived}
        activeCallId={activeCallSessionId}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onStartCall={handleStartCall}
        lang={lang}
      />

      <EmailModal
        isOpen={isEmailOpen}
        onClose={() => {
          setIsEmailOpen(false);
          setEmailInvoiceOrder(null);
        }}
        targetOrder={emailInvoiceOrder}
        lang={lang}
      />

      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        orders={orders}
        foodItems={foodItems}
        reservations={reservations}
        isAdmin={isAdmin}
        onOpenAdminDashboard={() => {
          setIsAccountOpen(false);
          setIsAdmin(true);
          setAdminViewMode('admin');
        }}
        onOpenAdminLogin={() => {
          setIsAccountOpen(false);
          setIsAdminAuthOpen(true);
        }}
        onCancelReservation={handleCancelReservation}
        onOpenTableBooking={() => {
          setIsAccountOpen(false);
          setIsTableBookingOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsAccountOpen(false);
          setIsLeaderboardOpen(true);
        }}
        onUpdateProfile={handleUpdateProfile}
        onReOrder={handleReOrder}
        onAddToCart={handleAddToCart}
        onOpenCart={() => {
          setIsAccountOpen(false);
          setIsCartOpen(true);
        }}
        onEmailInvoice={(ord) => {
          setGmailInvoiceOrder(ord);
          setIsGmailInvoiceOpen(true);
        }}
        onOpenRateMeal={(ord) => {
          setRateMyMealOrder(ord);
          setIsRateMyMealOpen(true);
        }}
        lang={lang}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isGoogleSignedIn={isGoogleSignedIn}
        authLoading={authLoading}
      />

      {/* Loyalty Leaderboard Modal */}
      <LoyaltyLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        user={user}
        lang={lang}
        onOrderNowClick={() => {
          setIsLeaderboardOpen(false);
          const menuSection = document.getElementById('menu-section') || document.querySelector('main');
          menuSection?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAccountPass={() => {
          setIsLeaderboardOpen(false);
          setIsAccountOpen(true);
        }}
      />

      {/* Table Booking & Seat Reservation Modal */}
      <TableBookingModal
        isOpen={isTableBookingOpen}
        onClose={() => setIsTableBookingOpen(false)}
        onConfirmBooking={handleNewReservation}
        onOpenTableQrScanner={() => setIsTableQrScannerOpen(true)}
        user={user}
        lang={lang}
      />

      {/* Table QR Code Camera Scanner & Live Dine-In Check-In Modal */}
      <TableQrScannerModal
        isOpen={isTableQrScannerOpen}
        onClose={() => setIsTableQrScannerOpen(false)}
        onTableCheckIn={handleTableCheckIn}
        onOrderForTable={handleOrderForTable}
        activeTableSession={activeTableSession}
        reservations={reservations}
        onUpdateReservationStatus={(resId, status) => {
          setReservations((prev) =>
            prev.map((r) => (r.id === resId ? { ...r, status } : r))
          );
        }}
        user={user}
        lang={lang}
        onFilterMenuByTable={handleFilterMenuByTable}
        onClearTableSession={handleClearTableSession}
      />

      <GmailInvoiceModal
        isOpen={isGmailInvoiceOpen}
        onClose={() => {
          setIsGmailInvoiceOpen(false);
          setGmailInvoiceOrder(null);
        }}
        order={gmailInvoiceOrder}
        user={user}
        isGoogleSignedIn={isGoogleSignedIn}
        onSignInWithGoogle={handleGoogleSignIn}
        lang={lang}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        lang={lang}
      />

      {/* bKash SMS Notification Bar (Top Mobile Alert) */}
      <BkashSmsNotificationBar
        sms={activeBkashSms}
        matchedOrder={
          activeBkashSms
            ? matchSmsWithOrders(activeBkashSms, orders).matchedOrder || null
            : null
        }
        onConfirmOrderWithSms={handleVerifyOrderWithSms}
        onOpenFullLetter={(s) => {
          setSelectedLetterForModal(s);
          setIsBkashLetterModalOpen(true);
        }}
        onDismiss={() => setActiveBkashSms(null)}
        lang={lang}
      />

      {/* bKash SMS Letter & Verification Modal */}
      <BkashSmsLetterModal
        isOpen={isBkashLetterModalOpen}
        onClose={() => setIsBkashLetterModalOpen(false)}
        sms={selectedLetterForModal || activeBkashSms}
        orders={orders}
        onConfirmOrder={handleVerifyOrderWithSms}
        onSendGmailInvoice={(ord) => {
          setGmailInvoiceOrder(ord);
          setIsGmailInvoiceOpen(true);
        }}
        lang={lang}
      />

      {/* Browser Push Notification Simulation Banner */}
      <BrowserPushNotificationToast
        notification={pushNotification}
        onDismiss={() => setPushNotification(null)}
        onViewOrder={handleViewOrderFromNotification}
        lang={lang}
      />

      {/* Interactive Voice Command Listener & Navigation HUD */}
      {/* Admin Authentication & Security Login Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAdminSuccess={handleAdminSuccess}
        onSignInWithGoogle={handleGoogleSignIn}
        isGoogleSignedIn={isGoogleSignedIn}
        currentUserEmail={user.email}
        lang={lang}
      />

      <VoiceCommandListener
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTableBooking={() => setIsTableBookingOpen(true)}
        onOpenTableQrScanner={() => setIsTableQrScannerOpen(true)}
        onOpenBackgroundSync={() => setIsBackgroundSyncOpen(true)}
        onOpenShareAndQr={() => setIsShareModalOpen(true)}
        onOpenPrintMenu={() => setIsPrintMenuModalOpen(true)}
        onStartCall={handleStartCall}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmail={() => setIsEmailOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenBkashSms={() => handleOpenBkashSmsModal()}
        onGoToMenu={handleGoToMenu}
        onSearchFood={handleSearchFood}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        onToggleAdmin={() => {
          if (!isAdmin) {
            setIsAdminAuthOpen(true);
          } else {
            setAdminViewMode((prev) => (prev === 'admin' ? 'customer_preview' : 'admin'));
          }
        }}
        onToggleStaffMode={handleToggleStaffMode}
        lang={lang}
        isListeningExternal={isVoiceListening}
        onListeningChange={(listening) => setIsVoiceListening(listening)}
      />

      {/* Mobile Push Notification Quick Permission Banner */}
      <MobileNotificationPermissionBanner
        lang={lang}
        onOpenSyncModal={() => setIsBackgroundSyncOpen(true)}
      />

      {/* Low Power Mode Floating Banner */}
      <LowPowerModeBanner
        lang={lang}
        onOpenSyncModal={() => setIsBackgroundSyncOpen(true)}
      />

      {/* Mobile Background Synchronization & Always-Active Modal */}
      <BackgroundSyncModal
        isOpen={isBackgroundSyncOpen}
        onClose={() => setIsBackgroundSyncOpen(false)}
        lang={lang}
      />

      {/* App Media Share & QR Code Installation Modal */}
      <AppShareAndInstallModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
      />

      {/* SaaS Marketplace & White-Label Commercial Sales Portal Modal */}
      <SaaSMarketplaceModal
        isOpen={isSaaSMarketplaceOpen}
        onClose={() => setIsSaaSMarketplaceOpen(false)}
        lang={lang}
      />

      {/* Seasonal & Festival Theme Selector Modal */}
      <SeasonalThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={seasonalTheme}
        onSelectTheme={handleSelectSeasonalTheme}
        lang={lang}
      />

      {/* Printer-Friendly Walk-In Daily Menu Modal */}
      <PrintableDailyMenuModal
        isOpen={isPrintMenuModalOpen}
        onClose={() => setIsPrintMenuModalOpen(false)}
        foodItems={foodItems}
        lang={lang}
      />

      {/* Shop Location & Navigation Map Modal (Online Ordering with Self-Pickup) */}
      <ShopLocationMapModal
        isOpen={isShopLocationMapOpen}
        onClose={() => setIsShopLocationMapOpen(false)}
        lang={lang}
      />

      {/* Persistent Incoming Order Ringtone Alert Bar (rings until hotel owner confirms) */}
      <IncomingOrderRingtoneAlert
        orders={orders}
        lang={lang}
        onConfirmOrder={handleHotelOwnerConfirmOrder}
        onStartCooking={(orderId) => handleUpdateOrderStatus(orderId, 'cooking')}
        onOpenAdminOrders={() => {
          setIsAdmin(true);
          setAdminViewMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
