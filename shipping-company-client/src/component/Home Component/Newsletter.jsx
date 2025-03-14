import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../config"
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const handleSubscribe = async () => { 
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email format.");
      return;
    }

    try {
      setLoading(true); 
      const response = await axios.post(`${config.API_BASE_URL}/api/newsletter/subscribe`, { email });

      if (response.data.success) {
        toast.success("Subscribed successfully!");
        setEmail(""); // Clear input 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-orange/60 via-orange/70 to-orange/80 py-16 text-center text-white">
      {/* 🔹 Content Section with Animation */}
      <motion.div
        className="max-w-lg mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-extrabold mb-4 text-white">Stay Updated</h2>
        <p className="text-lg text-white/90 mb-6">
          Subscribe to get the latest shipping updates and exclusive offers.
        </p>

        {/* 🔹 Input & Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
          />
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`bg-orange/90 hover:bg-orange/100 transition-all text-white px-6 py-3 rounded-full shadow-lg font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Newsletter;
