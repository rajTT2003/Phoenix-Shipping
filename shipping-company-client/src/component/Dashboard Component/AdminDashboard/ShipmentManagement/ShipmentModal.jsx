import { useState, useEffect } from "react";
import config from "../../../../config"

const STATUS_OPTIONS = [
  "At Warehouse",
  "In Transit",
  "At Custom Facility",
  "At Company Office",
  "Ready for Pickup",
  "Delivered",
  "Out for Delivery",
];

const DEFAULT_STATUS = { status: "At Warehouse", date: new Date().toISOString() };

export default function ShipmentModal({ isOpen, onClose, editMode, initialData, clients,  setShipments }) {
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering clients
  const [shipmentData, setShipmentData] = useState(
    initialData || {
      trackingNumber: "",
      clientId: "",
      hawbNumber: "",
      description: "",
      packageType: "",
      status: [DEFAULT_STATUS],
      weight: "",
      cost: 0,
    }
  );

  useEffect(() => {
    if (initialData) {
      setShipmentData(initialData);
    }
  }, [initialData]);

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    `${client.clientId} ${client.firstName} ${client.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "cost") {
      // Ensure the cost is a valid number and always formatted to 2 decimal places
      const formattedCost = isNaN(value) ? 0 : parseFloat(value).toFixed(2);
      setShipmentData((prevData) => ({ ...prevData, cost: formattedCost }));
      return;
    }
  
    setShipmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  

  const handleStatusChange = (index, field, value) => {
    const updatedStatus = [...shipmentData.status];
    updatedStatus[index] = { ...updatedStatus[index], [field]: value };
    setShipmentData({ ...shipmentData, status: updatedStatus });
  };

  const addStatus = () => {
    setShipmentData({
      ...shipmentData,
      status: [...shipmentData.status, DEFAULT_STATUS],
    });
  };

  const removeStatus = (index) => {
    const updatedStatus = shipmentData.status.filter((_, i) => i !== index);
    setShipmentData({ ...shipmentData, status: updatedStatus });
  };

  const calculateCost = async () => {
    if (!shipmentData.weight || isNaN(shipmentData.weight)) {
      alert("Invalid weight");
      return;
    }
    if (!shipmentData.unit) {
      alert("Please select a unit (kg or lb)");
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/calculate-cost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: shipmentData.weight, unit: shipmentData.unit }),
      });

      const data = await response.json();
      if (data.cost) {
        const roundedCost = parseFloat(data.cost).toFixed(2); // Ensure 2 decimal places
        setShipmentData((prevData) => ({ ...prevData, cost: roundedCost }));
      } else {
        alert("Error calculating cost");
      }
    } catch (error) {
      alert("Failed to calculate cost");
    }
};

  
  const onSave = async (shipmentData) => {
    // Ensure only the latest status is pending for notification
    const updatedStatus = shipmentData.status.map((s, index) => ({
      ...s,
      pending_notification: index === shipmentData.status.length - 1, // Only last status is pending
    }));
  
    // Ensure the cost is formatted to two decimal places
    const updatedShipment = {
      ...shipmentData,
      status: updatedStatus,
      unit: shipmentData.unit || "kg", 
      packageType: shipmentData.packageType === "Custom" ? shipmentData.customPackageType : shipmentData.packageType,
      description: shipmentData.description === "Custom" ? shipmentData.customDescription : shipmentData.description,
      cost: Number(shipmentData.cost).toFixed(2), // Ensure 2 decimal places
    };
    
  
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `${config.API_BASE_URL}/admin/shipments/${shipmentData._id}`
      : `${config.API_BASE_URL}/admin/shipments`;
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShipment),
      });
  
      const data = await response.json();
      console.log("Server Response:", data); // Debugging
  
      if (response.ok) {
        // Ensure we correctly extract the shipment from the response
        const savedShipment = data.shipment || data;
  
        setShipments((prevShipments) =>
          editMode
            ? prevShipments.map((shipment) =>
                shipment._id === savedShipment._id ? savedShipment : shipment
              )
            : [...prevShipments, savedShipment]
        );
  
        // await sendNotification(savedShipment); // Handle email notification
  
        onClose(); // Close modal
      } else {
        alert(data.error || "Error saving shipment");
      }
    } catch (error) {
      console.error("Error saving shipment:", error);
      alert("Failed to save shipment.");
    }
  };
  
  
  
  
  return isOpen ? (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-screen-lg overflow-y-auto max-h-screen">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Shipment" : "Add Shipment"}
        </h2>
  
        {/* Using grid with responsive columns */}
        <div className="md:grid gap-4">
  
          {/* Client Search Input */}
          <div className="flex flex-col w-full mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a client..."
              className="border p-2 rounded"
              disabled={editMode}
            />
          </div>
  
          {/* Client Selection Dropdown */}
          <div className="flex flex-col w-full mb-4">
            <select
              name="clientId"
              value={shipmentData.clientId}
              onChange={handleChange}
              className="border p-2 rounded"
              disabled={editMode}
            >
              <option value="">Select Client</option>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <option key={client.id} value={client.clientId}>
                    {client.clientId} - {client.firstName} {client.lastName}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No matching clients found
                </option>
              )}
            </select>
          </div>
  
          {/* Tracking Number */}
          <div className="flex flex-col w-full mb-4">
            <input
              type="text"
              name="trackingNumber"
              value={shipmentData.trackingNumber}
              onChange={handleChange}
              placeholder="Tracking Number"
              className="border p-2 rounded"
            />
          </div>
  
          {/* HAWB Number */}
          <div className="flex flex-col w-full mb-4">
            <input
              type="text"
              name="hawbNumber"
              value={shipmentData.hawbNumber}
              onChange={handleChange}
              placeholder="HAWB#"
              className="border p-2 rounded"
            />
          </div>
  
{/* Package Type Dropdown */}
<div className="flex flex-col w-full">
  <select
    name="packageType"
    value={shipmentData.packageType}
    onChange={handleChange}
    className="border p-2 rounded"
  >
    <option value="">Select Package Type</option>
    <option value="Box">Box</option>
    <option value="Envelope">Envelope</option>
    <option value="Pallet">Pallet</option>
    <option value="Custom">Custom</option>
  </select>
</div>

{/* Custom Package Type Input */}
{shipmentData.packageType === "Custom" && (
  <div className="flex flex-col w-full">
    <input
      type="text"
      name="customPackageType"
      value={shipmentData.customPackageType || ''}
      onChange={handleChange}
      placeholder="Enter custom package type"
      className="border p-2 rounded"
    />
  </div>
)}

{/* Description Dropdown */}
<div className="flex flex-col w-full">
  <select
    name="description"
    value={shipmentData.description}
    onChange={handleChange}
    className="border p-2 rounded"
  >
    <option value="">Select Description</option>
    <option value="Box">Box</option>
    <option value="Envelope">Envelope</option>
    <option value="Pallet">Pallet</option>
    <option value="Custom">Custom</option>
  </select>
</div>

{/* Custom Description Input */}
{shipmentData.description === "Custom" && (
  <div className="flex flex-col w-full">
    <input
      type="text"
      name="customDescription"
      value={shipmentData.customDescription || ''}
      onChange={handleChange}
      placeholder="Enter custom description"
      className="border p-2 rounded"
    />
  </div>
)}


          {/* Status Updates */}
          <div className="flex flex-col col-span-2 w-full mb-4">
            <p className="font-semibold">Status Updates:</p>
            {shipmentData.status.map((status, index) => (
              <div key={index} className="flex space-x-2 mb-3 items-center w-full">
                <select
                  value={status.status}
                  onChange={(e) => handleStatusChange(index, "status", e.target.value)}
                  className="border p-2 rounded w-full sm:w-1/2"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={status.date.split("T")[0]}
                  onChange={(e) => handleStatusChange(index, "date", e.target.value)}
                  className="border p-2 rounded w-full sm:w-1/2"
                />
                {shipmentData.status.length > 1 && (
                  <button
                    onClick={() => removeStatus(index)}
                    className="text-red-500 font-bold"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            <button onClick={addStatus} className="bg-orange/100 text-white px-4 py-2 rounded">
              + Add Status
            </button>
          </div>
  
          {/* Weight Input */}
          <div className="flex flex-col w-full mb-4">
            <input
              type="number"
              name="weight"
              value={shipmentData.weight}
              onChange={handleChange}
              placeholder="Weight"
              className="border p-2 rounded"
            />
          </div>
  
          {/* Unit Dropdown */}
          <div className="flex flex-col w-full mb-4">
            <select
              name="unit"
              value={shipmentData.unit}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Select Unit</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
  
          {/* Cost Calculation */}
          <div className="flex flex-col w-full mb-4">
            <button onClick={calculateCost} className="bg-green/100 text-white px-4 py-2 rounded mb-3">
              Calculate Cost
            </button>
            <p className="font-semibold mb-3">Cost: ${shipmentData.cost}</p>
          </div>
  
          {/* Save & Cancel Buttons */}
          <div className="flex justify-between gap-3 col-span-2 w-full mb-4">
            <button
              onClick={() => onSave(shipmentData)}
              className="bg-orange/100 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Save
            </button>
            <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded w-full sm:w-auto">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
  
  
}
