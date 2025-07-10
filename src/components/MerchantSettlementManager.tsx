import React, { useEffect, useState } from "react";
import {
  getMerchantsBalances,
  settleAllTransactions,
  updateMerchantUPI,
} from "../api";
import { CheckCircle, RefreshCcw, Save } from "lucide-react";

export interface Merchant {
  _id: string;
  merchantId: string;
  firstName: string;
  lastName: string;
  phone: string;
  upi: string;
  outstanding: number;
}

export const MerchantSettlementManager: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState<string | null>(null);
  const [settlementIds, setSettlementIds] = useState<Record<string, string>>(
    {}
  );
  const [editingUPI, setEditingUPI] = useState<Record<string, string>>({});
  const [savingUPI, setSavingUPI] = useState<string | null>(null);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const data: any = await getMerchantsBalances();
      console.log(data);
      setMerchants(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load merchants");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleSettle = async (merchantId: string) => {
    const settlementId = settlementIds[merchantId];
    if (!settlementId || settlementId.trim() === "") {
      alert("Please enter a settlementId.");
      return;
    }

    setSettling(merchantId);
    try {
      await settleAllTransactions(merchantId, settlementId);
      alert("Settled successfully!");
      loadMerchants();
    } catch (e) {
      console.error(e);
      alert("Failed to settle transactions.");
    } finally {
      setSettling(null);
    }
  };

  const handleInputChange = (merchantId: string, value: string) => {
    setSettlementIds((prev) => ({
      ...prev,
      [merchantId]: value,
    }));
  };

  const handleUpdateUPI = async (merchantId: string) => {
    const newUpi = editingUPI[merchantId];
    if (!newUpi || newUpi.trim() === "") {
      alert("Please enter a UPI ID.");
      return;
    }

    setSavingUPI(merchantId);
    try {
      await updateMerchantUPI(merchantId, newUpi);
      alert("UPI updated successfully!");
      loadMerchants();
    } catch (e) {
      console.error(e);
      alert("Failed to update UPI.");
    } finally {
      setSavingUPI(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Merchant Settlement
          </h1>
          <p className="text-gray-600">
            View merchant outstanding balances and manage UPI IDs.
          </p>
        </div>
        <button
          onClick={loadMerchants}
          disabled={loading}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading merchants...</div>
      ) : merchants.length === 0 ? (
        <div className="text-gray-600">No merchants found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((merchant) => (
            <div
              key={merchant._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
            >
              <div className="text-xl font-bold text-gray-900">
                {merchant.firstName} {merchant.lastName}
              </div>
              <div className="text-gray-700 text-sm">
                Merchant ID:{" "}
                <span className="font-mono">{merchant.merchantId}</span>
              </div>
              <div className="text-gray-700 text-sm">
                Phone: <span className="font-mono">{merchant.phone}</span>
              </div>
              <div className="text-gray-700 text-sm">
                Outstanding Balance:{" "}
                <span className="text-red-600 font-bold">
                  ₹ {merchant.outstanding}
                </span>
              </div>
              <div className="text-gray-700 text-sm">
                Current UPI ID:{" "}
                <span className="font-mono">{merchant.upi || "—"}</span>
              </div>

              {/* Input to change UPI */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter new UPI ID"
                  value={editingUPI[merchant.merchantId] || merchant.upi || ""}
                  onChange={(e) =>
                    setEditingUPI((prev) => ({
                      ...prev,
                      [merchant.merchantId]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={savingUPI === merchant.merchantId}
                />
                <button
                  onClick={() => handleUpdateUPI(merchant.merchantId)}
                  disabled={savingUPI === merchant.merchantId}
                  className="w-full flex justify-center items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {savingUPI === merchant.merchantId ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Settlement section */}
              <div className="space-y-2 pt-4 border-t border-gray-200 mt-4">
                <input
                  type="text"
                  placeholder="Settlement ID"
                  value={settlementIds[merchant.merchantId] || ""}
                  onChange={(e) =>
                    handleInputChange(merchant.merchantId, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={settling === merchant.merchantId}
                />

                <button
                  onClick={() => handleSettle(merchant.merchantId)}
                  disabled={settling === merchant.merchantId}
                  className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {settling === merchant.merchantId ? (
                    <span>Settling...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Settle All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
