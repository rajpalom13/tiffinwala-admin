export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}

export interface Banner {
  _id: string;
  url: string;
  redirect?: string | null;
}

export interface Coupon {
  _id: string;
  code: string;
  discount: number | string;
  expiryDate: string;
  minOrder: number;
  maxValue?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  sentAt: Date;
  recipients: number;
}

export interface PointsRange {
  _id: string;
  lower: number;
  upper: number;
  loyaltyPoints: number;
}

export interface StoreSettings {
  isOpen: boolean;
  lastUpdated: Date;
  closureReason?: string;
}

/** ✅ NEW: Merchant Interface **/

export interface Merchant {
  _id: string;
  merchantId: string;
  firstName: string;
  lastName: string;
  phone: string;
  upi: string;
  outstanding: number;
  balance?: number;
  qr?: string;
  transactions?: string[];
  joiningDate?: string;
}