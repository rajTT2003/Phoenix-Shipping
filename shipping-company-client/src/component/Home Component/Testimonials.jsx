import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => {
  const reviews = [
    {
      name: "Emily Johnson",
      text: "Fast and reliable service! My package arrived earlier than expected.",
    },
    {
      name: "Michael Smith",
      text: "Great customer support and hassle-free tracking. Highly recommended!",
    },
    {
      name: "Sarah Williams",
      text: "Affordable rates and professional handling. I’m very satisfied!",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-primary mb-6">What Our Customers Say</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white p-6 shadow-lg rounded-lg">
            <FaQuoteLeft className="text-green-500 text-3xl mx-auto mb-4" />
            <p className="text-gray-600 italic">"{review.text}"</p>
            <h3 className="font-semibold mt-4">{review.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
