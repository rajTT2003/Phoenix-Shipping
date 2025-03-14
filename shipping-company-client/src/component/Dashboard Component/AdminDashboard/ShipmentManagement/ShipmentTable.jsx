import { FaEdit, FaTrash } from "react-icons/fa";

export default function ShipmentTable({ shipments, openModal , handleDelete}) {
  return (
    <div className="overflow-x-auto mt-5">
      <table className="w-full bg-white shadow-md rounded-lg text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3">Package ID</th>
            <th className="p-3">Client ID</th>
            <th className="p-3">Tracking #</th>
            <th className="p-3">HAWB#</th>
            <th className="p-3">Description</th>
            <th className="p-3">Package Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Weight</th>
            <th className="p-3">Cost</th>
            <th className="p-3">Latest Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
  {Array.isArray(shipments) && shipments.length > 0 ? (
    shipments.map((shipment) => {
      const latestStatus = Array.isArray(shipment.status) && shipment.status.length
        ? shipment.status[shipment.status.length - 1]
        : { status: "Unknown", date: "N/A" };

      return (
        <tr key={shipment.id} className="border-b">
          <td className="p-3">{shipment.packageId}</td>
          <td className="p-3">{shipment.clientId}</td>
          <td className="p-3">{shipment.trackingNumber}</td>
          <td className="p-3">{shipment.hawbNumber || "N/A"}</td>
          <td className="p-3">{shipment.description}</td>
          <td className="p-3">{shipment.packageType}</td>
          <td className="p-3">{latestStatus.status}</td>
          <td className="p-3">{shipment.weight} {shipment.unit}  </td>
          <td className="p-3">${shipment.cost}</td>
          <td className="p-3">{new Date(latestStatus.date).toLocaleDateString()}</td>
          <td className="p-3 flex space-x-2">
        <button className="text-blue-500" onClick={() => openModal(shipment)}>
          <FaEdit />
        </button>
        <button
          className="text-red-500"
          onClick={() => handleDelete(shipment._id)} // Add a delete handler
        >
          <FaTrash />
        </button>
      </td>

        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="10" className="p-3 text-center">No shipments available</td>
    </tr>
  )}
</tbody>

      </table>
    </div>
  );
}
