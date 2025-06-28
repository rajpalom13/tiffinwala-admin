import React, { useState, useEffect } from 'react';
import { PointsConfig } from '../types';
import { Settings, Award, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';

export const PointsConfigComponent: React.FC = () => {
  const [pointsConfigs, setPointsConfigs] = useState<PointsConfig[]>(() => {
    const saved = localStorage.getItem('pointsConfigs');
    return saved ? JSON.parse(saved) : [
      {
        minOrderValue: 0,
        maxOrderValue: 500,
        pointsAwarded: 5,
        isActive: true
      },
      {
        minOrderValue: 501,
        maxOrderValue: 1000,
        pointsAwarded: 12,
        isActive: true
      },
      {
        minOrderValue: 1001,
        maxOrderValue: 2000,
        pointsAwarded: 25,
        isActive: true
      }
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    minOrderValue: 0,
    maxOrderValue: 0,
    pointsAwarded: 0
  });

  useEffect(() => {
    localStorage.setItem('pointsConfigs', JSON.stringify(pointsConfigs));
  }, [pointsConfigs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newConfig: PointsConfig = {
      ...formData,
      isActive: true
    };

    if (editingIndex !== null) {
      setPointsConfigs(prev => 
        prev.map((config, index) => 
          index === editingIndex ? newConfig : config
        )
      );
      setEditingIndex(null);
    } else {
      setPointsConfigs(prev => [...prev, newConfig]);
    }

    setFormData({ minOrderValue: 0, maxOrderValue: 0, pointsAwarded: 0 });
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    const config = pointsConfigs[index];
    setFormData({
      minOrderValue: config.minOrderValue,
      maxOrderValue: config.maxOrderValue,
      pointsAwarded: config.pointsAwarded
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this points configuration?')) {
      setPointsConfigs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleConfig = (index: number) => {
    setPointsConfigs(prev =>
      prev.map((config, i) =>
        i === index ? { ...config, isActive: !config.isActive } : config
      )
    );
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ minOrderValue: 0, maxOrderValue: 0, pointsAwarded: 0 });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Points Configuration</h1>
          <p className="text-gray-600">Set up point rewards based on order value ranges.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Range</span>
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingIndex !== null ? 'Edit Points Range' : 'Add Points Range'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxOrderValue}
                      onChange={(e) => setFormData({ ...formData, maxOrderValue: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Awarded
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pointsAwarded}
                    onChange={(e) => setFormData({ ...formData, pointsAwarded: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingIndex !== null ? 'Update Range' : 'Add Range'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Points Configuration List */}
      {pointsConfigs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No points ranges configured</h3>
          <p className="text-gray-600 mb-6">Set up your first points reward range to start rewarding customers.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Range
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pointsConfigs.map((config, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    config.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Award className={`w-6 h-6 ${
                      config.isActive ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        ₹{config.minOrderValue} - ₹{config.maxOrderValue}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Earns <span className="font-medium text-blue-600">{config.pointsAwarded} points</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleConfig(index)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      config.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {config.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit range"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete range"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Points Summary */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">How Points Work</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Customers earn points based on their order value</p>
          <p>• Points are awarded automatically after successful orders</p>
          <p>• Only active ranges will be considered for point calculation</p>
          <p>• Make sure ranges don't overlap for consistent point allocation</p>
        </div>
      </div>
    </div>
  );
};