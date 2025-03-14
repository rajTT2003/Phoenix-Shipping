import React from 'react';
import Banner from '../component/Home Component/Banner';
import Services from '../component/Home Component/Services';
import HowItWorks from '../component/Home Component/HowItWorks';
import WhyChooseUs from '../component/Home Component/WhyChooseUs';
import Testimonials from '../component/Home Component/Testimonials';
import Newsletter from '../component/Home Component/Newsletter';

const Home = () => {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <Banner />
      </div>

      {/* 🔷 Combined How It Works + Services Section 🔷 */}
      <div className="relative bg-gradient-to-b from-white via-blue-100 to-gray-100 py-16">
        {/* Triangular Connecting Shape */}
        <div
          className="absolute top-0 left-0 w-full h-16"
          style={{
            background: `url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20400%22%3E%3Cpolygon%20points=%220,0%200,200%20400,0%22%20fill=%22%23fef2f2%22/%3E%3Cpolygon%20points=%220,200%20200,400%20400,200%22%20fill=%22%23f9fafb%22/%3E%3Cpolygon%20points=%220,100%20200,200%200,300%22%20fill=%22%23e5e7eb%22/%3E%3Cpolygon%20points=%22200,100%20400,200%20200,300%22%20fill=%22%23f3f4f6%22/%3E%3C/svg%3E')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",  // Ensuring the background covers the entire section
          }}
        ></div>

        <HowItWorks />

        {/* Services Section (Shares Background) */}
        <Services />
      </div>

      {/* Why Choose Us Section */}
      <div className="relative bg-gradient-to-b from-gray-100 via-gray-100 to-gray-300 py-16">
 

      {/* Why Choose Us with Background Blending */}
      <WhyChooseUs />
    </div>
      {/* Testimonials Section
      <div className="py-16 bg-gray-50">
       {/* <Testimonials /> 
      </div>
       */}

      {/* Newsletter Signup */}
      <div className="relative overflow-hidden z-10">
  <Newsletter />
</div>


    </div>
  );
};

export default Home;
