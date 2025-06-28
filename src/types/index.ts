export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Banner {
  _id: string;
  url: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  expiryDate: string;
  minOrder: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  sentAt: Date;
  recipients: number;
}

export interface PointsConfig {
  minOrderValue: number;
  maxOrderValue: number;
  pointsAwarded: number;
  isActive: boolean;
}

export interface StoreSettings {
  isOpen: boolean;
  lastUpdated: Date;
  closureReason?: string;
}