import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InvoiceDownload from "./InvoiceDownload";
import TrackingTimeline from "./TrackingTimeline";
import Map from "../../Map"; // Import the Map component
import { Package } from "lucide-react"; // Package icon
import config from "../../../../config"

export default function PackageDetails() {
  const [packageData, setPackageData] = useState(null);
  const { trackingNumber } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const storedPackage = localStorage.getItem("selectedPackage");

    if (storedPackage) {
      try {
        const parsedPackage = JSON.parse(storedPackage);
        setPackageData(parsedPackage);
        console.log(parsedPackage);  // Log package data to inspect the structure
      } catch (error) {
        console.error("Error parsing stored package:", error);
        setPackageData(null);
      }
    }
  }, [trackingNumber]);

  if (!packageData) return <div className="text-center p-6">Loading package details...</div>;

  return (
    <div className="mt-8 w-full max-w-6xl bg-white border border-gray-300 rounded-lg shadow-md p-6 md:pb-6 pb-20 flex flex-col relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 px-4 py-2 bg-orange/100 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-orange/90 transition"
      >
        &laquo; Back to Packages
      </button>

      <h2 className="md:text-2xl text-xl font-semibold mb-6">Package Details</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Package Details */}
        <div className="flex-1 bg-gray-100 p-6 rounded-lg shadow-sm">
          {/* Package Image */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-full">
              <Package size={40} className="text-gray-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
            {packageData.packageType || "Unknown"} Package
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            {packageData.description || "No description available."}
          </p>

          {/* Tracking Number */}
          <div className="text-center mb-4">
            <p className="font-semibold text-gray-700">Tracking Number:</p>
            <p className="text-orange/100">{packageData.trackingNumber || "N/A"}</p>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><span className="font-semibold">Package ID:</span> {packageData.packageId || "N/A"}</p>
            <p><span className="font-semibold">Latest Status:</span> {packageData.status?.length > 0 ? packageData.status[packageData.status.length - 1].status : "Unknown"}</p>
            <p><span className="font-semibold">Last Updated: </span> 
             {packageData.status?.length > 0? new Date(packageData.status[packageData.status.length - 1].date).toLocaleDateString()  : "Unknown"}</p>
            <p><span className="font-semibold">Weight:</span> {packageData.weight || "N/A"} {packageData.unit}</p>
            <p><span className="font-semibold">Type:</span> {packageData.packageType || "N/A"}</p>
            <p><span className="font-semibold">Shipping Cost:</span> ${packageData.cost || "N/A"}</p>
            <p><span className="font-semibold">HAWB #:</span> {packageData.hawbNumber || "N/A"}</p>
          </div>

          {/* Download Invoice Button 
          <div className="mt-6 text-center">
            <InvoiceDownload trackingNumber={packageData.trackingNumber} />
          </div>
           */}
        </div>
         
        {/* Right: Tracking Timeline */}
        <div className="flex-1 bg-gray-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tracking Information</h3>
          <TrackingTimeline statusLog={packageData.status || []} />
        </div>
      </div>

      {/* Bottom: Map Section */}
      <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-sm z-0">
        <h3 className="text-lg font-semibold mb-4">Live Package Tracking</h3>
        <Map latestStatus={packageData.status?.length > 0 ? packageData.status[packageData.status.length - 1].coordinates : null} />

      </div>
    </div>
  );
}
