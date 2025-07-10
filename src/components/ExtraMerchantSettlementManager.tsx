import React, { useEffect, useState } from "react";
import {
  getMerchantsBalances,
  getMerchantExtraCash,
  settleMerchantExtraCash,
} from "../api";
import { CheckCircle, RefreshCcw } from "lucide-react";

export interface Merchant {
  _id: string;
  merchantId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ExtraCash {
  _id: string;
  merchantId: string;
  amount: number;
  isSettled: boolean;
  settlementId?: string;
}

export const MerchantExtraSettlementManager: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [extraCashTotals, setExtraCashTotals] = useState<Record<string, number>>({});
  const [settlingExtra, setSettlingExtra] = useState<string | null>(null);
  const [settlementIds, setSettlementIds] = useState<Record<string, string>>({});

const loadMerchants = async () => {
  setLoading(true);
  try {
    const data: any = await getMerchantsBalances();
    setMerchants(data);

    // Now fetch extra cash separately
    const totals: Record<string, number> = {};

    for (const m of data) {
      try {
        const extraRecords: any = await getMerchantExtraCash(m.merchantId);
        const unsettledTotal = extraRecords
          .filter((x: any) => !x.isSettled)
          .reduce((sum: any, x: any) => sum + x.amount, 0);
        totals[m.merchantId] = unsettledTotal;
      } catch (err) {
        console.error(
          `Failed to load extra cash for merchant ${m.merchantId}:`,
          err
        );
        totals[m.merchantId] = 0; // fallback
      }
    }

    setExtraCashTotals(totals);
  } catch (e) {
    console.error(e);
    alert("Failed to load merchants");
  }
  setLoading(false);
};

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleSettleExtra = async (merchantId: string) => {
    const settlementId = settlementIds[merchantId];
    if (!settlementId || settlementId.trim() === "") {
      alert("Please enter a settlementId for extra cash settlement.");
      return;
    }

    setSettlingExtra(merchantId);
    try {
      await settleMerchantExtraCash(merchantId, settlementId);
      alert("Extra cash settled successfully!");
      loadMerchants();
    } catch (e) {
      console.error(e);
      alert("Failed to settle extra cash.");
    } finally {
      setSettlingExtra(null);
    }
  };

  const handleInputChange = (merchantId: string, value: string) => {
    setSettlementIds((prev) => ({
      ...prev,
      [merchantId]: value,
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Extra Cash Settlement
          </h1>
          <p className="text-gray-600">
            View unsettled extra cash amounts for each merchant and settle them.
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
                Merchant ID: <span className="font-mono">{merchant.merchantId}</span>
              </div>
              <div className="text-gray-700 text-sm">
                Phone: <span className="font-mono">{merchant.phone}</span>
              </div>
              <div className="text-gray-700 text-sm">
                Unsettled Extra Cash:{" "}
                <span className="text-purple-600 font-bold">
                  ₹ {extraCashTotals[merchant.merchantId] || 0}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <input
                  type="text"
                  placeholder="Settlement ID"
                  value={settlementIds[merchant.merchantId] || ""}
                  onChange={(e) =>
                    handleInputChange(merchant.merchantId, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  disabled={settlingExtra === merchant.merchantId}
                />

                <button
                  onClick={() => handleSettleExtra(merchant.merchantId)}
                  disabled={settlingExtra === merchant.merchantId}
                  className="w-full flex justify-center items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {settlingExtra === merchant.merchantId ? (
                    <span>Settling...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Settle Extra Cash</span>
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