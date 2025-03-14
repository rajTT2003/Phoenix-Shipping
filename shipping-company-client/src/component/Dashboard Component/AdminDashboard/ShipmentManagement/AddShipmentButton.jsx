export default function AddShipmentButton({ openModal }) {
    return (
      <button
        onClick={openModal} // Ensure it calls openModal when clicked
        className="bg-orange/100 text-white px-4 py-2 rounded hover:bg-orange/90 transition"
      >
        + Add Shipment
      </button>
    );
  }
  