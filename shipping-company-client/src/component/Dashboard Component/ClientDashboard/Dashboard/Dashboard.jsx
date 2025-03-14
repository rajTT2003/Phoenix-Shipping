import React, { useState, useEffect } from "react";
import { Copy, MapPin, Package, CheckCircle, Clock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "./StatCard";
import PackageTable from "./PackageTable";
import { useAuth } from "../../../../context/authContext"; // Using auth context

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(null); // New state for shipping address
  const { user } = useAuth(); // Using user from authContext
  const [copySuccess, setCopySuccess] = useState(""); // State to show copy success message

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/api/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingAddress = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/admin/shipping-address`);
      const data = await res.json();
      setShippingAddress(data);
    } catch (err) {
      console.error("Error fetching shipping address:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchShippingAddress(); // Fetch shipping address when the component mounts
    const interval = setInterval(fetchStats, 600000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Handle copying the address
  const handleCopy = () => {
    const address = shippingAddress
      ? `${shippingAddress.addressLine1}, ${shippingAddress.addressLine2}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country}`
      : "Address not available";
    navigator.clipboard.writeText(address).then(() => {
      setCopySuccess("Address copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000); // Clear the success message after 2 seconds
    });
  };

  return (
    <div className="space-y-6">
      {/* Cover Section */}
      <motion.div
        className="relative bg-gradient-to-r from-orange/80 to-orange/95 text-white p-8 rounded-2xl shadow-lg md:flex block items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div >
          <h2 className="text-xl font-semibold">
            Welcome, {user?.firstName || "Loading..."}
          </h2>
          <p className="text-sm opacity-80">Your shipping dashboard</p>
        </div>
        <div className="text-sm">
          {currentTime.toDateString()} | {formatTime(currentTime)}
        </div>
      </motion.div>

      {/* Client Information */}
      {loading ? (
        <p className="text-center text-gray-500">Loading client data...</p>
      ) : user ? (
        <motion.div
          className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold">Client Shipping Information</h3>
          <p className="text-sm text-orange-400 mt-2">Client ID: {user.clientId}</p>

          {/* Responsive Container */}
          <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
            <MapPin className="text-orange-400 flex-shrink-0" />
            <span className="text-sm">
              {user.firstName} {user.lastName} PXS, {user.clientId},{" "}
              {shippingAddress
                ? `${shippingAddress.addressLine1}, ${shippingAddress.addressLine2}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country}`
                : "Loading address..."}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md md:bg-gray-800 bg-transparent md:hover:bg-gray-700 hover:bg-transparent transition md:ml-3"
            >
              <Copy size={18} className="text-gray-400 hover:text-white" />
            </button>
            {copySuccess && (
              <span className="text-green-500 text-sm ml-3">{copySuccess}</span>
            )}
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-gray-500">No client information found.</p>
      )}

      {/* Package Statistics */}
      {loading ? (
        <p className="text-center text-gray-500">Loading stats...</p>
      ) : stats ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatCard title="Total Shipments" value={stats.totalShipments} icon={<Package />} />
          <StatCard title="Delivered" value={stats.delivered} icon={<CheckCircle />} />
          <StatCard title="Processing" value={stats.processing} icon={<Clock />} />
          <StatCard title="In Transit" value={stats.inTransit} icon={<Truck />} />
        </motion.div>
      ) : (
        <p className="text-center text-gray-500">No shipment data available.</p>
      )}

      {/* Package Summary Table */}
      <PackageTable clientId={user?.clientId || ""} />
    </div>
  );
};

export default Dashboard;
