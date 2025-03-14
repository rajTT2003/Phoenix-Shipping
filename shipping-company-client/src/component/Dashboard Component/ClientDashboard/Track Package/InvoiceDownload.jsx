import React from "react";
import { Download } from "lucide-react";
export default function InvoiceDownload({ trackingNumber }) {
  const downloadInvoice = () => {
    alert(`Downloading invoice for tracking number: ${trackingNumber}`);
    // Add logic to trigger invoice download
  };

  return (
    <div className="bg-white p-1 rounded-lg shadow-md mb-6">
      <button
        onClick={downloadInvoice}
        className="bg-green-500 text-black px-6 py-3 inline rounded-lg hover:bg-green-700 transition"
      >
        Download Invoice 
      </button>
    </div>
  );
}
