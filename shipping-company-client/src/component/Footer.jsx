import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold text-white">Phoenix Shipping</h2>
          <p className="mt-3 text-sm">
            Fast, secure, and reliable shipping services. Track your packages in real-time and 
            experience hassle-free deliveries.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="hover:text-orange/100 transition">Home</a></li>
            <li><a href="#" className="hover:text-orange/100 transition">Package Calculator</a></li>
            <li><a href="#" className="hover:text-orange/100 transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="flex space-x-4 mt-3">
            <a href="#" className="text-gray-400 hover:text-orange/100 transition text-xl">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-400 hover:text-orange/100 transition text-xl">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-400 hover:text-orange/100 transition text-xl">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-400 hover:text-orange/100 transition text-xl">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm">
        © {new Date().getFullYear()} Phoenix Shipping. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
