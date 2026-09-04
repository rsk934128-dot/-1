import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Zap,
  ZapOff,
  Upload,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  Clock,
  Users,
  BellRing,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Layers,
  Train,
  Wind,
  Compass,
  FileCheck,
  SlidersHorizontal,
  Filter,
  MapPin,
  Check,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveTableSession, FoodCategory, TableReservation, TableType, UserProfile } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { SoundNotificationService } from '../services/soundNotificationService';

export interface TableSpecialtyConfig {
  category: FoodCategory;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  badgeBn: string;
  badgeEn: string;
  recommendationBn: string;
  recommendationEn: string;
}

export const TABLE_SPECIALTY_MAP: Record<TableType, TableSpecialtyConfig> = {
  train_view: {
    category: 'breakfast',
    titleBn: 'ট্রেন ভিউ এক্সপ্রেস মেনু (নাস্তা, খিচুড়ি ও চা)',
    titleEn: 'Train View Express Menu (Breakfast, Khichuri & Tea)',
    descBn: 'ট্রেনের যাত্রীদের সময়ের গুরুত্ব দিয়ে ৩ মিনিটে পরিবেশনযোগ্য গরম ভুনা খিচুড়ি, ডিম ভুনা, পরোটা ও স্পেশাল মসলা চা।',
    descEn: 'Piping hot 3-minute rail meals: aromatic bhuna khichuri, spiced egg bhuna, paratha & special tea.',
    badgeBn: '🚆 ট্রেন ও প্ল্যাটফর্ম এক্সপ্রেস স্পেশাল',
    badgeEn: '🚆 Train & Platform Express Special',
    recommendationBn: 'ভুনা খিচুড়ি, ডিম ভুনা, পরোটা ও স্পেশাল চা',
    recommendationEn: 'Bhuna Khichuri, Spiced Egg, Paratha & Tea',
  },
  vip_ac: {
    category: 'fish_meat',
    titleBn: 'ভিআইপি রাজকীয় ভোজ (কষা মাংস ও তাজা নদীর মাছ)',
    titleEn: 'VIP Royal Feast (Spicy Beef Curry & River Fish)',
    descBn: 'ভিআইপি এসি কেবিনের সম্মানিত অতিথিদের জন্য ঐতিহ্যবাহী কষা গরুর মাংস, দেশি মুরগি ও নদীর তাজা বড় রুই/কাতলা মাছ।',
    descEn: 'Executive luxury dining featuring slow-cooked spicy beef, rich chicken curry & fresh river fish steaks.',
    badgeBn: '👑 ভিআইপি স্পেশাল মাংস ও মাছ',
    badgeEn: '👑 VIP Special Meat & Fish',
    recommendationBn: 'কষা গরুর মাংস, নদীর রুই মাছের স্পেশাল পিস ও চিকেন কারি',
    recommendationEn: 'Slow-Cooked Beef, Fresh River Rui Steaks & Chicken Curry',
  },
  family_cabin: {
    category: 'lunch_dinner',
    titleBn: 'পারিবারিক ভোজ মেনু (ভাত, খিচুড়ি ও ফ্যামিলি ডিল)',
    titleEn: 'Family Cabin Feast (Steamed Rice, Khichuri & Platters)',
    descBn: 'পর্দাযুক্ত পারিবারিক পরিবেশে সকলে একসাথে খাওয়ার জন্য বড় বাটির ধোঁয়া ওঠা সাদা ভাত, ঘন ডাল, ভর্তা ও গরুর মাংস।',
    descEn: 'Private family dining with generous portions of steamed rice, thick dal, assorted vortas & beef.',
    badgeBn: '👨‍👩‍👧‍👦 ফ্যামিলি কেবিন স্পেশাল',
    badgeEn: '👨‍👩‍👧‍👦 Family Cabin Special',
    recommendationBn: 'সাদা ভাত, পারিবারিক খিচুড়ি সেট, ঘন মুগ-মসুর ডাল ও কষা মাংস',
    recommendationEn: 'Fluffy White Rice, Family Khichuri Sets & Thick Dal',
  },
  rooftop: {
    category: 'sweets_snacks',
    titleBn: 'রুফটপ স্পেশাল (খাঁটি জিলাপি, নাস্তা ও চা)',
    titleEn: 'Rooftop Special (Crispy Hot Jilapi, Snacks & Tea)',
    descBn: 'খোলা ছাদে স্টেশন রোডের দৃশ্যের সাথে গরম কড়াইয়ের রসালো জিলাপি, মুচমুচে সিঙ্গারা, সমুচা ও স্পেশাল দুধ চা।',
    descEn: 'Open terrace ambience paired with hot syrupy jilapi, crispy snacks and rich milk tea.',
    badgeBn: '🌆 রুফটপ জিলাপি ও বিকেলের নাস্তা',
    badgeEn: '🌆 Rooftop Jilapi & Evening Snacks',
    recommendationBn: 'গরম রসালো জিলাপি (১৬০ ৳), সিঙ্গারা, সমুচা ও স্পেশাল চা',
    recommendationEn: 'Hot Crispy Jilapi (160 ৳), Singara, Samucha & Spiced Tea',
  },
  standard: {
    category: 'lunch_dinner',
    titleBn: 'প্রধান ডাইনিং সুস্বাদু খাবার (ভাত, ডাল ও মাছ-মাংস)',
    titleEn: 'Main Dining Everyday Meals (Rice, Dal & Curries)',
    descBn: 'হোটেল আল শেখ ফরিদের নিয়মিত ডাইনিং হলের প্রতিদিনের তাজা ভাত, ডাল, রুই মাছ, ডিম ও মাংসের কম্বিনেশন।',
    descEn: 'Hearty everyday homestyle meals with fresh rice, lentil dal, river fish and hearty curries.',
    badgeBn: '🍽️ প্রধান ডাইনিং প্রতিদিনের খাবার',
    badgeEn: '🍽️ Main Dining Everyday Meals',
    recommendationBn: 'ধোঁয়া ওঠা ভাত, রুই মাছের ঝোল, ডিম ভুনা ও সবজি ডাল',
    recommendationEn: 'Steamed Rice, Fresh Rui Curry, Egg Bhuna & Mixed Dal',
  },
};

