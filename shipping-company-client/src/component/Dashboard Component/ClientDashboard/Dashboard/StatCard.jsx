import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon }) => (
  <motion.div
    className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-4"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
  >
    <div className="p-3 bg-orange/100 rounded-lg">{icon}</div>
    <div>
      <h4 className="text-lg font-semibold text-white">{value}</h4>
      <p className="text-sm opacity-75">{title}</p>
    </div>
  </motion.div>
);

export default StatCard;
