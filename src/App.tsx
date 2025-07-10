import React, { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { BannerManager } from "./components/BannerManager";
import { CouponManager } from "./components/CouponManager";
import { NotificationManager } from "./components/NotificationManager";
import { PointsConfigComponent } from "./components/PointsConfig";
import { MerchantSettlementManager } from "./components/MerchantSettlementManager";
import { MerchantQRCodeManager } from "./components/MerchantQRCodeManager";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "banners":
        return <BannerManager />;
      case "coupons":
        return <CouponManager />;
      case "notifications":
        return <NotificationManager />;
      case "points":
        return <PointsConfigComponent />;
      case "merchant-settlements":
        return <MerchantSettlementManager />;
      case "merchant-qrcodes":
      return <MerchantQRCodeManager />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
