import { useState, useEffect } from "react";
import ShipmentTable from "./ShipmentTable";
import ShipmentModal from "./ShipmentModal";
import AddShipmentButton from "./AddShipmentButton";
import config from "../../../../config"
import Loader from "../../../Loader"

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const shipmentsPerPage = 10;

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(() => setError("Failed to fetch clients"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/admin/shipments`)
      .then((res) => res.json())
      .then((data) => setShipments(data))
      .catch(() => setError("Failed to fetch shipments"))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (shipment = null) => {
    setEditMode(!!shipment);
    setModalOpen(true);
    setCurrentShipment(shipment);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setCurrentShipment(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/admin/shipments/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          setShipments(shipments.filter((shipment) => shipment._id !== id));
        } else {
          alert("Failed to delete shipment");
        }
      } catch (error) {
        alert("Error deleting shipment");
      }
    }
  };

  // ✅ Apply filtering before pagination
  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.clientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Paginate after filtering
  const indexOfLastShipment = currentPage * shipmentsPerPage;
  const indexOfFirstShipment = indexOfLastShipment - shipmentsPerPage;
  const currentShipments = filteredShipments.slice(indexOfFirstShipment, indexOfLastShipment);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shipment Management</h1>
      <input
        type="text"
        placeholder="Search by Tracking Number or Client ID"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // ✅ Reset to first page on search
        }}
        className="border p-2 rounded mb-4 w-full"
      />

      {loading ? <Loader size={40} color={"orange"} /> : error ? <div className="text-red-500">{error}</div> : (
        <>
          <AddShipmentButton openModal={() => openModal()} />
          <ShipmentTable shipments={currentShipments} openModal={openModal} handleDelete={handleDelete} />
          
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="self-center">Page {currentPage} of {Math.ceil(filteredShipments.length / shipmentsPerPage)}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastShipment >= filteredShipments.length}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <ShipmentModal
          isOpen={modalOpen}
          onClose={closeModal}
          editMode={editMode}
          initialData={currentShipment}
          clients={clients}
          setShipments={setShipments}
        />
      )}
    </div>
  );
}
