import React from "react";
import { FaBox, FaTruckMoving, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const steps = [
  {
    icon: <FaBox className="text-orange/80 text-5xl" />,
    title: "Sign Up",
    description: "Create an account and enter your shipping address to schedule a pickup online.",
  },
  {
    icon: <FaTruckMoving className="text-orange/80 text-5xl" />,
    title: "Pickup & Shipment",
    description: "Our trusted courier partners pick up your package and ship it to the destination.",
  },
  {
    icon: <FaCheckCircle className="text-orange/80 text-5xl" />,
    title: "Package Delivered",
    description: "Your package arrives safely with real-time tracking updates for peace of mind.",
  },
];

const HowItWorks = () => {
  return (
    <div className="relative py-16 px-4 text-center">
      {/* Background Triangular Design */}
      <div
        className="absolute inset-0 z-0"
       
      ></div>

      {/* Section Header */}
      <motion.h2
        className="text-4xl font-extrabold text-gray-900 mb-12 relative inline-block z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        How It Works
        <span className="block w-1/2 h-1 bg-black absolute left-0 bottom-0"></span>
        <span className="block w-1/2 h-1 bg-orange/50 absolute right-0 bottom-0"></span>
      </motion.h2>

      {/* Steps */}
      <div className="relative flex flex-col md:flex-row items-center justify-between z-10">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center md:w-1/3 mb-8 md:mb-0"
          >
            {/* Step Icon inside Circle */}
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-orange/50 border-4 border-orange/50 shadow-lg mb-4 z-10">
              {step.icon}
            </div>

            {/* Step Content */}
            <h3 className="font-bold text-lg text-gray-800 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm px-6">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
