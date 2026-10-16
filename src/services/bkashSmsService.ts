import { Order } from '../types';
import { HOTEL_INFO } from '../data/initialData';

export interface BkashSmsLetter {
  id: string;
  sender: string; // 'bKash' or '7272'
  receiverNumber: string; // '01761869921'
  senderPhone: string; // e.g. '017XXXXXXXX'
  amount: number;
  trxId: string;
  reference?: string;
  balance?: number;
  fee?: number;
  timestamp: string;
  rawText: string;
  matchedOrderId?: string;
  isVerified: boolean;
  createdAt: string;
}

/**
 * Generates an authentic Bangladeshi bKash personal incoming SMS letter.
 */
export function generateBkashSmsLetter(order: Order, customSenderPhone?: string): BkashSmsLetter {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const timestamp = `${dateStr} ${timeStr}`;
  
  const senderPhone = customSenderPhone || order.customerPhone || '01761869921';
  const trxId = order.transactionId || 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const amount = order.total;
  const balance = 18450 + amount;

  const rawText = `You have received Tk ${amount.toFixed(2)} from ${senderPhone}. Ref ${order.id}. Fee Tk 0.00. Balance Tk ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. TrxID ${trxId} at ${timestamp}.`;

  return {
    id: 'sms_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    sender: 'bKash (7272)',
    receiverNumber: '01761869921',
    senderPhone,
    amount,
    trxId,
    reference: order.id,
    balance,
    fee: 0,
    timestamp,
    rawText,
    matchedOrderId: order.id,
    isVerified: order.paymentStatus === 'verified' || order.paymentStatus === 'paid',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Parses raw SMS text copied from Android / iPhone into a structured BkashSmsLetter.
 */
export function parseBkashSms(rawText: string): Partial<BkashSmsLetter> {
  const cleaned = rawText.trim();
  
  // Extract TrxID: TrxID 9K38FX12A or TrxID: 9K38FX12A or TRX: ...
  const trxMatch = cleaned.match(/(?:TrxID|trxID|TRXID|Trx Id|Trx|TRX)[:\s]+([A-Z0-9]{6,14})/i);
  const trxId = trxMatch ? trxMatch[1].toUpperCase() : '';

  // Extract Amount: received Tk 450.00 or Tk 450 or 450 Tk
  const amountMatch = cleaned.match(/(?:Tk|TK|BDT|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || 
                      cleaned.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:Tk|TK|BDT|৳)/i);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, '')) || 0;
  }

  // Extract Sender Phone: from 01XXXXXXXXX or from +8801XXXXXXXXX
  const phoneMatch = cleaned.match(/(?:from|From)\s*(\+?8801[0-9]{9}|01[0-9]{9})/i);
  const senderPhone = phoneMatch ? phoneMatch[1] : '';

  // Extract Reference: Ref ORD123 or Ref: ORD123
  const refMatch = cleaned.match(/(?:Ref|ref)[:\s]+([a-zA-Z0-9_-]+)/i);
  const reference = refMatch ? refMatch[1] : undefined;

  // Extract Time
  const timeMatch = cleaned.match(/at\s+([0-9/:\sAPMapm-]+)/i);
  const timestamp = timeMatch ? timeMatch[1].trim() : new Date().toLocaleString();

  return {
    rawText: cleaned,
    trxId,
    amount,
    senderPhone,
    reference,
    timestamp,
    receiverNumber: '01761869921',
  };
}

/**
 * Matches an SMS with a list of orders to find the corresponding order for 1-click confirmation.
 */
