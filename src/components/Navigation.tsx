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
  Coins,
  QrCode,
  DollarSign,
  RotateCw,
  LucideIcon,
  List, // <-- NEW icon for Items
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "items", label: "Items", icon: List }, // <-- NEW
    { id: "banners", label: "Banners", icon: Image },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "points", label: "Points Config", icon: Settings },
    { id: "merchant-settlements", label: "Settlements", icon: Coins },
    { id: "merchant-extra-settlements", label: "Extra Cash Settlement", icon: DollarSign },
    { id: "merchant-qrcodes", label: "QR Codes", icon: QrCode },
    { id: "refund", label: "Refund System", icon: RotateCw },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
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

      <div className="p-4 border-t border-gray-700">
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