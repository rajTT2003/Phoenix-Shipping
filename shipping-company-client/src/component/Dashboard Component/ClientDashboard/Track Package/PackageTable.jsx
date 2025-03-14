import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PackageTable = ({ packages, selectPackage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of items per page

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(packages)
    ? packages.slice(indexOfFirstItem, indexOfLastItem)
    : []; // Ensure packages is an array before calling slice
  const totalPages = Math.ceil(packages.length / itemsPerPage);

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
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">Package ID</th>
              <th className="p-3 text-left">Status</th>
         
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Weight</th>
              <th className="p-3 text-left">Cost</th> {/* Additional Column */}
              <th className="p-3 text-left">Tracking</th>
              <th className="p-3 text-left">HAWB#</th>
             <th className="p-3 text-left">Date Updated</th> {/* Additional Column */}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-3 text-center text-gray-500">
                  No packages available.
                </td>
              </tr>
            ) : (
              currentItems.map((pkg, index) => (
                <tr
                  key={index}
                  onClick={() => selectPackage(pkg)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3">{pkg.packageId}</td>
                  <td className={`p-3`}>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(pkg.status?.length > 0 ? pkg.status[pkg.status.length - 1].status : "Unknown")}`}> {pkg.status?.length > 0 ? pkg.status[pkg.status.length - 1].status : "Unknown"}</span>
                     
                  </td>


               
                
                  <td className="p-3">{pkg.packageType}</td>
                  <td className="p-3">{pkg.weight}{pkg.unit}</td>
                  <td className="p-3">{pkg.cost ? `$${pkg.cost}` : "N/A"}</td> {/* Display cost */}
                  <td className="p-3">{pkg.trackingNumber}</td>
                  <td className="p-3">{pkg.hawbNumber}</td>
                  
                  <td className="p-3">
                  {pkg.status?.length > 0? new Date(pkg.status[pkg.status.length - 1].date).toLocaleDateString()  : "Unknown"}

                    </td> {/* Display last updated date */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {packages.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-orange/100 rounded-md text-white"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-orange/100 rounded-md text-white"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PackageTable;
