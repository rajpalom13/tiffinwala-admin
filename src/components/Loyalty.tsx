import React, { useState } from "react";
import { addLoyaltyPoints } from "../api";
import { CheckCircle, RefreshCcw } from "lucide-react";

export const RefundSystem: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [points, setPoints] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!phone.trim() || points === "") {
      alert("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res: any = await addLoyaltyPoints({
        phone,
        points: Number(points),
      });

      if (res.status) {
        setResultMessage(`✅ Points added successfully. New balance: ${res.data.loyaltyPoints}`);
      } else {
        setResultMessage(`❌ ${res.message}`);
      }
    } catch (e) {
      console.error(e);
      setResultMessage("❌ Failed to add points.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Refund System
      </h1>
      <p className="text-gray-600 mb-6">
        Enter user’s phone and points to refund loyalty points.
      </p>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={loading}
        />

        <input
          type="number"
          placeholder="Loyalty Points to Refund"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCcw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Refund Points</span>
            </>
          )}
        </button>

        {resultMessage && (
          <div className="text-sm text-center mt-4 text-gray-700">
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};
