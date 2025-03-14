import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config"
export default function AdminSignIn() {
  const [step, setStep] = useState(1); // Step 1: Login | Step 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${config.API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      if (response.data.success) {
        setStep(2); // Move to OTP step
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Invalid credentials or too many login attempts.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${config.API_BASE_URL}/admin/verify-otp`, {
        email,
        otp,
      });

      if (response.data.success) {
        localStorage.setItem("adminuser", JSON.stringify(response.data.user));
        localStorage.setItem("admintoken", response.data.token);
        navigate("/admin/dashboard");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Sign In</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange/100 text-white py-2 rounded-lg hover:bg-orange/90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700">Enter OTP</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green/100 text-white py-2 rounded-lg hover:bg-green/90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
