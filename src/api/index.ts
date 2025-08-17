import axios from "axios";

const BASE_BANNER_URL = "https://api.sixty6foods.in/banner";
const BASE_COUPON_URL = "https://api.sixty6foods.in/coupon";
const BASE_POINTS_URL = "https://api.sixty6foods.in/points";
const BASE_NOTIFICATION_URL = "https://api.sixty6foods.in/notification";
const BASE_MERCHANTS_URL = "https://merchant.tiffinwala.services";

// ===== Menu (merchant server) =====
const BASE_MERCHANT_MENU_URL = "https://api.sixty6foods.in";

/** Latest normalized menu payload (raw catalog shape) */
export async function getLatestMenu() {
  const { data } = await axios.get(`${BASE_MERCHANT_MENU_URL}/menu/latest`);
  return data; // raw payload as-is (with image/inStock baked in)
}

/** Fetch from upstream and save a new snapshot */
export async function syncMenu() {
  const { data } = await axios.post(`${BASE_MERCHANT_MENU_URL}/menu/sync`);
  return data;
}

/** Edit a specific item in the latest (or pass ?snapshotId=) snapshot */
export async function editMenuItem(
  itemId: string,
  body: { image?: string; inStock?: boolean }
) {
  const { data } = await axios.put(
    `${BASE_MERCHANT_MENU_URL}/menu/item/${itemId}`,
    body
  );
  return data;
}

// ===== Notifications / Banners / Points / Coupons =====
export async function sendNotification(payload: {
  title: string;
  body: string;
}) {
  const { data } = await axios.post(`${BASE_NOTIFICATION_URL}/send`, payload);
  return data;
}

export async function getAllPointsRanges() {
  const { data } = await axios.get(BASE_POINTS_URL);
  return data;
}

export async function createPointsRange(payload: {
  lower: number;
  upper: number;
  loyaltyPoints: number;
}) {
  const { data } = await axios.post(BASE_POINTS_URL, payload);
  return data;
}

export async function deletePointsRange(id: string) {
  const { data } = await axios.delete(`${BASE_POINTS_URL}/${id}`);
  return data;
}

export async function uploadBanner(file: File, redirect?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (redirect) formData.append("redirect", redirect);

  const { data } = await axios.post(`${BASE_BANNER_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getAllBanners() {
  const { data } = await axios.get(`${BASE_BANNER_URL}/`);
  return data;
}

export async function deleteBanner(id: string) {
  const { data } = await axios.delete(`${BASE_BANNER_URL}/${id}`);
  return data;
}

export async function getAllCoupons() {
  const { data } = await axios.get(`${BASE_COUPON_URL}/`);
  return data;
}

export async function createCoupon(payload: {
  code: string;
  discount: number | string;
  minOrder: number;
  maxValue?: number;
  expiryDate: Date;
}) {
  const { data } = await axios.post(`${BASE_COUPON_URL}/`, payload);
  return data;
}

export async function deleteCoupon(id: string) {
  const { data } = await axios.delete(`${BASE_COUPON_URL}/${id}`);
  return data;
}

// ===== Merchant settlements / extras =====
export async function getMerchantsBalances() {
  const { data } = await axios.get(`${BASE_MERCHANTS_URL}/merchants-balances`);
  return data;
}

export async function getMerchantsUnsettledBalances() {
  const { data } = await axios.get(
    `${BASE_MERCHANTS_URL}/merchants/unsettled-balances`
  );
  return data;
}

export async function settleAllUnsettledTransactions(
  merchantId: string,
  settlementId: string
) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/settle-all-transactions`,
    { settlementId }
  );
  return data;
}

export async function settleAllTransactions(
  merchantId: string,
  settlementId: string
) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/settle-all/${merchantId}`,
    { settlementId }
  );
  return data;
}

export async function updateMerchantUPI(merchantId: string, upi: string) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/upi`,
    { upi }
  );
  return data;
}

export async function getMerchantExtraCash(merchantId: string) {
  const { data } = await axios.get(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/extra-cash`
  );
  return data;
}

export async function settleMerchantExtraCash(
  merchantId: string,
  settlementId: string
) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/extra-cash/settle`,
    { settlementId }
  );
  return data;
}

/** Update merchant extra percentage */
export async function updateMerchantExtraPercentage(
  merchantId: string,
  extraPercentage: number
) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/extra-percentage`,
    { extraPercentage }
  );
  return data;
}

// ===== Analytics / Store / Auth =====
const BASE_URL = "https://api.sixty6foods.in";

export async function getAnalyticsOverview() {
  const { data } = await axios.get(`${BASE_URL}/analytics/overview`);
  return data;
}

export async function getOrdersPerDay() {
  const { data } = await axios.get(`${BASE_URL}/analytics/orders-per-day`);
  return data;
}

export async function getTopItems() {
  const { data } = await axios.get(`${BASE_URL}/analytics/top-items`);
  return data;
}

export async function getStoreStatus() {
  const { data } = await axios.get(`${BASE_URL}/store/status`);
  return data;
}

/** REFUND SYSTEM **/
export async function addLoyaltyPoints(payload: {
  phone: string;
  points: number;
}) {
  const { data } = await axios.post(
    `https://api.sixty6foods.in/user/loyalty`,
    payload
  );
  return data;
}

export async function sendOtp(phoneNumber: string) {
  const { data } = await axios.post(`${BASE_URL}/otp/send`, { phoneNumber });
  return data;
}

export async function verifyOtp(phoneNumber: string, otp: string) {
  const { data } = await axios.post(`${BASE_URL}/otp/verify`, {
    phoneNumber,
    otp,
  });
  return data;
}

export async function toggleCouponStatus(id: string, enabled: boolean) {
  const { data } = await axios.put(`${BASE_COUPON_URL}/${id}/status`, {
    enabled,
  });
  return data;
}

export async function getCouponStatus(code: string, price?: number) {
  const url = price
    ? `${BASE_COUPON_URL}/status/${code}?price=${price}`
    : `${BASE_COUPON_URL}/status/${code}`;
  const { data } = await axios.get(url);
  return data;
}

/** Types (kept here since you already had them in this file) **/
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

/** Merchant (returned by /merchants/unsettled-balances) */
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
  extraPercentage?: number; // keep this for editing % feature
}
