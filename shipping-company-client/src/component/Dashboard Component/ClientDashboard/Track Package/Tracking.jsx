import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/authContext"; // Import your Auth context
import PackageTable from "./PackageTable";
import config from "../../../../config"
export default function TrackingPage() {
  const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [searchQuery, setSearchQuery] = useState("");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait until auth is loaded
    if (!user || !user.clientId) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
  
    console.log("Client ID:", user.clientId); // Debugging log for client ID
    const token = localStorage.getItem("token");
  
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/user-shipments?clientId=${user.clientId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Add token to headers
            "Content-Type": "application/json", // Ensure content-type is set if needed
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
  
        const processedPackages = data.map((pkg) => ({
          ...pkg,
          // Keep all statuses (not just the most recent)
          status: Array.isArray(pkg.status) ? pkg.status : [],
        }));
  
        setPackages(processedPackages);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError("Failed to load packages. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPackages();
  }, [user, authLoading]);
  

  console.log("Set Packages",packages);
  const selectPackage = (pkg) => {
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    navigate(`/client/package-details/${pkg.trackingNumber}`);
  };

  console.log("local", localStorage.getItem("selectedPackage"));

  const filteredPackages = packages.filter((pkg) => {
    const packageId = pkg.packageId || ''; // Defaults to empty string if undefined
    const trackingNumber = pkg.trackingNumber || ''; // Defaults to empty string if undefined
    const status = pkg.status?.status || ''; // Defaults to empty string if undefined

    return packageId.includes(searchQuery) ||
      trackingNumber.includes(searchQuery) ||
      status.includes(searchQuery);
  });

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-6 border border-gray-300 shadow-md">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Track Your Package</h2>

      <input
        type="text"
        placeholder="Search by Package ID, Tracking Number, or Status..."
        className="mb-4 p-2 border rounded w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-gray-500 mt-4">Loading packages...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : (
        <PackageTable packages={filteredPackages} selectPackage={selectPackage} />
      )}
    </div>
  );
}
