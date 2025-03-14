import { useState } from "react";
import axios from "axios";
import config from "../../config"
const ForgotPassword = ({ setEmail, onNext }) => {
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/auth/forgot-password`, { email: emailInput });
      setMessage(res.data.message);
      setEmail(emailInput);  // Pass email to parent
      onNext();  // Move to next step
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange/100"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
          </div>

          {message && <p className={`text-sm ${message.includes("wrong") ? "text-red-500" : "text-green-500"}`}>{message}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-orange/100 rounded-lg hover:bg-orange/85 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
