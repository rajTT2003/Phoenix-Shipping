import React from 'react';
import { FaShieldAlt, FaClock, FaSmile } from 'react-icons/fa';

const WhyChooseUs = () => {
  return (
    <div className="relative py-16 px-4">
      {/* 🔹 Background Design with Triangular Blending */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, #f3f4f6, #e5e7eb)`,
          }}
        ></div>

        {/* Artistic Triangle Overlay */}
        <div
          className="absolute top-0 left-0 w-full h-20"
          style={{
            background: `url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20600%2060%22%3E%3Cpolygon%20points=%220,60%20300,0%20600,60%22%20fill=%22#e5e7eb%22/%3E%3C/svg%3E')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
      </div>

      {/* 🔹 Content Section */}
      <div className="relative z-10 max-w-screen-xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-10">Why Choose Us</h2>
        
        {/* Staggered Card Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 shadow-xl rounded-lg transform md:translate-y-4">
            <FaShieldAlt className="text-orange/60 text-5xl mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Secure & Reliable</h3>
            <p className="text-gray-600">We ensure your package is delivered safely and securely.</p>
          </div>

          <div className="bg-white p-6 shadow-xl rounded-lg transform md:-translate-y-4">
            <FaClock className="text-orange/60 text-5xl mx-auto mb-4" />
            <h3 className="font-semibold text-lg">On-Time Delivery</h3>
            <p className="text-gray-600">We value your time and ensure prompt deliveries.</p>
          </div>

          <div className="bg-white p-6 shadow-xl rounded-lg transform md:translate-y-4">
            <FaSmile className="text-orange/60 text-5xl mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Customer Satisfaction</h3>
            <p className="text-gray-600">Our support team is always available for your assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
