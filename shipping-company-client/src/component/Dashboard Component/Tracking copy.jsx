import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Search } from "lucide-react";
import PackageDetails from "./PackageDetails";
import Map from "./Map";

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [statusLog, setStatusLog] = useState([]);
  const barcodeRef = useRef(null);

  const trackPackage = async () => {
    const dummyTrackingNumber = trackingNumber || "1234567890";
    const newStatus = {
      status: "In Transit",
      estimatedDelivery: "Feb 10, 2025",
      sender: "John Doe",
      receiver: "Jane Smith",
      weight: "2.5kg",
      trackingNumber: dummyTrackingNumber,
      origin: { lat: 34.0522, lng: -118.2437, address: "123 Main St, Los Angeles, CA" },
      destination: { lat: 40.7128, lng: -74.006, address: "456 Broadway, New York, NY" },
      currentLocation: { lat: 37.7749, lng: -122.4194, address: "789 Market St, San Francisco, CA" },
    };

    const newLog = {
      timestamp: new Date().toLocaleString(),
      description: `Package is currently: ${newStatus.status}`,
    };
    setStatusLog((prevLog) => [newLog, ...prevLog]);

    setStatus(newStatus);
    setLocation(newStatus.currentLocation);

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${newStatus.origin.lng},${newStatus.origin.lat};${newStatus.currentLocation.lng},${newStatus.currentLocation.lat};${newStatus.destination.lng},${newStatus.destination.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    setRoute(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]));

    setTimeout(() => {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, dummyTrackingNumber, { format: "CODE128", displayValue: true, fontSize: 16 });
      }
    }, 100);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-6 border border-gray-300 shadow-md">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Track Your Package</h2>
      <div className="w-full max-w-4xl flex items-center border border-gray-300 rounded-lg p-4 bg-white shadow-md">
        <input
          type="text"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="flex-1 p-3 text-lg outline-none"
        />
        <button
          onClick={trackPackage}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <Search size={24} className="mr-2" /> Track
        </button>
      </div>

      {status && (
        <>
          <PackageDetails status={status} statusLog={statusLog} />
          
          <Map status={status} location={location} route={route} />
        </>
      )}
    </div>
  );
}
