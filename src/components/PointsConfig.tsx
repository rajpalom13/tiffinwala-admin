import React, { useState, useEffect } from "react";
import { PointsRange } from "../types";
import {
  getAllPointsRanges,
  createPointsRange,
  deletePointsRange,
} from "../api";
import {
  Settings,
  Award,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";

export const PointsConfigComponent: React.FC = () => {
  const [pointsConfigs, setPointsConfigs] = useState<PointsRange[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    lower: 0,
    upper: 0,
    loyaltyPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPointsConfigs();
  }, []);

  const fetchPointsConfigs = async () => {
    try {
      const res: any = await getAllPointsRanges();
      if (res?.status && Array.isArray(res.points)) {
        setPointsConfigs(res.points);
      } else {
        setPointsConfigs([]);
      }
    } catch (error) {
      console.error(error);
      setPointsConfigs([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const payload = {
        lower: formData.lower,
        upper: formData.upper,
        loyaltyPoints: formData.loyaltyPoints,
      };

      const res: any = await createPointsRange(payload);
      if (res?.status) {
        fetchPointsConfigs();
        setShowForm(false);
        setFormData({ lower: 0, upper: 0, loyaltyPoints: 0 });
        alert("Points range saved!");
      } else {
        alert("Failed to save points range.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving points range.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this points range?")) return;

    try {
      const res: any = await deletePointsRange(id);
      if (res?.status) {
        setPointsConfigs((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setFormData({ lower: 0, upper: 0, loyaltyPoints: 0 });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Points Configuration
          </h1>
          <p className="text-gray-600">
            Set up point rewards based on order value ranges.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Range</span>
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add Points Range
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
                      value={formData.lower}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lower: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                      value={formData.upper}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          upper: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    value={formData.loyaltyPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loyaltyPoints: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add Range
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
      {(pointsConfigs || []).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No points ranges configured
          </h3>
          <p className="text-gray-600 mb-6">
            Set up your first points reward range to start rewarding
            customers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Range
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pointsConfigs.map((config) => (
            <div
              key={config._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        ₹{config.lower} - ₹{config.upper}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Earns{" "}
                      <span className="font-medium text-blue-600">
                        {config.loyaltyPoints} points
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(config._id)}
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
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          How Points Work
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Customers earn points based on their order value</p>
          <p>• Points are awarded automatically after successful orders</p>
          <p>• Ensure your ranges do not overlap</p>
          <p>• You can delete ranges anytime</p>
        </div>
      </div>
    </div>
  );
};
