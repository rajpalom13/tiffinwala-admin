import React, { useState } from "react";
import { Send, Bell } from "lucide-react";
import { sendNotification } from "../api";

interface Notification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
}

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const payload = {
        title: formData.title,
        body: formData.message,
      };

      const res: any = await sendNotification(payload);

      if (res.status) {
        // Save sent notification locally to display in history
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: formData.title,
          message: formData.message,
          sentAt: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setFormData({ title: "", message: "" });
        alert("Notification sent successfully!");
      } else {
        alert("Failed to send notification.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Notification Manager
        </h1>
        <p className="text-gray-600">
          Send push notifications to all your users instantly.
        </p>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Send New Notification
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter notification message"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
              <span>{isSending ? "Sending..." : "Send Notification"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Notification History
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications sent yet
            </h3>
            <p className="text-gray-600">
              Send your first notification to keep users engaged.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {notification.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.sentAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
