import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../config"
const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, firstName, lastName } = location.state || {};

  const [formData, setFormData] = useState({
    phone: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    parish: "",
    town: "",
    servicePreferences: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${config.API_BASE_URL}/api/signup`, {
        email,
        firstName,
        lastName,
        phone: formData.phone,
        companyName: formData.companyName,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          parish: formData.parish,
          town: formData.town,
        },
        servicePreferences: formData.servicePreferences,
        isEmailVerified: true,
      });

      toast.success("Profile completed!");
      navigate("/");
    } catch (error) {
      console.error("Error saving user data:", error);
      toast.error("Error completing profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden">
        <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Phone */}
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Enter phone number"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-gray-700">Company Name (Optional)</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Company Name"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Street Address"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          {/* Parish */}
          <div>
            <label className="block text-gray-700">Parish</label>
            <input
              type="text"
              name="parish"
              value={formData.parish}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Parish"
            />
          </div>

          {/* Town */}
          <div>
            <label className="block text-gray-700">Town</label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Town"
            />
          </div>

          {/* Service Preferences */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700">Service Preferences</label>
            <textarea
              name="servicePreferences"
              value={formData.servicePreferences}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your preferred services"
              rows="3"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex justify-center sm:justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
