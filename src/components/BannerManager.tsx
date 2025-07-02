import React, { useState, useEffect } from "react";
import { Upload, Image, Trash2, Link as LinkIcon } from "lucide-react";
import { Banner } from "../types";
import { uploadBanner, getAllBanners, deleteBanner } from "../api";

export const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // New state for the upload modal:
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");

  const loadBanners = async () => {
    const res: any = await getAllBanners();
    if (res.status) {
      setBanners(res.data);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Handle selecting a file, open the modal:
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRedirectUrl("");
    setShowModal(true);
  };

  // Actually upload:
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const res: any = await uploadBanner(selectedFile, redirectUrl);
      if (res.status) {
        setShowModal(false);
        setSelectedFile(null);
        setRedirectUrl("");
        loadBanners();
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      const res: any = await deleteBanner(id);
      if (res.status) {
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Banner Management
          </h1>
          <p className="text-gray-600">
            Upload and manage promotional banners for your store.
          </p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <button
            disabled={isUploading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? "Uploading..." : "Upload Banner"}</span>
          </button>
        </div>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No banners yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first promotional banner to get started.
          </p>
          <div className="relative inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Upload First Banner
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={banner.url}
                  alt="Banner"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <span className="font-semibold text-gray-900">
                  Banner ID: {banner._id}
                </span>
                {banner.redirect && (
                  <div className="flex items-center space-x-2 text-blue-600 text-sm">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={banner.redirect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Visit Link
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Banner
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL (optional)
                </label>
                <input
                  type="text"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
