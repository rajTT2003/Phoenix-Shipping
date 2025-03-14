import React from "react";

export default function TrackingTimeline({ statusLog = [] }) {
  console.log(statusLog); // Debugging log

  if (!Array.isArray(statusLog) || statusLog.length === 0) {
    return <div className="text-gray-500">No tracking updates available.</div>;
  }

  // Mapping statuses to colors
  const statusColors = {
    "At Warehouse": "bg-gray-500",
    "In Transit": "bg-blue",
    "At Custom Facility": "bg-yellow-400",
    "At Company Office": "bg-orange",
    "Ready for Pickup": "bg-purple-500",
    "Out for Delivery": "bg-green",
    "Delivered": "bg-green",
  };

  // Mapping statuses to custom descriptions
  const statusDescriptions = {
    "At Warehouse": "Your package has arrived at the warehouse and is awaiting processing.",
    "In Transit": "Your package is on its way to the destination.",
    "At Custom Facility": "Your package is being processed at the customs facility.",
    "At Company Office": "Your package has arrived at the company office and is awaiting pickup.",
    "Ready for Pickup": "Your package is ready for pickup at the local facility.",
    "Out for Delivery": "Your package is out for delivery and will arrive soon.",
    "Delivered": "Your package has been successfully delivered.",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Tracking Timeline</h3>

      <div className="relative ml-8">
        {statusLog.map((update, index) => (
          <div key={index} className="relative flex items-start mb-8">
            {/* Timeline Line */}
            {index !== statusLog.length - 1 && (
              <div className="absolute left-3 top-5 w-[2px] h-full bg-gray-300"></div>
            )}

            {/* Circle representing the status */}
            <div
              className={`w-6 h-6 rounded-full border-4 border-white ${statusColors[update.status] || "bg-gray-400"} relative z-10`}
            ></div>

            {/* Timeline Entry with Description and Date */}
            <div className="ml-8">
              <p className="text-gray-700 font-semibold text-lg">{update.status}</p>
              <p className="text-sm text-gray-500">{new Date(update.date).toLocaleString()}</p>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