export function matchSmsWithOrders(
  sms: Partial<BkashSmsLetter>, 
  orders: Order[]
): { matchedOrder?: Order; confidence: 'exact' | 'high' | 'partial' | 'none'; messageBn: string; messageEn: string } {
  if (!orders || orders.length === 0) {
    return {
      confidence: 'none',
      messageBn: 'কোনো চলমান অর্ডার পাওয়া যায়নি।',
      messageEn: 'No active orders found.',
    };
  }

  // 1. Exact Match by TrxID
  if (sms.trxId) {
    const exactTrxOrder = orders.find(
      (o) => o.transactionId && o.transactionId.toUpperCase() === sms.trxId?.toUpperCase()
    );
    if (exactTrxOrder) {
      return {
        matchedOrder: exactTrxOrder,
        confidence: 'exact',
        messageBn: `TrxID (${sms.trxId}) সফলভাবে মিলেছে! অর্ডার নং #${exactTrxOrder.id}`,
        messageEn: `Exact TrxID match (${sms.trxId}) with Order #${exactTrxOrder.id}!`,
      };
    }
  }

  // 2. Match by Reference ID
  if (sms.reference) {
    const exactRefOrder = orders.find(
      (o) => o.id.toLowerCase() === sms.reference?.toLowerCase()
    );
    if (exactRefOrder) {
      return {
        matchedOrder: exactRefOrder,
        confidence: 'high',
        messageBn: `অর্ডার রেফারেন্স নং #${exactRefOrder.id} সফলভাবে মিলেছে!`,
        messageEn: `Order reference #${exactRefOrder.id} matched successfully!`,
      };
    }
  }

  // 3. Match by Phone Number + Pending Status + Amount
  if (sms.senderPhone && sms.amount) {
    const phoneAndAmountOrder = orders.find(
      (o) => (o.customerPhone.includes(sms.senderPhone?.slice(-8) || '') || (sms.senderPhone?.includes(o.customerPhone.slice(-8)))) &&
             Math.abs(o.total - (sms.amount || 0)) < 2
    );
    if (phoneAndAmountOrder) {
      return {
        matchedOrder: phoneAndAmountOrder,
        confidence: 'high',
        messageBn: `মোবাইল ও টাকার পরিমাণ (৳ ${sms.amount}) অনুযায়ী অর্ডার #${phoneAndAmountOrder.id} শনাক্ত হয়েছে।`,
        messageEn: `Matched Order #${phoneAndAmountOrder.id} by Phone & Amount (৳ ${sms.amount}).`,
      };
    }
  }

  // 4. Match by Phone Number only for pending bKash order
  if (sms.senderPhone) {
    const phoneOrder = orders.find(
      (o) => o.paymentMethod === 'bkash' && 
             (o.customerPhone.includes(sms.senderPhone?.slice(-8) || '') || sms.senderPhone?.includes(o.customerPhone.slice(-8)))
    );
    if (phoneOrder) {
      return {
        matchedOrder: phoneOrder,
        confidence: 'partial',
        messageBn: `গ্রাহকের ফোন নম্বর (${sms.senderPhone}) অনুযায়ী অর্ডার #${phoneOrder.id} পাওয়া গেছে।`,
        messageEn: `Matched Order #${phoneOrder.id} by phone number (${sms.senderPhone}).`,
      };
    }
  }

  // 5. Match by exact amount among pending bKash orders
  if (sms.amount) {
    const amountOrder = orders.find(
      (o) => o.paymentMethod === 'bkash' && (o.status === 'pending' || o.paymentStatus !== 'verified') && Math.abs(o.total - sms.amount!) < 1
    );
    if (amountOrder) {
      return {
        matchedOrder: amountOrder,
        confidence: 'partial',
        messageBn: `টাকার পরিমাণ (৳ ${sms.amount}) অনুযায়ী পেন্ডিং অর্ডার #${amountOrder.id} পাওয়া গেছে।`,
        messageEn: `Matched pending Order #${amountOrder.id} with amount ৳ ${sms.amount}.`,
      };
    }
  }

  return {
    confidence: 'none',
    messageBn: 'এই এসএমএসের সাথে সরাসরি কোনো অর্ডার মেলেনি। ম্যানুয়ালি যাচাই করুন।',
    messageEn: 'No direct matching order found. Please verify manually.',
  };
}
