export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}

export interface Banner {
  _id: string;
  url: string;
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
