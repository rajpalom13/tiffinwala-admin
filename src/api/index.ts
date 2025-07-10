import axios from "axios";

/** -----------------------------
 * BASE URLs
 * -----------------------------
 */
const BASE_BANNER_URL = "https://api.sixty6foods.in/banner";
const BASE_COUPON_URL = "https://api.sixty6foods.in/coupon";
const BASE_POINTS_URL = "https://api.sixty6foods.in/points";
const BASE_NOTIFICATION_URL = "https://api.sixty6foods.in/notification";
const BASE_MERCHANTS_URL = "https://merchant.tiffinwala.services";

/** -----------------------------
 * NOTIFICATIONS
 * -----------------------------
 */
export async function sendNotification(payload: {
  title: string;
  body: string;
}) {
  const { data } = await axios.post(`${BASE_NOTIFICATION_URL}/send`, payload);
  return data;
}

/** -----------------------------
 * POINTS
 * -----------------------------
 */
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

/** -----------------------------
 * BANNERS
 * -----------------------------
 */
export async function uploadBanner(file: File, redirect?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (redirect) {
    formData.append("redirect", redirect);
  }

  const { data } = await axios.post(`${BASE_BANNER_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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

/** -----------------------------
 * COUPONS
 * -----------------------------
 */
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

/** -----------------------------
 * MERCHANTS
 * -----------------------------
 */

/**
 * Get all merchants with balances, UPI, etc.
 */
export async function getMerchantsBalances() {
  const { data } = await axios.get(`${BASE_MERCHANTS_URL}/merchants-balances`);
  return data;
}

/**
 * Mark all unsettled transactions as settled for a merchant.
 */
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

/**
 * Update the UPI ID of a merchant.
 */
export async function updateMerchantUPI(merchantId: string, upi: string) {
  const { data } = await axios.put(
    `${BASE_MERCHANTS_URL}/merchant/${merchantId}/upi`,
    { upi }
  );
  return data;
}