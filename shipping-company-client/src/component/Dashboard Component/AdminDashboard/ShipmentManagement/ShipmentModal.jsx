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

  const handleChange = (e) => {
    setShipmentData({ ...shipmentData, [e.target.name]: e.target.value });
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
        setShipmentData((prevData) => ({ ...prevData, cost: data.cost }));
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
  
    // Include unit in updatedShipment to ensure it's passed to the backend
    const updatedShipment = { 
      ...shipmentData, 
      status: updatedStatus, 
      unit: shipmentData.unit || "kg" // Default to "kg" if no unit is selected
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
  
      //  await sendNotification(savedShipment); // Handle email notification
  
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96 md:w-1/2 lg:w-1/3">
        <h2 className="text-xl font-semibold mb-4">{initialData ? "Edit Shipment" : "Add Shipment"}</h2>

        {/* Client Selection */}
        <select
  name="clientId"
  value={shipmentData.clientId}
  onChange={handleChange}
  className="border p-2 rounded w-full mb-2"
  disabled={editMode}  // Disable when editing
>
  <option value="">Select Client</option>
  {clients.map((client) => (
    <option key={client.id} value={client.clientId}>
      {client.clientId} - {client.firstName} {client.lastName}
    </option>
  ))}
</select>



        {/* Tracking Number */}
        <input
          type="text"
          name="trackingNumber"
          value={shipmentData.trackingNumber}
          onChange={handleChange}
          placeholder="Tracking Number"
          className="border p-2 rounded w-full mb-2"
        />

        {/* HAWB Number */}
        <input
          type="text"
          name="hawbNumber"
          value={shipmentData.hawbNumber}
          onChange={handleChange}
          placeholder="HAWB#"
          className="border p-2 rounded w-full mb-2"
        />

        {/* Description Dropdown */}
        <select
          name="description"
          value={shipmentData.description}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="">Select Description</option>
          <option value="Box">Box</option>
          <option value="Envelope">Envelope</option>
          <option value="Pallet">Pallet</option>
          <option value="Custom">Custom</option>
        </select>
        {/* Custom Description Input */}
        {shipmentData.description === "Custom" && (
          <input
            type="text"
            name="customDescription"
            value={shipmentData.customDescription}
            onChange={handleChange}
            placeholder="Enter custom description"
            className="border p-2 rounded w-full mb-2"
          />
        )}

        {/* Package Type Dropdown */}
        <select
          name="packageType"
          value={shipmentData.packageType}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="">Select Package Type</option>
          <option value="Box">Box</option>
          <option value="Envelope">Envelope</option>
          <option value="Pallet">Pallet</option>
          <option value="Custom">Custom</option>
        </select>

        {/* Custom Package Type Input */}
        {shipmentData.packageType === "Custom" && (
          <input
            type="text"
            name="customPackageType"
            value={shipmentData.customPackageType}
            onChange={handleChange}
            placeholder="Enter custom package type"
            className="border p-2 rounded w-full mb-2"
          />
        )}

        {/* Status Updates */}
        <div className="mb-2">
          <p className="font-semibold">Status Updates:</p>
          {shipmentData.status.map((status, index) => (
            <div key={index} className="flex space-x-2 mb-2 items-center">
              <select
                value={status.status}
                onChange={(e) => handleStatusChange(index, "status", e.target.value)}
                className="border p-2 rounded w-1/2"
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
                className="border p-2 rounded w-1/2"
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
<input
  type="number"
  name="weight"
  value={shipmentData.weight}
  onChange={handleChange}
  placeholder="Weight"
  className="border p-2 rounded w-full mb-2"
/>

{/* Unit Dropdown */}
<select
  name="unit"
  value={shipmentData.unit}
  onChange={handleChange}
  className="border p-2 rounded w-full mb-2"
>
  <option value="">Select Unit</option>
  <option value="kg">Kilograms (kg)</option>
  <option value="lb">Pounds (lb)</option>
</select>



        {/* Cost Calculation */}
        <button onClick={calculateCost} className="bg-green/100 text-white px-4 py-2 rounded mb-2">
          Calculate Cost
        </button>
        <p className="font-semibold mb-2">Cost: ${shipmentData.cost}</p>

        {/* Save & Cancel Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => onSave(shipmentData)}
            className="bg-orange/100 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