interface TableQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCheckIn: (session: ActiveTableSession) => void;
  onOrderForTable: (tableNumber: string, tableLabelBn: string, tableType?: TableType) => void;
  activeTableSession: ActiveTableSession | null;
  reservations: TableReservation[];
  onUpdateReservationStatus?: (reservationId: string, status: 'checked_in' | 'seated') => void;
  user: UserProfile;
  lang: 'bn' | 'en';
  onFilterMenuByTable?: (category: FoodCategory, tableSession?: ActiveTableSession) => void;
  onClearTableSession?: () => void;
}

// Preset Hotel Tables for Table QR Generation & Simulator
export interface PresetTable {
  id: string;
  tableNumber: string;
  nameBn: string;
  nameEn: string;
  type: TableType;
  zoneBn: string;
  zoneEn: string;
  seats: number;
}

export const HOTEL_TABLES_CATALOG: PresetTable[] = [
  {
    id: 'TB-1',
    tableNumber: 'টেবিল ১',
    nameBn: 'টেবিল ০১ (প্রধান ডাইনিং হল)',
    nameEn: 'Table 01 (Main Dining)',
    type: 'standard',
    zoneBn: 'মেইন ডাইনিং হল - কাউন্টার সংলগ্ন',
    zoneEn: 'Main Dining Hall - Near Cashier Counter',
    seats: 4,
  },
  {
    id: 'TB-2',
    tableNumber: 'টেবিল ২',
    nameBn: 'টেবিল ০২ (প্রধান ডাইনিং হল)',
    nameEn: 'Table 02 (Main Dining)',
    type: 'standard',
    zoneBn: 'মেইন ডাইনিং হল - মধ্যবর্তী স্পেস',
    zoneEn: 'Main Dining Hall - Center Space',
    seats: 4,
  },
  {
    id: 'TR-1',
    tableNumber: 'ট্রেন ভিউ টেবিল ১',
    nameBn: 'ট্রেন ভিউ ০১ (স্টেশন ও রেলওয়ে প্ল্যাটফর্ম ভিউ)',
    nameEn: 'Train View 01 (Platform Vista)',
    type: 'train_view',
    zoneBn: '১ম তলা উত্তর জানালা - গৌরীপুর জংশন ট্র্যাক ভিউ',
    zoneEn: '1st Floor North Window - Junction Track View',
    seats: 6,
  },
  {
    id: 'TR-2',
    tableNumber: 'ট্রেন ভিউ টেবিল ২',
    nameBn: 'ট্রেন ভিউ ০২ (স্টেশন ও প্ল্যাটফর্ম ভিউ)',
    nameEn: 'Train View 02 (Station Vista)',
    type: 'train_view',
    zoneBn: '১ম তলা পূর্ব জানালা - ট্রেন আসা-যাওয়া দৃশ্য',
    zoneEn: '1st Floor East Window - Arriving Train View',
    seats: 4,
  },
  {
    id: 'VIP-1',
    tableNumber: 'ভিআইপি এসি কেবিন ১',
    nameBn: 'ভিআইপি কেবিন ০১ (শীতাতপ নিয়ন্ত্রিত ভিআইপি স্যুট)',
    nameEn: 'VIP AC Cabin 01 (Luxury Suite)',
    type: 'vip_ac',
    zoneBn: 'ভিআইপি এসি লাউঞ্জ - শান্ত ও নিরিবিলি কেবিন',
    zoneEn: 'VIP AC Lounge - Private Executive Suite',
    seats: 8,
  },
  {
    id: 'FAM-1',
    tableNumber: 'ফ্যামিলি কেবিন ১',
    nameBn: 'পর্দাযুক্ত ফ্যামিলি কেবিন ০১',
    nameEn: 'Private Family Cabin 01',
    type: 'family_cabin',
    zoneBn: 'পারিবারিক ডাইনিং কর্নার - পর্দাযুক্ত প্রাইভেসি',
    zoneEn: 'Family Dining Corner - Traditional Privacy',
    seats: 8,
  },
  {
    id: 'RT-1',
    tableNumber: 'রুফটপ টেবিল ১',
    nameBn: 'রুফটপ গার্ডেন টেবিল ০১',
    nameEn: 'Rooftop Garden Table 01',
    type: 'rooftop',
    zoneBn: 'রুফটপ ওপেন এয়ার টেরেস - স্টেশন রোড ভিউ',
    zoneEn: 'Rooftop Open Terrace - Station Road View',
    seats: 4,
  },
];

