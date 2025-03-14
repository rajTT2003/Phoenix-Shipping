import React, { useEffect, useState } from "react";
import { FaPaperPlane, FaList, FaCheckCircle } from "react-icons/fa";
import config from "../../../config"
export default function NotificationManagement() {
  const [clients, setClients] = useState([]);
  const [pendingShipments, setPendingShipments] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("custom");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, shipmentsRes] = await Promise.all([
          fetch(`${config.API_BASE_URL}/admin/clients`).then((res) => res.json()),
          fetch(`${config.API_BASE_URL}/admin/pending-shipments`).then((res) => res.json()),
        ]);
        setClients(clientsRes);
        setPendingShipments(shipmentsRes);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  const templates = {
    shippingUpdate: {
      subject: "Your Package is on the Move!",
      message: `Dear {customerName},\n\nYour shipment with tracking number {trackingNumber} has been updated.\nTrack it now: {trackingLink}.\n\nBest regards,\nYour Shipping Company.`,
    },
    deliverySuccess: {
      subject: "Your Package Has Been Delivered!",
      message: `Dear {customerName},\n\nWe are pleased to inform you that your package with tracking number {trackingNumber} has been successfully delivered.\n\nThank you for choosing us.\nBest regards,\nYour Shipping Company.`,
    },
    custom: { subject: "", message: "" },
  };

  useEffect(() => {
    setEmailSubject(templates[emailTemplate]?.subject || "");
    setEmailMessage(templates[emailTemplate]?.message || "");
  }, [emailTemplate]);

  const handleSendEmailToPending = async () => {
    if (!pendingShipments.length) return alert("No pending shipments to send emails to.");
  
    const emailData = {
      recipients: pendingShipments.map((shipment) => shipment.clientInfo._id),
      subject: emailSubject,
      message: pendingShipments.map((shipment) => generateEmailContent(null, shipment)).join("\n"),
    };
  
    try {
      // Send emails to pending shipments
      const emailResponse = await fetch(`${config.API_BASE_URL}/admin/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });
  
      if (!emailResponse.ok) throw new Error("Failed to send email");
  
      // Update shipment status
      for (let shipment of pendingShipments) {
        const updateResponse = await fetch(`${config.API_BASE_URL}/admin/update-shipment-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: shipment.packageId,  // Use packageId instead of shipmentId
            newStatus: "Updated",           // New status value (customizable)
          }),
        });
  
        if (!updateResponse.ok) {
          throw new Error(`Failed to update shipment status for package ID ${shipment.packageId}`);
        }
      }
  
      // Update state locally
      const updatedShipments = pendingShipments.map((shipment) => ({
        ...shipment,
        state: "Updated",  // Update local state to reflect changes
      }));
      setPendingShipments(updatedShipments);
  
      alert("Emails sent and shipment statuses updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send email or update shipment status.");
    }
  };
  
  
  
  

  const handleSendEmailToSelected = async () => {
    if (!selectedClients.length) return alert("Please select at least one client.");

    // Ensure only valid recipients are included (valid clients with correct info)
    const validClients = selectedClients.filter((client) => client._id);

    // Generate email content for each selected client
    const emailData = {
      recipients: validClients.map((client) => client._id),
      subject: emailSubject,
      message: validClients.map((client) => generateEmailContent(client)).join("\n"), // Generate and join email contents
    };

    try {
      const response = await fetch(`${config.API_BASE_URL}/admin/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) throw new Error("Failed to send email");

      alert("Emails sent to selected clients successfully!");
      setSelectedClients([]); // Clear selection
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email.");
    }
  };

  const generateEmailContent = (recipient, shipment = null) => {
    let emailContent = emailMessage; // Default message

    if (shipment) {
      // For shipment-related emails, replace shipment placeholders
      emailContent = emailContent
        .replace("{customerName}", shipment.clientInfo.firstName)
        .replace("{trackingNumber}", shipment.trackingNumber)
        .replace("{trackingLink}", `https://track.yourpackage.com/${shipment.trackingNumber}`);
    } else if (recipient) {
      // For selected client emails, replace client-related placeholders
      emailContent = emailContent.replace("{customerName}", recipient.firstName);
    }

    return emailContent;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Notification Management</h1>
  
      {/* Send to Pending Shipments */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaList className="mr-3 text-blue-500" /> Send Email to Pending Shipments
        </h2>
  
        <label className="block font-semibold text-gray-700 mb-2">Choose Template:</label>
        <select
          value={emailTemplate}
          onChange={(e) => setEmailTemplate(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Custom Message</option>
          <option value="shippingUpdate">Shipping Update</option>
          <option value="deliverySuccess">Delivery Success</option>
        </select>
  
        <label className="block font-semibold text-gray-700 mb-2">Subject:</label>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        <label className="block font-semibold text-gray-700 mb-2">Message:</label>
        <textarea
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        ></textarea>
  
        <button
          onClick={handleSendEmailToPending}
          className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange/80 transition duration-200 flex items-center"
        >
          <FaPaperPlane className="mr-2" /> Send Email to Pending Shipments
        </button>
      </div>
  

 {/* Pending Shipments Display */}
 <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaList className="mr-3 text-blue-500" /> Pending Shipments
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingShipments.length === 0 ? (
          <p className="text-gray-500">No pending shipments.</p>
        ) : (
          <div className="h-60 overflow-y-auto">
            <ul className="list-disc pl-4">
              {pendingShipments.map((shipment, index) => (
                <li
                  key={index}
                  className={`${
                    shipment.status === "updated" ? "text-green-500" : "text-gray-700"
                  } flex justify-between items-center py-2`}
                >
                  <span>
                    {shipment.packageId} | {shipment.clientInfo.firstName} -{" "}
                    {generateEmailContent(null, shipment)}
                  </span>
                  {shipment.status === "updated" && (
                    <FaCheckCircle className="ml-2 text-green" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>



      {/* Send to Selected Clients */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaList className="mr-3 text-blue-500" /> Send Email to Selected Clients
        </h2>
  
        {/* Client Selection */}
        <div className="border rounded-lg h-60 overflow-y-auto p-4 mb-6 bg-gray-50">
          {clients.length === 0 ? (
            <p className="text-gray-500">No clients available.</p>
          ) : (
            clients.map((client) => (
              <label key={client._id} className="block p-3 border-b hover:bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={client._id}
                  onChange={(e) =>
                    setSelectedClients((prevSelected) =>
                      e.target.checked
                        ? [...prevSelected, client]
                        : prevSelected.filter((c) => c._id !== client._id)
                    )
                  }
                />
                <span className="ml-3 text-gray-700">{client.name} ({client.email})</span>
              </label>
            ))
          )}
        </div>
  
        <label className="block font-semibold text-gray-700 mb-2">Choose Template:</label>
        <select
          value={emailTemplate}
          onChange={(e) => setEmailTemplate(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Custom Message</option>
          <option value="shippingUpdate">Shipping Update</option>
          <option value="deliverySuccess">Delivery Success</option>
        </select>
  
        <label className="block font-semibold text-gray-700 mb-2">Subject:</label>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        <label className="block font-semibold text-gray-700 mb-2">Message:</label>
        <textarea
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        ></textarea>
  
        <button
          onClick={handleSendEmailToSelected}
          className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange/80 transition duration-200 flex items-center"
        >
          <FaPaperPlane className="mr-2" /> Send Email to Selected Clients
        </button>
      </div>
  
     
    </div>
  );
  
}
