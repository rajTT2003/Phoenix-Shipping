import React from 'react';
import { motion } from 'framer-motion';
import bannerImage from '/images/banner-image.jpeg'; // Replace with actual path

const Banner = () => {
  return (
    <div className='relative h-screen max-w-screen-2xl mx-auto xl:px-24 px-4 md:py-40 py-24 text-center overflow-hidden'>
      {/* Background Image */}
      <div 
        className='absolute inset-0 bg-cover bg-top opacity-80'
        style={{ backgroundImage: `url(${bannerImage})` }}
      />
      
      {/* Overlay */}
      <div className='relative z-10 bg-black/50 p-6 rounded-lg md:max-w-3xl mx-auto'>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }}
          className='text-4xl md:text-5xl font-bold text-white mb-3'>
          Fast & Reliable <span className='text-green-400'>Courier Services</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.3 }}
          className='text-lg text-white/80 mb-6'>
          Track your shipments, get estimated delivery times, and explore our shipping solutions.
        </motion.p>
        
        <motion.a 
          href='/sign-up' 
          className='inline-block bg-orange/60 hover:bg-orange/80 transition duration-300 text-white font-semibold py-3 px-6 rounded-lg'
          whileHover={{ scale: 1.1 }}
        >
          Ship Today !
        </motion.a>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-opacity-30 bg-black z-0"></div>
    </div>
  );
};

export default Banner;
