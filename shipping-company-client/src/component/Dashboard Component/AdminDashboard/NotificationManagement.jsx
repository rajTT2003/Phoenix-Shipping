import React, { useEffect, useState } from "react";
import { FaPaperPlane, FaList, FaCheckCircle } from "react-icons/fa";
import config from "../../../config"
import Loader from "../../Loader"
export default function NotificationManagement() {
  const [clients, setClients] = useState([]);
  const [pendingShipments, setPendingShipments] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [pendingEmailTemplate, setPendingEmailTemplate] = useState("custom");
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState("custom");
  
  const [pendingEmailSubject, setPendingEmailSubject] = useState("");
  const [pendingEmailMessage, setPendingEmailMessage] = useState("");
  
  const [selectedEmailSubject, setSelectedEmailSubject] = useState("");
  const [selectedEmailMessage, setSelectedEmailMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);



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
      message: `Dear {customerName},\n\nYour shipment with tracking number {trackingNumber} has been updated.\n\nBest regards,\nYour Shipping Company.`,
    },
    deliverySuccess: {
      subject: "Your Package Has Been Delivered!",
      message: `Dear {customerName},\n\nWe are pleased to inform you that your package with tracking number {trackingNumber} has been successfully delivered.\n\nThank you for choosing us.\nBest regards,\nYour Shipping Company.`,
    },
    newShipmentAlert: {
      subject: "New Shipment Created!",
      message: `Dear {customerName},\n\nA new shipment has been created for you. Your tracking number is {trackingNumber}.\n\nBest regards,\nYour Shipping Company.`,
    },
    delayedShipment: {
      subject: "Your Shipment is Delayed",
      message: `Dear {customerName},\n\nWe regret to inform you that your shipment with tracking number {trackingNumber} has been delayed. We are working hard to resolve the issue and will update you soon.\n\nBest regards,\nYour Shipping Company.`,
    },
    custom: { subject: "", message: "" },
  };

  useEffect(() => {
    setPendingEmailSubject(templates[pendingEmailTemplate]?.subject || "");
    setPendingEmailMessage(templates[pendingEmailTemplate]?.message || "");
  }, [pendingEmailTemplate]);
  
  useEffect(() => {
    setSelectedEmailSubject(templates[selectedEmailTemplate]?.subject || "");
    setSelectedEmailMessage(templates[selectedEmailTemplate]?.message || "");
  }, [selectedEmailTemplate]);
  

  const handleSendEmailToPending = async () => {
    if (!pendingShipments.length) return alert("No pending shipments to send emails to.");
    setIsLoadingPending(true); // Show loader
  
    try {
      for (let shipment of pendingShipments) {
        const emailContent = generateEmailContent(null, shipment);
        const emailData = {
          recipients: [shipment.clientInfo._id], // Send separately
          subject: pendingEmailSubject,
          message: emailContent,
        };
  
        const emailResponse = await fetch(`${config.API_BASE_URL}/admin/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData),
        });
  
        if (!emailResponse.ok) throw new Error(`Failed to send email to ${shipment.clientInfo.firstName}`);
  
        // Update shipment status for each one separately
        const updateResponse = await fetch(`${config.API_BASE_URL}/admin/update-shipment-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: shipment.packageId,
            newStatus: "Updated",
          }),
        });
  
        if (!updateResponse.ok) {
          throw new Error(`Failed to update shipment status for package ID ${shipment.packageId}`);
        }
      }
  
      setPendingShipments(pendingShipments.map(s => ({ ...s, state: "Updated" })));
      alert("Emails sent individually and shipment statuses updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send some emails or update shipment status.");
    }finally{
      setIsLoadingPending(false); // Hide loader
    }
  };
  
  
  
  

  const handleSendEmailToSelected = async () => {
    if (!selectedClients.length) return alert("Please select at least one client.");
    setIsLoadingSelected(true); // Show loader

    // Ensure only valid recipients are included (valid clients with correct info)
    const validClients = selectedClients.filter((client) => client._id);

    // Generate email content for each selected client
    const emailData = {
      recipients: validClients.map((client) => client._id),
      subject: selectedEmailSubject,
      message:selectedEmailMessage, // Generate and join email contents
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
    finally{
      setIsLoadingSelected(false); // Hide loader
    }
  };

  const generateEmailContent = (recipient, shipment = null) => {
    let emailContent = pendingEmailMessage ; // Default message

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
  
  const filteredClients = (clients || []).filter(client =>
    (client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     client.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">
        Notification Management
      </h1>
  
      {/* Send to Pending Shipments */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 md:mb-8 border border-gray-200">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 flex items-center">
          <FaList className="mr-2 md:mr-3 text-blue-500" /> Send Email to Pending Shipments
        </h2>
  
        <label className="block font-semibold text-gray-700 mb-2">Choose Template:</label>
        <select
  value={pendingEmailTemplate}
  onChange={(e) => setPendingEmailTemplate(e.target.value)}
>
  <option value="custom">Custom Message</option>
  <option value="shippingUpdate">Shipping Update</option>
  <option value="deliverySuccess">Delivery Success</option>
  <option value="newShipmentAlert">New Shipment Alert</option>
  <option value="delayedShipment">Delayed Shipment</option>
</select>

  
        <label className="block font-semibold text-gray-700 mb-2">Subject:</label>
        <input
          type="text"
    
          value={pendingEmailSubject}
          onChange={(e) => setPendingEmailSubject(e.target.value)}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full mb-3 md:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        <label className="block font-semibold text-gray-700 mb-2">Message:</label>
        <textarea
          value={pendingEmailMessage}
          onChange={(e) => setPendingEmailMessage(e.target.value)}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
  
        <button
        onClick={handleSendEmailToPending}
        className="bg-orange text-white px-4 py-2 md:px-6 md:py-3 rounded-lg w-full md:w-auto flex items-center justify-center hover:bg-orange/80 transition duration-200"
        disabled={isLoadingPending} // Disable button while loading
      >
        {isLoadingPending ? (
          <Loader size={20} color={"white"} /> // Show loader
        ) : (
          <>
            <FaPaperPlane className="mr-2" /> Send Email
          </>
        )}
      </button>
      </div>
  
      {/* Pending Shipments Display */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 md:mb-8 border border-gray-200">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 flex items-center">
          <FaList className="mr-2 md:mr-3 text-blue-500" /> Pending Shipments
        </h2>
  
        {isLoading ? (
          <div><Loader size={30} color={"orange"} /></div>
        ) : pendingShipments.length === 0 ? (
          <p className="text-gray-500">No pending shipments.</p>
        ) : (
          <div className="h-48 md:h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
            <ul className="list-none">
              {pendingShipments.map((shipment, index) => (
                <li
                  key={index}
                  className={`${
                    shipment.status === "updated" ? "text-green-500" : "text-gray-700"
                  } flex justify-between items-center py-2 text-sm md:text-base`}
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
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 md:mb-8 border border-gray-200">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 flex items-center">
          <FaList className="mr-2 md:mr-3 text-blue-500" /> Send Email to Selected Clients
        </h2>
  
        {/* Search Clients */}
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full mb-3 md:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {/* Client Selection */}
        <div className="border rounded-lg h-48 md:h-60 overflow-y-auto p-3 mb-4 md:mb-6 bg-gray-50">
          {filteredClients.length === 0 ? (
            <p className="text-gray-500">No clients found.</p>
          ) : (
            <>
              {/* Select All Checkbox */}
              <label className="block p-3 border-b bg-gray-100 font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClients.length === filteredClients.length}
                  onChange={(e) =>
                    setSelectedClients(
                      e.target.checked ? [...filteredClients] : []
                    )
                  }
                />
                <span className="ml-3">Select All</span>
              </label>
  
              {/* List of Clients */}
              {filteredClients.map((client) => (
                <label key={client._id} className="block p-3 border-b hover:bg-blue-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.some((c) => c._id === client._id)}
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
              ))}
            </>
          )}
        </div>
  
        {/* Email Template Selection */}
              <select
        value={selectedEmailTemplate}
        onChange={(e) => setSelectedEmailTemplate(e.target.value)}
      >
        <option value="custom">Custom Message</option>
        <option value="shippingUpdate">Shipping Update</option>
        <option value="deliverySuccess">Delivery Success</option>
        <option value="newShipmentAlert">New Shipment Alert</option>
        <option value="delayedShipment">Delayed Shipment</option>
      </select>

  
        {/* Email Subject */}
        <label className="block font-semibold text-gray-700 mb-2">Subject:</label>
        <input
          type="text"
          value={selectedEmailSubject}
          onChange={(e) => setSelectedEmailSubject(e.target.value)}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full mb-3 md:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {/* Email Message */}
        <label className="block font-semibold text-gray-700 mb-2">Message:</label>
        <textarea
          value={selectedEmailMessage}
          onChange={(e) => setSelectedEmailMessage(e.target.value)}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
  
        {/* Send Email Button */}
        <button
          onClick={handleSendEmailToSelected}
          className="bg-orange text-white px-4 py-2 md:px-6 md:py-3 rounded-lg w-full md:w-auto flex items-center justify-center hover:bg-orange/80 transition duration-200"
          disabled={isLoadingSelected} // Disable button while loading
        >
          {isLoadingSelected ? (
            <Loader size={20} color={"white"} /> // Show loader
          ) : (
            <>
              <FaPaperPlane className="mr-2" /> Send Email
            </>
          )}
        </button>

      </div>
    </div>
  );
  
  
}
