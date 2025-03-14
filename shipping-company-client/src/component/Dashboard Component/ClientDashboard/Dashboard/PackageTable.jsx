import React, { useState, useEffect } from "react";
import config from "../../../../config"
const PackageTable = ({ clientId }) => {
  const [packages, setPackages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Access denied.");
      return;
    }

    fetch(`${config.API_BASE_URL}/api/user-shipments?clientId=${clientId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPackages(data);
        } else {
          console.error("Expected an array, but received:", data);
          setPackages([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setPackages([]);
      });
  }, [clientId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(packages)
    ? packages.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(packages.length / itemsPerPage);

  const getLatestStatus = (statusArray) => {
    // Check if statusArray is a valid array and contains elements
    if (!Array.isArray(statusArray) || statusArray.length === 0) {
      return "Unknown";
    }
  
    // Sort by date (ensure date is a valid field in each object)
    return statusArray
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      .status || "Unknown"; // Fallback to "Unknown" if status is not defined
  };
  

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green/20 text-green";
      case "At Warehouse":
      case "At Custom Facility":
      case "At Company Office":
      case "Ready for Pickup":
        return "bg-yellow-200 text-yellow-800";
      case "Out for Delivery":
      case "In Transit":
        return "bg-blue/20 text-blue/90";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full md:pb-6 pb-20">
      <h3 className="text-lg font-semibold mb-4">Package Summary</h3>

      <div className="w-full overflow-hidden">
  {/* Scrollable Table Wrapper */}
  <div className="overflow-x-auto">
    <table className="min-w-[800px] w-full">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="p-3 text-left">Package ID</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Weight</th>
          <th className="p-3 text-left">Type</th>
          <th className="p-3 text-left">Tracking</th>
          <th className="p-3 text-left">HAWB#</th>
        </tr>
      </thead>
      <tbody>
        {packages.length === 0 ? (
          <tr>
            <td colSpan="6" className="p-3 text-center text-gray-500">
              No packages available.
            </td>
          </tr>
        ) : (
          currentItems.map((pkg, index) => {
            const latestStatus = getLatestStatus(pkg.status);
            return (
              <tr key={index} className="border-b">
                <td className="p-3">{pkg.packageId}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(latestStatus)}`}>
                    {latestStatus}
                  </span>
                </td>
                <td className="p-3">{pkg.weight}{pkg.unit}</td>
                <td className="p-3">{pkg.packageType}</td>
                <td className="p-3">{pkg.trackingNumber}</td>
                <td className="p-3">{pkg.hawbNumber}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>



      {packages.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-orange/100 rounded-md text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-orange/100 rounded-md text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageTable;
