import { useState, useEffect } from "react";
import { FaUsers, FaShippingFast, FaBell, FaClipboardList } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // For Chart.js compatibility
import ShippingAddress from "./ShippingAddress";
import RateSetter from "./RateSetter"; 
import config from '../../../config'
export default function DashboardOverview() {
  const [shipments, setShipments] = useState(0);
  const [users, setUsers] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [logs, setLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data from backend (Replace with real API calls)
    fetch(`${config.API_BASE_URL}/api/admin/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setShipments(data.shipments);
        setUsers(data.users);
        setNotifications(data.notifications);
        setLogs(data.logs);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      });
  }, []);

  // Chart Data
  const chartData = {
    labels: ["Shipments", "Users", "Notifications", "Logs"],
    datasets: [
      {
        label: "Dashboard Stats",
        data: [shipments, users, notifications, logs],
        backgroundColor: ["#3b82f6", "#10b981", "#facc15", "#ef4444"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
      
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FaShippingFast />} color="blue" title="Total Shipments" count={shipments} />
            <StatCard icon={<FaUsers />} color="green" title="Total Users" count={users} />
            <StatCard icon={<FaBell />} color="yellow" title="Notifications" count={notifications} />
            <StatCard icon={<FaClipboardList />} color="red" title="Admin Logs" count={logs} />
          </div>

          {/* Chart Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            <Bar data={chartData} />
          </div>

              {/* Shipping Address Section */}
              <ShippingAddress />

            <RateSetter/>
        </>
      )}
    </div>
  );
}

// Reusable Stat Card Component
const StatCard = ({ icon, color, title, count }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow flex items-center`}>
      <div className={`text-${color}-500 text-3xl mr-4`}>{icon}</div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{count}</p>
      </div>
    </div>
  );
};
