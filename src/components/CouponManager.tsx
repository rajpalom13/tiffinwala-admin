import React, { useState, useEffect } from "react";
import {
  Plus,
  Ticket,
  Calendar,
  Percent,
  Trash2,
  IndianRupee,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Coupon } from "../types";
import {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus
} from "../api";

export const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    minOrder: 0,
    maxValue: 0,
    expiryDate: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res: any = await getAllCoupons();
    if (res?.status && Array.isArray(res.data)) {
      setCoupons(res.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const discountValue =
      formData.discount === ""
        ? 0
        : isNaN(Number(formData.discount))
        ? formData.discount
        : Number(formData.discount);

    const payload = {
      code: formData.code.toUpperCase(),
      discount: discountValue,
      minOrder: formData.minOrder,
      maxValue: formData.maxValue > 0 ? formData.maxValue : undefined,
      expiryDate: new Date(formData.expiryDate),
    };

    try {
      const res: any = await createCoupon(payload);
      if (res.status) {
        setShowForm(false);
        setFormData({
          code: "",
          discount: "",
          minOrder: 0,
          maxValue: 0,
          expiryDate: "",
        });
        fetchCoupons();
      } else {
        alert("Failed to create coupon.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating coupon.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const res: any = await deleteCoupon(id);
      if (res.status) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res: any = await toggleCouponStatus(id, !currentStatus);
      if (res.status) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, enabled: !currentStatus } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coupon Management
          </h1>
          <p className="text-gray-600">
            Create and manage discount coupons for your store.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Coupon List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No coupons yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first discount coupon to attract customers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {coupon.code}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Percent className="w-3 h-3" />
                        <span>
                          {coupon.discount}
                          {typeof coupon.discount === "number" ? "%" : ""} off
                        </span>
                      </span>
                      {coupon.maxValue !== undefined &&
                        coupon.maxValue > 0 && (
                          <span className="flex items-center space-x-1">
                            <IndianRupee className="w-3 h-3 text-green-600" />
                            <span>Max ₹{coupon.maxValue}</span>
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(coupon._id, coupon.enabled)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={coupon.enabled ? "Disable coupon" : "Enable coupon"}
                  >
                    {coupon.enabled ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min. Order Value:</span>
                  <span className="font-medium">₹{coupon.minOrder}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Expires:</span>
                  </span>
                  <span
                    className={`font-medium ${
                      isExpired(coupon.expiryDate)
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
