import axios from "axios";

const BASE_BANNER_URL = "https://api.tiffinwala.services/banner";
const BASE_COUPON_URL = "https://api.tiffinwala.services/coupon";

export async function sendNotification(payload: {
  title: string;
  body: string;
}) {
  const res = await axios.post(
    "https://api.tiffinwala.services/notification/send",
    payload
  );
  return res.data;
}

/** BANNERS **/

export async function uploadBanner(file: File) {
  const formData = new FormData();
  formData.append("banner", file);

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

/** COUPONS **/

export async function getAllCoupons() {
  const { data } = await axios.get(`${BASE_COUPON_URL}/`);
  return data;
}

export async function createCoupon(payload: {
  code: string;
  discount: number;
  expiryDate: Date;
}) {
  const { data } = await axios.post(`${BASE_COUPON_URL}/`, payload);
  return data;
}

export async function deleteCoupon(id: string) {
  const { data } = await axios.delete(`${BASE_COUPON_URL}/${id}`);
  return data;
}