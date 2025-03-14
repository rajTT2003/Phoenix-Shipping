import { useState, useEffect } from "react";
import config from '../../../config'

export default function ShippingAddress() {
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/admin/shipping-address`, {
      headers: { Authorization: localStorage.getItem("admintoken") },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.addressLine1 !== undefined) {
          setAddress(data); // Only set if the correct object structure is returned
        }
      })
      .catch(() => setMessage("Failed to load address"));
  }, []);
  

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    const response = await fetch(`${config.API_BASE_URL}/api/admin/shipping-address`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("admintoken"),
      },
      body: JSON.stringify(address), // Ensure object is sent properly
    });
  
    const data = await response.json();
    setLoading(false);
    setMessage(data.message || "Failed to update address");
  };
  

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
      {message && <p className="text-red">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="addressLine1" placeholder="Address Line 1" value={address.addressLine1} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="addressLine2" placeholder="Address Line 2" value={address.addressLine2} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="city" placeholder="City" value={address.city} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="state" placeholder="State" value={address.state} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="zipCode" placeholder="Zip Code" value={address.zipCode} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="country" placeholder="Country" value={address.country} onChange={handleChange} className="p-2 border rounded" required />

        <button type="submit" className="bg-orange/100 text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Address"}
        </button>
      </form>
    </div>
  );
}
