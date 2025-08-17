import React, { useEffect, useState } from "react";
import {
  getMerchantExtraCash,
  settleMerchantExtraCash,
  getMerchantsUnsettledBalances,
  updateMerchantExtraPercentage,
  Merchant as ApiMerchant,
} from "../api";
import { CheckCircle, RefreshCcw, Pencil, X, Save } from "lucide-react";

export interface ExtraCash {
  _id: string;
  merchantId: string;
  amount: number;
  isSettled: boolean;
  settlementId?: string;
}

type Merchant = ApiMerchant; // ensure we use the same shape as API

export const MerchantExtraSettlementManager: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [extraCashTotals, setExtraCashTotals] = useState<Record<string, number>>(
    {}
  );
  const [settlingExtra, setSettlingExtra] = useState<string | null>(null);
  const [settlementIds, setSettlementIds] = useState<Record<string, string>>({});

  // state for editing extra %
  const [editingPctFor, setEditingPctFor] = useState<string | null>(null);
  const [editPctValue, setEditPctValue] = useState<string>(""); // keep as string for controlled input
  const [savingPct, setSavingPct] = useState<string | null>(null);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data: Merchant[] = await getMerchantsUnsettledBalances();
      setMerchants(data);

      // fetch extra cash totals per merchant
      const totals: Record<string, number> = {};
      for (const m of data) {
        try {
          // @ts-ignore
          const extraRecords: any[] = await getMerchantExtraCash(m.merchantId);
          const unsettledTotal = extraRecords
            .filter((x: any) => !x.isSettled)
            .reduce((sum: number, x: any) => sum + x.amount, 0);
          totals[m.merchantId] = unsettledTotal;
        } catch (err) {
          console.error(
            `Failed to load extra cash for merchant ${m.merchantId}:`,
            err
          );
          totals[m.merchantId] = 0;
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
      await loadMerchants();
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

  // --- Edit Extra % handlers ---
  const startEditPct = (merchant: Merchant) => {
    setEditingPctFor(merchant.merchantId);
    setEditPctValue(
      merchant.extraPercentage != null ? String(merchant.extraPercentage) : "0"
    );
  };

  const cancelEditPct = () => {
    setEditingPctFor(null);
    setEditPctValue("");
  };

  const validatePct = (raw: string) => {
    if (raw.trim() === "") return false;
    const n = Number(raw);
    if (!Number.isFinite(n)) return false;
    if (n < 0 || n > 100) return false;
    // Allow up to two decimals
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(raw)) return false;
    return true;
  };

  const savePct = async (merchant: Merchant) => {
    if (!validatePct(editPctValue)) {
      alert("Enter a valid percentage between 0 and 100 (max 2 decimals).");
      return;
    }
    const n = Number(editPctValue);
    setSavingPct(merchant.merchantId);
    try {
      await updateMerchantExtraPercentage(merchant.merchantId, n);
      // optimistic update local state
      setMerchants((prev) =>
        prev.map((m) =>
          m.merchantId === merchant.merchantId
            ? { ...m, extraPercentage: n }
            : m
        )
      );
      cancelEditPct();
      alert("Extra percentage updated.");
    } catch (e) {
      console.error(e);
      alert("Failed to update extra percentage.");
    } finally {
      setSavingPct(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Extra Cash Settlement
          </h1>
          <p className="text-gray-600">
            View unsettled extra cash, see current extra %, and update it per
            merchant.
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
          {merchants.map((merchant) => {
            const isEditing = editingPctFor === merchant.merchantId;
            const pctDisplay =
              merchant.extraPercentage != null
                ? `${merchant.extraPercentage}%`
                : "—";

            return (
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
                  Unsettled Extra Cash:{" "}
                  <span className="text-purple-600 font-bold">
                    ₹ {extraCashTotals[merchant.merchantId] || 0}
                  </span>
                </div>

                {/* Current Extra % + Edit */}
                <div className="mt-2">
                  {!isEditing ? (
                    <div className="flex items-center justify-between">
                      <div className="text-gray-700 text-sm">
                        Current Extra %:{" "}
                        <span className="font-semibold">{pctDisplay}</span>
                      </div>
                      <button
                        onClick={() => startEditPct(merchant)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Edit %</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        New Extra Percentage
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={editPctValue}
                        onChange={(e) => setEditPctValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={savingPct === merchant.merchantId}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePct(merchant)}
                          disabled={savingPct === merchant.merchantId}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditPct}
                          disabled={savingPct === merchant.merchantId}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra cash settlement controls */}
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
            );
          })}
        </div>
      )}
    </div>
  );
};