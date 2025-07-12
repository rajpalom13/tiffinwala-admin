import React, { useState } from "react";
import { Store } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const Login: React.FC = () => {
  const { sendOtpCode, verifyOtpCode } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    const allowedPhones = ["8950291327", "9719697197"];
    if (!allowedPhones.includes(phone)) {
      setError("Invalid phone number.");
      setLoading(false);
      return;
    }

    const result = await sendOtpCode(phone);
    if (result) {
      setStep("otp");
    } else {
      setError("Failed to send OTP.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    const result = await verifyOtpCode(phone, otp);
    if (result) {
      // the AuthProvider will set isAuthenticated
      // AppContent will show the dashboard automatically
    } else {
      setError("Invalid OTP.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Store Admin Login
          </h1>
        </div>

        {step === "phone" && (
          <>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  );
};
