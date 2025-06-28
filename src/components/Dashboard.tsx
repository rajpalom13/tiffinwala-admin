import React, { useState, useEffect } from 'react';
import { Store, Users, ShoppingBag, Power, PowerOff } from 'lucide-react';
import { StoreSettings } from '../types';

export const Dashboard: React.FC = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('storeSettings');
    return saved
      ? JSON.parse(saved)
      : {
          isOpen: true,
          lastUpdated: new Date(),
          closureReason: '',
        };
  });

  const [closureReason, setClosureReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  const updateStore = async (newStatus: 'Active' | 'Inactive', reason?: string) => {
    try {
      setLoading(true);

      const res = await fetch('http://localhost:3000/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason || '',
        }),
      });

      const data = await res.json();

      if (data.status) {
        setStoreSettings({
          isOpen: newStatus === 'Active',
          lastUpdated: new Date(),
          closureReason: newStatus === 'Inactive' ? reason || '' : '',
        });
        setShowReasonInput(false);
        setClosureReason('');
      } else {
        alert('Failed to update store.');
      }
    } catch (error) {
      console.error('Failed to update store:', error);
      alert('An error occurred while updating the store.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStore = () => {
    if (storeSettings.isOpen) {
      setShowReasonInput(true);
    } else {
      updateStore('Active');
    }
  };

  const confirmClosure = () => {
    updateStore('Inactive', closureReason || 'Store temporarily closed');
  };

  const stats = [
    {
      label: 'Total Users',
      value: '2,543',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Orders',
      value: '1,234',
      change: '+8%',
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      label: 'Active Banners',
      value: '5',
      change: '0%',
      icon: Store,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Store Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                storeSettings.isOpen ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {storeSettings.isOpen ? (
                <Power className="w-6 h-6 text-green-600" />
              ) : (
                <PowerOff className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Store Status: {storeSettings.isOpen ? 'Open' : 'Closed'}
              </h2>
              <p className="text-gray-600">
                Last updated:{' '}
                {new Date(storeSettings.lastUpdated).toLocaleString()}
              </p>
              {!storeSettings.isOpen && storeSettings.closureReason && (
                <p className="text-red-600 text-sm mt-1">
                  Reason: {storeSettings.closureReason}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {showReasonInput && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Closure reason (optional)"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={confirmClosure}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Closing...' : 'Close'}
                </button>
                <button
                  onClick={() => setShowReasonInput(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
            {!showReasonInput && (
              <button
                onClick={toggleStore}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  storeSettings.isOpen
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={loading}
              >
                {loading
                  ? storeSettings.isOpen
                    ? 'Closing...'
                    : 'Opening...'
                  : storeSettings.isOpen
                  ? 'Close Store'
                  : 'Open Store'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};