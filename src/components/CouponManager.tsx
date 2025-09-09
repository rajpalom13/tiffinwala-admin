import React, { useState, useEffect } from "react";
import {
  Plus,
  Ticket,
  Calendar,
  Percent,
  Trash2,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  X
} from "lucide-react";
import { Coupon } from "../types";
import {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus
} from "../api";

type LocalFormData = {
  code: string;
  discount: string; // can be % number or special codes like "BOGO"
  minOrder: number;
  maxValue: number;
  expiryDate: string; // yyyy-mm-dd
};

export const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocalFormData>({
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
    try {
      const res: any = await getAllCoupons();
      if (res?.status && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        console.warn("Unexpected getAllCoupons response shape", res);
      }
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      minOrder: 0,
      maxValue: 0,
      expiryDate: "",
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setSubmitting(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      alert("Please enter a coupon code.");
      return;
    }
    if (!formData.expiryDate) {
      alert("Please select an expiry date.");
      return;
    }

    setSubmitting(true);

    // Allow discount to be numeric (percentage) OR a string like "BOGO"
    const discountValue =
      formData.discount === ""
        ? 0
        : isNaN(Number(formData.discount))
        ? formData.discount.trim()
        : Number(formData.discount);

    const payload: any = {
      code: formData.code.toUpperCase().trim(),
      discount: discountValue,
      minOrder: Number(formData.minOrder) || 0,
      // only send maxValue if > 0
      ...(formData.maxValue > 0 ? { maxValue: Number(formData.maxValue) } : {}),
      expiryDate: new Date(formData.expiryDate),
    };

    try {
      const res: any = await createCoupon(payload);
      if (res?.status) {
        closeForm();
        await fetchCoupons();
      } else {
        alert(res?.message || "Failed to create coupon.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const res: any = await deleteCoupon(id);
      if (res?.status) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res: any = await toggleCouponStatus(id, !currentStatus);
      if (res?.status) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, enabled: !currentStatus } : c
          )
        );
      } else {
        alert(res?.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const isExpired = (date: string | Date) => new Date(date) < new Date();

  const todayISO = () => {
    const d = new Date();
    // local yyyy-mm-dd for input[type="date"]
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

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

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeForm}
            aria-hidden="true"
          />
          {/* Dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="coupon-form-title"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 id="coupon-form-title" className="text-xl font-semibold">
                  Create Coupon
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, code: e.target.value }))
                    }
                    placeholder="e.g., SAVE20 or BOGO"
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be auto-uppercased on save.
                  </p>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, discount: e.target.value }))
                    }
                    placeholder="e.g., 10 (for 10%) or BOGO"
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a number for % discount, or a code like “BOGO”.
                  </p>
                </div>

                {/* Min Order / Max Value (₹) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.minOrder}
                      onChange={(e) =>
                        setFormData((s) => ({
                          ...s,
                          minOrder: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Value (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.maxValue}
                      onChange={(e) =>
                        setFormData((s) => ({
                          ...s,
                          maxValue: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave 0 to omit this cap.
                    </p>
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    min={todayISO()}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, expiryDate: e.target.value }))
                    }
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};