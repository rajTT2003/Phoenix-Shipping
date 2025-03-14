import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import bannerImage from '/images/banner-image.jpeg';
const ContactUs = () => {
   
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Banner */}
            <div className="relative w-full h-56 flex items-center justify-center text-white text-3xl font-bold bg-cover bg-center" style={{ backgroundImage: `url(${bannerImage})` }}>
                <span className="bg-black bg-opacity-50 px-4 py-2 rounded">Contact Us</span>
            </div>
                       
            
            {/* Breadcrumb */}
            <div className="px-4 py-2 text-sm">
                <Link to="/" className="text-gray-500">Home</Link><span className="mx-2">/</span><span className="text-orange/100">Contact Us</span>
            </div>

            {/* Contact Details */}
            <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg mt-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">Get in Touch</h2>
                <p className="text-center text-gray-600">We'd love to hear from you. Reach out with any questions or inquiries!</p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-6 text-center">
                    <div className="flex flex-col items-center">
                        <Mail className="w-8 h-8 text-orange/100" />
                        <p className="text-gray-700 mt-2">rphoenixshipping@gmail.com</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Phone className="w-8 h-8 text-orange/100" />
                        <p className="text-gray-700 mt-2">+1 (876) 598-1612</p>
                        <p  className="text-gray-700 mt-2">+1 (876) 598-1705</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <MapPin className="w-8 h-8 text-orange/100" />
                        <p className="text-gray-700 mt-2">123 Business St, NY, USA</p>
                    </div>
                </div>
            </div>

           
        </div>
    );
};

export default ContactUs;
