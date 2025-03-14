import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { PackageCheck, MapPin } from 'lucide-react';

export default function PackageDetails({ status, statusLog }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && status.trackingNumber) {
      JsBarcode(barcodeRef.current, status.trackingNumber, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 50,
        displayValue: true,
      });
    }
  }, [status.trackingNumber]);

  return (
    <div className="mt-6 w-full max-w-4xl border border-gray-300 rounded-lg p-6 bg-white shadow-md">
      <div className="grid grid-cols-3 gap-6 items-start">
        
        {/* Package Details */}
        <div>
          <h3 className="text-2xl font-bold text-gray-700 flex items-center mb-3">
            <PackageCheck className="text-green-500 mr-3" /> Package Details
          </h3>
          <table className="table-auto w-full text-gray-700">
            <tbody>
              <tr><td><strong>Tracking Number:</strong></td><td>{status.trackingNumber}</td></tr>
              <tr><td><strong>Status:</strong></td><td>{status.status}</td></tr>
              <tr><td><strong>Estimated Delivery:</strong></td><td>{status.estimatedDelivery}</td></tr>
              <tr><td><strong>Sender:</strong></td><td>{status.sender}</td></tr>
              <tr><td><strong>Receiver:</strong></td><td>{status.receiver}</td></tr>
              <tr><td><strong>Weight:</strong></td><td>{status.weight}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Package Address (NEW COLUMN) */}
        <div>
          <h3 className="text-2xl font-bold text-gray-700 flex items-center mb-3">
            <MapPin className="text-blue-500 mr-3" /> Package Address
          </h3>
          <table className="table-auto w-full text-gray-700">
            <tbody>
              <tr><td><strong>Origin:</strong></td><td>{status.origin.address}</td></tr>
              <tr><td><strong>Current Location:</strong></td><td>{status.currentLocation.address}</td></tr>
              <tr><td><strong>Destination:</strong></td><td>{status.destination.address}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Barcode */}
        <div className="text-center flex items-center justify-center">
          <svg ref={barcodeRef}></svg>
        </div>
      </div>

      {/* Package Status Log */}
      {statusLog.length > 0 && (
        <div className="mt-6 w-full border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Status Updates</h3>
          <table className="table-auto w-full text-gray-700 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="text-left border border-gray-300 px-4 py-2">Timestamp</th>
                <th className="text-left border border-gray-300 px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {statusLog.map((log, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{log.timestamp}</td>
                  <td className="border border-gray-300 px-4 py-2">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
