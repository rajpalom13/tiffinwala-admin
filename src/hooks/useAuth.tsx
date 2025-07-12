import { useState, useEffect, createContext, useContext } from "react";
import { sendOtp, verifyOtp } from "../api";

interface AuthContextValue {
  isAuthenticated: boolean;
  sendOtpCode: (phone: string) => Promise<boolean>;
  verifyOtpCode: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const sendOtpCode = async (phone: string) => {
    try {
      await sendOtp(phone);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const verifyOtpCode = async (phone: string, otp: string) => {
    try {
      const res: any = await verifyOtp(phone, otp);
      if (res?.status) {
        localStorage.setItem("token", "dummyToken");
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, sendOtpCode, verifyOtpCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}