import { useState, useEffect } from "react";
import config from '../../../config'
const RateSetter = () => {
  const [rates, setRates] = useState({ perPound: 0, perKg: 0 });
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [cost, setCost] = useState(null);
  const [message, setMessage] = useState("");

// Fetch the current rates from the backend
useEffect(() => {
  const fetchRates = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/rates`);
      const data = await response.json();
      if (response.ok) {
        setRates({ perPound: data.perPound || 0, perKg: data.perKg || 0 });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Failed to fetch rates.");
    }
  };
  fetchRates();
}, []);

// Handle updating rates
const handleRateSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  const token = localStorage.getItem("admintoken");
  if (!token) return setMessage("Unauthorized: Token not found");

  const response = await fetch(`${config.API_BASE_URL}/api/admin/rates`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      perPound: parseFloat(rates.perPound),
      perKg: parseFloat(rates.perKg),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    setMessage(data.error || "Failed to update rates.");
  } else {
    setMessage(data.message);
  }
};

// Handle cost calculation
const handleCostCalculation = async () => {
  if (!weight || isNaN(weight)) return setMessage("Invalid weight");

  const response = await fetch(`${config.API_BASE_URL}/api/calculate-cost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight: parseFloat(weight), unit }),
  });

  const data = await response.json();
  if (response.ok) {
    setCost(data.cost);
  } else {
    setMessage(data.error);
  }
};

return (
  <div className="container mt-6 bg-white mx-auto p-4 rounded-lg">
    <h2 className="text-2xl font-bold mb-6">Admin Shipping Rates</h2>

    {/* Set Rates Form */}
    <form onSubmit={handleRateSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold">Per Pound Rate:</label>
        <input
          type="number"
          value={rates.perPound}
          onChange={(e) => setRates({ ...rates, perPound: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">Per Kg Rate:</label>
        <input
          type="number"
          value={rates.perKg}
          onChange={(e) => setRates({ ...rates, perKg: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-orange/100 text-white font-semibold rounded-md hover:bg-orange/90 transition">
        Set Rates
      </button>
    </form>

    {/* Calculate Cost */}
    <div className="mt-8">
      <h3 className="text-xl font-semibold">Calculate Shipping Cost</h3>
      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Enter weight" className="w-full p-2 border" />
      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2 border">
        <option value="kg">kg</option>
        <option value="lb">lb</option>
      </select>
      <button onClick={handleCostCalculation} className="w-full py-2 bg-green/100 text-white">Calculate Cost</button>
      {cost !== null && <p className="mt-4 text-lg font-semibold">Shipping Cost: ${cost}</p>}
    </div>

    {message && <p className="mt-4 text-red-600">{message}</p>}
  </div>
);
};

export default RateSetter;
