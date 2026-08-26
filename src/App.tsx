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
  HardDrive
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
  TableReservation
} from './types';
import { HOTEL_INFO, INITIAL_FOOD_ITEMS, INITIAL_USER, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_RESERVATIONS } from './data/initialData';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { TodaysSpecialBanner } from './components/TodaysSpecialBanner';
import { CustomerReviews } from './components/CustomerReviews';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CallModal } from './components/CallModal';
import { ChatDrawer } from './components/ChatDrawer';
import { EmailModal } from './components/EmailModal';
import { UserAccountModal } from './components/UserAccountModal';
import { TableBookingModal } from './components/TableBookingModal';
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
  updateUserProfileInFirestore 
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

  // State Management with LocalStorage resilience
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_menu') || localStorage.getItem('al_sheeth_pori_menu');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_user') || localStorage.getItem('al_sheeth_pori_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_orders') || localStorage.getItem('al_sheeth_pori_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_cart') || localStorage.getItem('al_sheeth_pori_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  // UI Navigation & Modal States
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isTableBookingOpen, setIsTableBookingOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // Call States
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [callType, setCallType] = useState<CallType>('audio');

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
    total: number;
  } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [emailInvoiceOrder, setEmailInvoiceOrder] = useState<Order | null>(null);
  const [gmailInvoiceOrder, setGmailInvoiceOrder] = useState<Order | null>(null);
  const [isGmailInvoiceOpen, setIsGmailInvoiceOpen] = useState<boolean>(false);

  // Push Notification Simulation State
  const [pushNotification, setPushNotification] = useState<PushNotificationPayload | null>(null);

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
        setUser((prev) => ({
          ...prev,
          uid: fbUser.uid,
          name: fbUser.displayName || prev.name,
          email: fbUser.email || prev.email,
          photoURL: fbUser.photoURL || undefined,
          avatar: fbUser.photoURL || undefined,
        }));
      } else {
        setIsGoogleSignedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      setUser(authedUser);
      setIsGoogleSignedIn(true);
      
      // Send greeting notification
      sendSimulatedPushNotification(
        {
          id: `auth-${Date.now()}`,
          title: lang === 'bn' ? '🎉 গুগল সাইন-ইন সফল হয়েছে!' : '🎉 Google Sign-in Successful!',
          body: lang === 'bn' 
            ? `স্বাগতম ${authedUser.name}! হোটেল আল শেখ ফরিদ-এ আপনার অ্যাকাউন্ট যুক্ত হয়েছে।` 
            : `Welcome ${authedUser.name}! Your account is connected.`,
          timestamp: 'এখন মাত্র',
          statusText: lang === 'bn' ? 'ভেরিফাইড অ্যাকাউন্ট ✓' : 'Verified Account ✓',
        },
        (payload) => setPushNotification(payload)
      );
    } catch (err: unknown) {
      console.error('Google Sign-In error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setIsGoogleSignedIn(false);
    setUser(INITIAL_USER);
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_menu', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('al_sheikh_farid_reservations', JSON.stringify(reservations));
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

    // Play pleasant kitchen service bell sound for new incoming order
    SoundNotificationService.playNewOrderBell();

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

  // Calls
  const handleStartCall = (type: CallType) => {
    setCallType(type);
    setIsCallOpen(true);
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
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    // Sync to Firestore
    updateOrderStatusInFirestore(orderId, status);
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
        onStartCall={handleStartCall}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmail={() => setIsEmailOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenBkashSms={() => handleOpenBkashSmsModal()}
        onToggleVoiceCommand={() => setIsVoiceListening(!isVoiceListening)}
        isVoiceListening={isVoiceListening}
        unreadSmsCount={activeBkashSms && !activeBkashSms.isVerified ? 1 : 0}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        user={user}
        isGoogleSignedIn={isGoogleSignedIn}
        isCachedMode={isCachedMode}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
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

        {/* Admin Dashboard if activated */}
        {isAdmin && (
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
            onCloseAdmin={() => setIsAdmin(false)}
            lang={lang}
          />
        )}

        {/* Hero Banner */}
        <Banner
          onQuickCategory={(cat) => setSelectedCategory(cat as FoodCategory)}
          onStartCall={handleStartCall}
          onOpenTableBooking={() => setIsTableBookingOpen(true)}
          lang={lang}
        />

        {/* Dynamic Today's Special Banner */}
        <TodaysSpecialBanner
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

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
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
                      : 'bg-white text-stone-700 hover:bg-amber-50 border border-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
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
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-serif text-white">{HOTEL_INFO.nameBn}</h4>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {HOTEL_INFO.taglineBn}
            </p>
            <p className="text-xs text-amber-300 font-semibold">
              প্রোপাইটার: {HOTEL_INFO.proprietorBn}
            </p>
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
              <button
                type="button"
                onClick={() => openDirectWhatsApp(undefined, user, lang)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer text-left py-0.5"
                title={lang === 'bn' ? 'সরাসরি WhatsApp চ্যাট শুরু করুন' : 'Chat on WhatsApp'}
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {HOTEL_INFO.phone1} ({lang === 'bn' ? 'সরাসরি চ্যাট' : 'Direct Chat'})</span>
              </button>
              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{HOTEL_INFO.phone1}, {HOTEL_INFO.phone2}</span>
              </p>
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
            <div className="flex gap-2">
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

      <CallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        initialType={callType}
        lang={lang}
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
        onCancelReservation={handleCancelReservation}
        onOpenTableBooking={() => {
          setIsAccountOpen(false);
          setIsTableBookingOpen(true);
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
        lang={lang}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isGoogleSignedIn={isGoogleSignedIn}
        authLoading={authLoading}
      />

      {/* Table Booking & Seat Reservation Modal */}
      <TableBookingModal
        isOpen={isTableBookingOpen}
        onClose={() => setIsTableBookingOpen(false)}
        onConfirmBooking={handleNewReservation}
        user={user}
        lang={lang}
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
      <VoiceCommandListener
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTableBooking={() => setIsTableBookingOpen(true)}
        onStartCall={handleStartCall}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmail={() => setIsEmailOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenBkashSms={() => handleOpenBkashSmsModal()}
        onGoToMenu={handleGoToMenu}
        onSearchFood={handleSearchFood}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        lang={lang}
        isListeningExternal={isVoiceListening}
        onListeningChange={(listening) => setIsVoiceListening(listening)}
      />
    </div>
  );
}
