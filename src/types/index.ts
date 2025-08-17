// ===== Existing app-wide types =====
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
  enabled: boolean;
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

/** Merchant */
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
  extraPercentage?: number; // added to support edit % flow
}

// ===== NEW: Catalog types (for ItemsManager) =====

export interface SchedulePrice {
  scheduleId: string;
  price: number;
}

export interface CatalogItem {
  type: string; // "Simple" etc.
  itemId: string;
  skuCode?: string;
  price?: number;
  schedulePrices?: SchedulePrice[];
  displayOrder?: number;
  itemName: string;
  description?: string;
  measuringUnit?: string;
  chargeIds?: string[];
  taxTypeIds?: string[];
  isPriceIncludesTax?: boolean;
  denyDiscount?: boolean;
  categoryId?: string;
  subCategoryId?: string;
  itemTagIds?: string[];
  scheduleIds?: string[];
  optionSetIds?: string[];
  barCode?: string;
  itemNature?: string; // "Goods"
  status?: string; // "Active"
  itemTaxCode?: string;
  variantAttributes?: Array<{ name: string; values: string[] }>;
  variantValues?: Array<{ name: string; value: string }>;
  groupItemId?: string;

  /** Added during normalization step on the server */
  inStock?: boolean;
  image?: string;

  extraInfo?: Record<string, any>;
}

export interface CatalogPayload {
  items: CatalogItem[];
  // Keep other top-level keys flexible (couponProviders, categories, etc.)
  [k: string]: any;
}