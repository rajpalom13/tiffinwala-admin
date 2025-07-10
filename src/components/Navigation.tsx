import React from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Store,
  BarChart3,
  Image,
  Ticket,
  Bell,
  Settings,
  LogOut,
  User,
  Coins,
  QrCode,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "banners", label: "Banners", icon: Image },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "points", label: "Points Config", icon: Settings },
    { id: "merchant-settlements", label: "Settlements", icon: Coins },
    { id: "merchant-qrcodes", label: "QR Codes", icon: QrCode },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      {/* Top brand/logo section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Store Admin</h1>
            <p className="text-sm text-gray-400">Management Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};