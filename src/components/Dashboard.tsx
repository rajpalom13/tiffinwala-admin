import React, { useState, useEffect } from "react";
import {
  getStoreStatus,
  getAnalyticsOverview,
  getOrdersPerDay,
  getTopItems,
} from "../api";
import {
  Power,
  PowerOff,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [ordersPerDay, setOrdersPerDay] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [storeStatus, analytics, daily, topItemsData] = await Promise.all([
        getStoreStatus(),
        getAnalyticsOverview(),
        getOrdersPerDay(),
        getTopItems(),
      ]);

      // @ts-ignore
      setStoreOpen(storeStatus.store);
      setOverview(analytics);
      // @ts-ignore
      setOrdersPerDay(daily.data);
      // @ts-ignore
      setTopItems(topItemsData.items);
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Orders",
      value: overview?.totalOrders || "0",
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      label: "Total Revenue",
      value: `₹ ${overview?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Store Status",
      value: storeOpen ? "Open" : "Closed",
      icon: storeOpen ? Power : PowerOff,
      color: storeOpen ? "bg-green-500" : "bg-red-500",
    },
  ];

  const lineData = [
    {
      id: "Orders",
      data: ordersPerDay.map((d) => ({
        x: d._id,
        y: d.count,
      })),
    },
  ];

  const barData = topItems.map((item) => ({
    item: item._id,
    quantity: item.totalQuantity,
  }));

  const pieData = topItems.map((item) => ({
    id: item._id,
    label: item._id,
    value: item.totalRevenue,
  }));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome! Here are your latest store analytics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Orders per day line chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Orders Per Day (Last 7 Days)
        </h2>
        {ordersPerDay.length === 0 ? (
          <p className="text-gray-500">No orders in the last 7 days.</p>
        ) : (
          <div style={{ height: "300px" }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisBottom={{
                legend: "Date",
                legendOffset: 36,
                legendPosition: "middle",
              }}
              axisLeft={{
                legend: "Orders",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              colors={{ scheme: "nivo" }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              useMesh={true}
            />
          </div>
        )}
      </div>

      {/* Top items bar chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Top Selling Items (Quantity)
        </h2>
        {topItems.length === 0 ? (
          <p className="text-gray-500">No items sold yet.</p>
        ) : (
          <div style={{ height: "300px" }}>
            <ResponsiveBar
              data={barData}
              keys={["quantity"]}
              indexBy="item"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={{ scheme: "nivo" }}
              axisBottom={{
                legend: "Item",
                legendPosition: "middle",
                legendOffset: 32,
                tickRotation: -30,
              }}
              axisLeft={{
                legend: "Quantity Sold",
                legendPosition: "middle",
                legendOffset: -50,
              }}
              tooltip={({ indexValue, value }) => (
                <strong>
                  {indexValue}: {value}
                </strong>
              )}
            />
          </div>
        )}
      </div>

      {/* Top items pie chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Revenue Share of Top Items
        </h2>
        {topItems.length === 0 ? (
          <p className="text-gray-500">No revenue data yet.</p>
        ) : (
          <div style={{ height: "300px" }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: "nivo" }}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            />
          </div>
        )}
      </div>
    </div>
  );
};