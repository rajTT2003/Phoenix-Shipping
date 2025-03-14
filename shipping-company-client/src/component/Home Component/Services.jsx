import React from 'react';
import { FaPlane, FaTruck, FaShippingFast } from 'react-icons/fa';
import { motion } from 'framer-motion';

const services = [
  {
    icon: <FaPlane className="text-orange/50 text-5xl mb-4" />,
    title: "International Shipping",
    description: "Fast and secure international package delivery.",
  },
  {
    icon: <FaTruck className="text-orange/50 text-5xl mb-4" />,
    title: "Local Deliveries",
    description: "Reliable same-day and next-day delivery options.",
  },
  {
    icon: <FaShippingFast className="text-orange/50 text-5xl mb-4" />,
    title: "Express Shipping",
    description: "Urgent delivery solutions for time-sensitive shipments.",
  },
];

const Services = () => {
  return (
    <div className="relative py-20 px-6 text-center overflow-hidden">
      {/* Background with Triangle Shapes */}
      

      {/* Section Title */}
      <motion.h2
        className="text-4xl font-extrabold text-gray-900 mb-12 relative inline-block z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Services
        <span className="block w-1/2 h-1 bg-black absolute left-0 bottom-0"></span>
        <span className="block w-1/2 h-1 bg-orange/50 absolute right-0 bottom-0"></span>
      </motion.h2>

      {/* Services Grid */}
      <div className="relative grid md:grid-cols-3 gap-10 z-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 shadow-lg rounded-xl transition transform hover:scale-105 duration-300"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="flex justify-center">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mt-4">{service.title}</h3>
            <p className="text-gray-600 mt-2">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;