export const TableQrScannerModal: React.FC<TableQrScannerModalProps> = ({
  isOpen,
  onClose,
  onTableCheckIn,
  onOrderForTable,
  activeTableSession,
  reservations,
  onUpdateReservationStatus,
  user,
  lang,
  onFilterMenuByTable,
  onClearTableSession,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'tables_qr'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [autoFilterMenu, setAutoFilterMenu] = useState<boolean>(true);

  // Scanned result state
  const [scannedTable, setScannedTable] = useState<ActiveTableSession | null>(null);
  const [matchedReservation, setMatchedReservation] = useState<TableReservation | null>(null);
  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);

  // Table QR Catalog generated images cache
  const [tableQrImages, setTableQrImages] = useState<Record<string, string>>({});
  const [selectedCatalogTable, setSelectedCatalogTable] = useState<PresetTable | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate QR code URLs for hotel table catalog
  useEffect(() => {
    const generateCatalogQrs = async () => {
      const generated: Record<string, string> = {};
      for (const table of HOTEL_TABLES_CATALOG) {
        const payload = JSON.stringify({
          brand: 'Hotel Al Sheikh Farid',
          type: 'TABLE_QR',
          tableId: table.id,
          tableNumber: table.tableNumber,
          tableLabelBn: table.nameBn,
          tableLabelEn: table.nameEn,
          tableType: table.type,
          hotel: HOTEL_INFO.nameBn,
          seats: table.seats,
          location: HOTEL_INFO.locationBn,
          url: `https://al-sheikh-farid.hotel/?table=${table.id}&type=${table.type}`,
        });

        try {
          const url = await QRCode.toDataURL(payload, {
            width: 320,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          generated[table.id] = url;
        } catch (e) {
          console.error('Error generating table QR:', e);
        }
      }
      setTableQrImages(generated);
    };

    generateCatalogQrs();
  }, []);

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
      setCameraStream(null);
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, [cameraStream]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    if (!isOpen || activeTab !== 'camera' || scannedTable) return;

    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(lang === 'bn' ? 'আপনার ডিভাইসের ব্রাউজার ক্যামেরা সাপোর্ট করে না।' : 'Camera API not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check if Torch is supported
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() as { torch?: boolean }) || {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
        setCameraError(
          lang === 'bn'
            ? 'ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে ক্যামেরা পারমিশন অনুমোদন করুন অথবা কিউআর ছবি আপলোড বা তালিকা থেকে নির্বাচন করুন।'
            : 'Camera permission denied. Please allow camera access in browser settings or upload a QR image.'
        );
      } else {
        setCameraError(
          lang === 'bn'
            ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে। কিউআর ফটো আপলোড করুন বা টেবিল তালিকা ব্যবহার করুন।'
            : 'Unable to start camera. Please upload a QR code image or select from table list.'
        );
      }
    }
  }, [isOpen, activeTab, scannedTable, facingMode, lang, stopCamera]);

  // Continuous Frame Scanner Loop
  useEffect(() => {
    if (!cameraStream || activeTab !== 'camera' || scannedTable || !isScanning) return;

    let isMounted = true;

    const scanFrame = () => {
      if (!isMounted || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data && isMounted) {
              handleRawQrPayload(code.data);
              return; // Stop scanning once found
            }
          } catch {
            // continue scanning
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraStream, activeTab, scannedTable, isScanning]);

  // Lifecycle control for camera on modal open/close
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedTable) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scannedTable, facingMode]);

  // Parse Raw QR String (JSON, URL, or plain text)
  const handleRawQrPayload = (raw: string) => {
    if (!raw) return;

    let tableId = '';
    let tableNumber = '';
    let tableLabelBn = '';
    let tableLabelEn = '';
    let tableType: TableType = 'standard';
    let reservationId: string | undefined;

    // 1. Try parsing JSON
    try {
      const parsed = JSON.parse(raw);
      if (parsed.tableNumber) tableNumber = parsed.tableNumber;
      if (parsed.tableId) tableId = parsed.tableId;
      if (parsed.tableLabelBn) tableLabelBn = parsed.tableLabelBn;
      if (parsed.tableLabelEn) tableLabelEn = parsed.tableLabelEn;
      if (parsed.tableType) tableType = parsed.tableType;
      if (parsed.reservationId) reservationId = parsed.reservationId;
    } catch {
      // 2. Try parsing URL parameters
      if (raw.includes('?') || raw.includes('&')) {
        try {
          const url = new URL(raw.startsWith('http') ? raw : `https://dummy.com/${raw}`);
          tableId = url.searchParams.get('table') || url.searchParams.get('tableId') || '';
          const typeParam = url.searchParams.get('type') as TableType;
          if (typeParam) tableType = typeParam;
          reservationId = url.searchParams.get('res') || url.searchParams.get('reservationId') || undefined;
        } catch {
          // fallback
        }
      }
      
      // 3. Match from plain text
      if (!tableId && !tableNumber) {
        const text = raw.trim();
        tableNumber = text;
        tableId = text;
      }
    }

    // Match with preset catalog if available
    const catalogMatch = HOTEL_TABLES_CATALOG.find(
      (t) =>
        (tableId && t.id.toLowerCase() === tableId.toLowerCase()) ||
        (tableNumber && t.tableNumber.toLowerCase().includes(tableNumber.toLowerCase())) ||
        (tableNumber && t.id.toLowerCase().includes(tableNumber.toLowerCase()))
    );

    if (catalogMatch) {
      tableNumber = catalogMatch.tableNumber;
      tableLabelBn = catalogMatch.nameBn;
      tableLabelEn = catalogMatch.nameEn;
      tableType = catalogMatch.type;
    } else {
      if (!tableNumber) tableNumber = tableId || 'টেবিল ১';
      if (!tableLabelBn) tableLabelBn = `${tableNumber} (হোটেল আল শেখ ফরিদ)`;
      if (!tableLabelEn) tableLabelEn = `${tableNumber} (Hotel Al Sheikh Farid)`;
    }

    // Check against existing reservations
    const matchedRes = reservations.find(
      (r) =>
        (reservationId && r.id.toLowerCase() === reservationId.toLowerCase()) ||
        (r.tableNumber && r.tableNumber.toLowerCase().includes(tableNumber.toLowerCase())) ||
        (r.tableType === tableType && r.status === 'confirmed')
    );

    const specialtyConfig = TABLE_SPECIALTY_MAP[tableType] || TABLE_SPECIALTY_MAP.standard;
    const locationZoneBn = catalogMatch?.zoneBn || (
      tableType === 'train_view' ? '১ম তলা উত্তর/পূর্ব জানালা - রেলওয়ে প্ল্যাটফর্ম ভিউ' :
      tableType === 'vip_ac' ? 'ভিআইপি এসি লাউঞ্জ - শান্ত ও নিরিবিলি কেবিন' :
      tableType === 'family_cabin' ? 'পারিবারিক ডাইনিং কর্নার - পর্দাযুক্ত প্রাইভেসি' :
      tableType === 'rooftop' ? 'রুফটপ ওপেন এয়ার টেরেস - স্টেশন রোড ভিউ' :
      'মেইন ডাইনিং হল - কাউন্টার সংলগ্ন'
    );
    const locationZoneEn = catalogMatch?.zoneEn || (
      tableType === 'train_view' ? '1st Floor Window - Railway Platform Vista' :
      tableType === 'vip_ac' ? 'VIP AC Lounge - Private Executive Suite' :
      tableType === 'family_cabin' ? 'Family Dining Corner - Traditional Privacy' :
      tableType === 'rooftop' ? 'Rooftop Open Terrace - Station Road View' :
      'Main Dining Hall - Near Cashier'
    );

    const session: ActiveTableSession = {
      tableNumber,
      tableLabelBn,
      tableLabelEn,
      tableType,
      checkInTime: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: user?.name || undefined,
      guestCount: matchedRes?.guestCount || catalogMatch?.seats || 4,
      reservationId: matchedRes?.id || reservationId,
      source: 'camera_qr',
      locationZoneBn,
      locationZoneEn,
      specialtyCategory: specialtyConfig.category,
      specialtyTitleBn: specialtyConfig.titleBn,
      specialtyTitleEn: specialtyConfig.titleEn,
    };

    // Play high-tech scanner beep & confetti
    SoundNotificationService.playQrScanSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
      });
    } catch {}

    setScannedTable(session);
    setMatchedReservation(matchedRes || null);
    setIsScanning(false);
    stopCamera();

    // Auto update reservation to checked_in if matched
    if (matchedRes && onUpdateReservationStatus) {
      onUpdateReservationStatus(matchedRes.id, 'checked_in');
    }
  };

  // Handle Photo Upload from Gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleRawQrPayload(code.data);
          } else {
            alert(
              lang === 'bn'
                ? 'ছবিতে কোনো স্পষ্ট টেবিল কিউআর কোড পাওয়া যায়নি। অনুগ্রহ করে পরিষ্কার ছবি নির্বাচন করুন।'
                : 'No QR code detected in this image. Please try a clearer picture.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Toggle Torch / Flashlight
  const handleToggleTorch = async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    if (track) {
      try {
        const newTorchState = !isTorchOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: newTorchState }],
        });
        setIsTorchOn(newTorchState);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Flip Camera between back and front
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Complete Check-In & Action Handlers
  const handleConfirmCheckInOnly = () => {
    if (!scannedTable) return;
    onTableCheckIn(scannedTable);
    if (autoFilterMenu && scannedTable.specialtyCategory && onFilterMenuByTable) {
      onFilterMenuByTable(scannedTable.specialtyCategory, scannedTable);
    }
    onClose();
  };

  const handleStartOrderingForTable = () => {
    if (!scannedTable) return;
    onTableCheckIn(scannedTable);
    if (autoFilterMenu && scannedTable.specialtyCategory && onFilterMenuByTable) {
      onFilterMenuByTable(scannedTable.specialtyCategory, scannedTable);
    }
    onOrderForTable(scannedTable.tableNumber, scannedTable.tableLabelBn, scannedTable.tableType);
    onClose();
    setTimeout(() => {
      const menuSection = document.getElementById('food-menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    SoundNotificationService.playKitchenBell();
    setTimeout(() => setWaiterCalled(false), 5000);
  };

  const handleScanAnother = () => {
    setScannedTable(null);
    setMatchedReservation(null);
    setIsScanning(true);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white my-4 relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-amber-100">
                  {lang === 'bn' ? 'টেবিল কিউআর স্ক্যানার' : 'Table QR Scanner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {lang === 'bn' ? 'তাত্ক্ষণিক ডাইনিং' : 'Instant Dine-In'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'bn'
                  ? 'টেবিলের কিউআর কোড স্ক্যান করে দ্রুত অর্ডার ও চেক-ইন করুন'
                  : 'Scan table QR code for instant dine-in ordering & check-in'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Camera Scanner / Upload Photo / Table QR Catalog) */}
        <div className="grid grid-cols-3 bg-stone-950/80 p-1.5 border-b border-stone-800 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setScannedTable(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লাইভ ক্যামেরা' : 'Live Camera'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ছবি আপলোড' : 'Upload Image'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('tables_qr');
              stopCamera();
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tables_qr'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'টেবিল কিউআর' : 'Tables QR'}</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* ACTIVE TABLE SESSION HERO CARD (WHEN SESSION IS ALREADY ACTIVE) */}
          {activeTableSession && !scannedTable && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-stone-950 border-2 border-amber-500/50 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">
                        {lang === 'bn' ? activeTableSession.tableLabelBn : activeTableSession.tableLabelEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        {lang === 'bn' ? '● সেশন সক্রিয়' : '● Session Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {lang === 'bn' 
                        ? `লোকেশন: ${activeTableSession.locationZoneBn || 'প্রধান ডাইনিং হল'} • চেক-ইন: ${activeTableSession.checkInTime}`
                        : `Location: ${activeTableSession.locationZoneEn || 'Main Dining'} • In: ${activeTableSession.checkInTime}`}
                    </p>
                  </div>
                </div>
                {onClearTableSession && (
                  <button
                    type="button"
                    onClick={onClearTableSession}
                    className="px-2.5 py-1 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-bold transition-all cursor-pointer shrink-0"
                    title={lang === 'bn' ? 'টেবিল সেশন সমাপ্ত করুন' : 'End table session'}
                  >
                    {lang === 'bn' ? 'চেক-আউট' : 'Check-Out'}
                  </button>
                )}
              </div>

              {/* Table Specialty Preference Active Banner */}
              {activeTableSession.specialtyCategory && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-200">
                        {lang === 'bn' ? 'টেবিলের লোকেশন অনুযায়ী স্পেশাল মেনু ফিল্টার' : 'Table Specialty Preference Filter'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950">
                      {activeTableSession.specialtyCategory === 'breakfast'
                        ? (lang === 'bn' ? 'সকালের নাস্তা ও চা' : 'Breakfast & Tea')
                        : activeTableSession.specialtyCategory === 'fish_meat'
                        ? (lang === 'bn' ? 'মাংস ও নদীর মাছ' : 'Meat & Fish')
                        : activeTableSession.specialtyCategory === 'sweets_snacks'
                        ? (lang === 'bn' ? 'জিলাপি ও নাস্তা' : 'Jilapi & Snacks')
                        : (lang === 'bn' ? 'ভাত, খিচুড়ি ও ডাল' : 'Rice & Khichuri')}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">
                    {lang === 'bn' ? activeTableSession.specialtyTitleBn : activeTableSession.specialtyTitleEn}
                  </h5>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                    <button
                      type="button"
                      onClick={() => {
                        if (onFilterMenuByTable && activeTableSession.specialtyCategory) {
                          onFilterMenuByTable(activeTableSession.specialtyCategory, activeTableSession);
                        }
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'স্পেশাল ফিল্টারযুক্ত মেনু দেখুন' : 'View Filtered Menu'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onFilterMenuByTable) {
                          onFilterMenuByTable('all', activeTableSession);
                        }
                        onClose();
                      }}
                      className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      {lang === 'bn' ? 'সব খাবার দেখুন (রিসেট)' : 'View All Items'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCallWaiter}
                      className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <BellRing className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'bn' ? 'ওয়েটার' : 'Waiter'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS VIEW WHEN TABLE IS SCANNED */}
          {scannedTable ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-stone-900 to-amber-950/70 border-2 border-emerald-500/60 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {lang === 'bn' ? '✓ টেবিল সফলভাবে শনাক্ত হয়েছে' : '✓ Table QR Verified'}
                    </span>
                    <h4 className="text-lg font-black font-serif text-white mt-0.5">
                      {lang === 'bn' ? scannedTable.tableLabelBn : scannedTable.tableLabelEn}
                    </h4>
                    <p className="text-xs text-stone-300">
                      {lang === 'bn' ? `চেক-ইন সময়: ${scannedTable.checkInTime}` : `Check-In Time: ${scannedTable.checkInTime}`}
                    </p>
                  </div>
                </div>

                {/* Table Location & Zone Details */}
                <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-semibold">
                      {lang === 'bn' ? 'টেবিল লোকেশন ও পরিবেশ' : 'Table Location & Zone'}
                    </span>
                    <span className="font-bold text-stone-200 text-xs">
                      {lang === 'bn' 
                        ? (scannedTable.locationZoneBn || 'প্রধান ডাইনিং হল')
                        : (scannedTable.locationZoneEn || 'Main Dining Hall')}
                    </span>
                  </div>
                </div>

                {/* Table Specialty Preference Card & Auto-Filter Control */}
                {scannedTable.tableType && TABLE_SPECIALTY_MAP[scannedTable.tableType] && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-stone-900 border border-amber-500/50 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-black text-amber-200">
                          {lang === 'bn' ? 'টেবিলের লোকেশন অনুযায়ী স্পেশাল মেনু' : 'Location Specialty Preference'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 shadow-xs">
                        {lang === 'bn'
                          ? TABLE_SPECIALTY_MAP[scannedTable.tableType].badgeBn
                          : TABLE_SPECIALTY_MAP[scannedTable.tableType].badgeEn}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white">
                        {lang === 'bn'
                          ? TABLE_SPECIALTY_MAP[scannedTable.tableType].titleBn
                          : TABLE_SPECIALTY_MAP[scannedTable.tableType].titleEn}
                      </h5>
                      <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                        {lang === 'bn'
                          ? TABLE_SPECIALTY_MAP[scannedTable.tableType].descBn
                          : TABLE_SPECIALTY_MAP[scannedTable.tableType].descEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoFilterMenu}
                          onChange={(e) => setAutoFilterMenu(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                          {lang === 'bn'
                            ? 'চেক-ইনের সাথে সাথে মূল খাবারের মেনু স্বয়ংক্রিয়ভাবে ফিল্টার করুন'
                            : 'Auto-filter main food menu for this table upon check-in'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Table Quick Details Badge Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-800 text-xs">
                  <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'টেবিল ক্যাটাগরি' : 'Zone'}</span>
                    <span className="font-bold text-amber-300 capitalize">
                      {scannedTable.tableType?.replace('_', ' ') || 'Standard'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'অতিথি ক্যাপাসিটি' : 'Capacity'}</span>
                    <span className="font-bold text-stone-200">
                      {scannedTable.guestCount || 4} {lang === 'bn' ? 'আসন' : 'Seats'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 block">{lang === 'bn' ? 'ফ্রি ওয়াইফাই' : 'Fast WiFi'}</span>
                    <span className="font-bold text-emerald-400">Hotel_Farid_Guest</span>
                  </div>
                </div>

                {/* Matched Reservation Banner if linked */}
                {matchedReservation && (
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold block">
                          {lang === 'bn' ? 'রিজার্ভেশনের সাথে চেক-ইন যুক্ত হয়েছে' : 'Linked with Active Reservation'}
                        </span>
                        <span className="text-[11px] text-stone-300 font-mono">{matchedReservation.id} • {matchedReservation.timeSlot}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {lang === 'bn' ? 'চেক-ইন সম্পন্ন' : 'Checked In'}
                    </span>
                  </div>
                )}

                {/* Waiter Call feedback */}
                {waiterCalled && (
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2 animate-in fade-in">
                    <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="font-bold">
                      {lang === 'bn'
                        ? `🛎️ ${scannedTable.tableNumber}-এ ওয়েটারকে বার্তা পাঠানো হয়েছে! অল্পক্ষণের মধ্যে সার্ভার উপস্থিত হবেন।`
                        : `🛎️ Waiter alerted for ${scannedTable.tableNumber}! Server will attend to your table shortly.`}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleStartOrderingForTable}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>
                    {lang === 'bn'
                      ? `মেনু খুলুন এবং এই টেবিলে খাবার অর্ডার করুন (${scannedTable.tableNumber})`
                      : `Open Menu & Order for ${scannedTable.tableNumber}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCallWaiter}
                    className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'টেবিলে ওয়েটার ডাকুন' : 'Call Waiter'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCheckInOnly}
                    className="py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'চেক-ইন নিশ্চিত করুন' : 'Confirm Check-In'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleScanAnother}
                  className="w-full py-2 text-stone-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'অন্য কোনো টেবিল কিউআর স্ক্যান করুন' : 'Scan another table QR'}</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* LIVE CAMERA SCANNER VIEW */
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-1">
                        {lang === 'bn' ? 'ক্যামেরা সংযোগ সমস্যা' : 'Camera Access Needed'}
                      </span>
                      <p className="leading-relaxed text-red-200">{cameraError}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-red-500/20">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tables_qr')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'টেবিল তালিকা থেকে বেছে নিন' : 'Select from Table List'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* LIVE CAMERA VIEWFINDER */
                <div className="relative w-full aspect-square max-h-[320px] rounded-3xl overflow-hidden bg-black border-2 border-amber-500/50 shadow-2xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* High-Tech Scanner Reticle & Laser Beam Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-amber-400/40 rounded-2xl">
                      {/* Corner Target Brackets */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                      {/* Animated Scanning Laser Line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,1)] animate-bounce" />
                    </div>
                  </div>

                  {/* Floating Camera Controls (Torch, Flip) */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={handleToggleTorch}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                          isTorchOn
                            ? 'bg-amber-500 text-stone-950 shadow-lg'
                            : 'bg-black/60 text-stone-200 hover:bg-black/80'
                        }`}
                        title={lang === 'bn' ? 'ফ্ল্যাশলাইট' : 'Torch / Flash'}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-stone-200 backdrop-blur-md transition-colors cursor-pointer"
                      title={lang === 'bn' ? 'ক্যামেরা পরিবর্তন' : 'Flip Camera'}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scanning Guide Chip */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-950/80 border border-amber-500/40 text-[11px] font-bold text-amber-200 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{lang === 'bn' ? 'টেবিল কিউআর কোডের দিকে ক্যামেরা তাক করুন' : 'Point camera at table QR code'}</span>
                  </div>
                </div>
              )}

              {/* Instructions and Quick Simulation Banner */}
              <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'রেস্টুরেন্টে কীভাবে ব্যবহার করবেন?' : 'How to use at restaurant?'}</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'হোটেল আল শেখ ফরিদ-এর প্রতিটি টেবিল ও ভিআইপি কেবিনে কিউআর কোড লাগানো রয়েছে। স্ক্যান করলেই সরাসরি টেবিল নম্বর সিলেক্ট হয়ে আপনার খাবার অর্ডারের জন্য প্রস্তুত হবে।'
                    : 'Each table and VIP cabin features a dedicated QR sticker. Point your camera to instantly bind your session to that table.'}
                </p>
              </div>

              {/* Quick Table Test Bar (Simulate QR Scan with 1 Click) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {lang === 'bn' ? '⚡ দ্রুত টেস্ট স্ক্যান (১-ক্লিকে চেক-ইন):' : '⚡ Quick Test Scan (1-Click Simulation):'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {HOTEL_TABLES_CATALOG.slice(0, 4).map((tbl) => (
                    <button
                      key={tbl.id}
                      type="button"
                      onClick={() => handleRawQrPayload(tbl.id)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-amber-500/20 border border-stone-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                    >
                      <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200 truncate">{tbl.tableNumber}</p>
                      <p className="text-[9px] text-stone-400 capitalize">{tbl.type.replace('_', ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            /* PHOTO UPLOAD SCANNER VIEW */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-stone-950/60 hover:bg-stone-950 rounded-3xl text-center space-y-3 cursor-pointer transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'টেবিল কিউআর কোডের ছবি আপলোড করুন' : 'Upload Table QR Image'}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    {lang === 'bn'
                      ? 'মোবাইলে সেভ করা বা তোলা টেবিল স্টিকারের কিউআর ছবি নির্বাচন করুন'
                      : 'Choose saved photo of table QR code from your gallery'}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Gallery'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            /* HOTEL TABLE QR CATALOG / STICKERS FOR RESTAURANT */
            <div className="space-y-3">
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs text-stone-300">
                <span className="font-bold text-amber-300 block mb-0.5">
                  {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ - টেবিল কিউআর স্টিকার ক্যাটালগ' : 'Hotel Al Sheikh Farid - Table QR Catalog'}
                </span>
                <p className="text-[11px] text-stone-400">
                  {lang === 'bn'
                    ? 'হোটেলের প্রতিটি টেবিল ও ভিআইপি কেবিনের জন্য বরাদ্দকৃত কিউআর কোড দেখুন বা সরাসরি স্ক্যান সিমুলেট করুন।'
                    : 'View QR codes for all tables & cabins to test scanning or print for physical tables.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HOTEL_TABLES_CATALOG.map((tbl) => {
                  const qrUrl = tableQrImages[tbl.id];
                  const Icon =
                    tbl.type === 'train_view'
                      ? Train
                      : tbl.type === 'vip_ac'
                      ? Wind
                      : tbl.type === 'rooftop'
                      ? Compass
                      : UtensilsCrossed;

                  return (
                    <div
                      key={tbl.id}
                      className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={() => handleRawQrPayload(tbl.id)}
                          className="w-14 h-14 bg-white p-1 rounded-xl shadow-md border border-amber-500/40 shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group relative"
                          title={lang === 'bn' ? 'স্ক্যান টেস্ট করতে ক্লিক করুন' : 'Click to simulate scan'}
                        >
                          {qrUrl ? (
                            <img src={qrUrl} alt={tbl.nameBn} className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-6 h-6 text-stone-800 animate-pulse" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white truncate max-w-[130px]">
                              {lang === 'bn' ? tbl.nameBn : tbl.nameEn}
                            </h5>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{tbl.zoneBn}</p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[9px] text-amber-300 font-mono font-bold">
                              ID: {tbl.id} • {tbl.seats} {lang === 'bn' ? 'আসন' : 'seats'}
                            </span>
                            {TABLE_SPECIALTY_MAP[tbl.type] && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {lang === 'bn' ? TABLE_SPECIALTY_MAP[tbl.type].badgeBn : TABLE_SPECIALTY_MAP[tbl.type].badgeEn}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRawQrPayload(tbl.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] font-black shrink-0 transition-all cursor-pointer shadow-xs"
                      >
                        {lang === 'bn' ? 'স্ক্যান করুন' : 'Scan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE RESERVATION QUICK CHECK-IN WIDGET */}
          {reservations && reservations.length > 0 && !scannedTable && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">
                    {lang === 'bn' ? 'আপনার অগ্রিম বুকিং থেকে দ্রুত চেক-ইন' : 'Quick Check-In from Your Bookings'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">{reservations.length} {lang === 'bn' ? 'টি বুকিং' : 'Bookings'}</span>
              </div>

              <div className="space-y-1.5">
                {reservations.slice(0, 2).map((res) => (
                  <div
                    key={res.id}
                    className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{res.tableNumber || res.tableType}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({res.id})</span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {res.date} • {res.timeSlot} • {res.guestCount} {lang === 'bn' ? 'জন' : 'guests'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const spec = TABLE_SPECIALTY_MAP[res.tableType] || TABLE_SPECIALTY_MAP.standard;
                        const session: ActiveTableSession = {
                          tableNumber: res.tableNumber || 'টেবিল ১',
                          tableLabelBn: `${res.tableNumber || 'টেবিল ১'} (বুকিং: ${res.id})`,
                          tableLabelEn: `${res.tableNumber || 'Table 1'} (Booking: ${res.id})`,
                          tableType: res.tableType,
                          checkInTime: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          customerName: res.customerName,
                          guestCount: res.guestCount,
                          reservationId: res.id,
                          source: 'reservation_sync',
                          locationZoneBn: res.tableType === 'train_view' ? '১ম তলা উত্তর/পূর্ব জানালা - রেলওয়ে প্ল্যাটফর্ম ভিউ' :
                            res.tableType === 'vip_ac' ? 'ভিআইপি এসি লাউঞ্জ - শান্ত ও নিরিবিলি কেবিন' :
                            res.tableType === 'family_cabin' ? 'পারিবারিক ডাইনিং কর্নার - পর্দাযুক্ত প্রাইভেসি' :
                            res.tableType === 'rooftop' ? 'রুফটপ ওপেন এয়ার টেরেস - স্টেশন রোড ভিউ' :
                            'মেইন ডাইনিং হল - কাউন্টার সংলগ্ন',
                          locationZoneEn: res.tableType === 'train_view' ? '1st Floor Window - Railway Platform Vista' :
                            res.tableType === 'vip_ac' ? 'VIP AC Lounge - Private Executive Suite' :
                            res.tableType === 'family_cabin' ? 'Family Dining Corner - Traditional Privacy' :
                            res.tableType === 'rooftop' ? 'Rooftop Open Terrace - Station Road View' :
                            'Main Dining Hall - Near Cashier',
                          specialtyCategory: spec.category,
                          specialtyTitleBn: spec.titleBn,
                          specialtyTitleEn: spec.titleEn,
                        };
                        setScannedTable(session);
                        setMatchedReservation(res);
                        SoundNotificationService.playQrScanSuccess();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'চেক-ইন' : 'Check-In'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {lang === 'bn'
              ? 'নিরাপদ ডিজিটাল টেবিল সার্ভিস • হোটেল আল শেখ ফরিদ, গৌরীপুর জংশন'
              : 'Secure Table Service • Hotel Al Sheikh Farid'}
          </span>
        </div>
      </div>
    </div>
  );
};
