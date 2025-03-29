import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { ChevronDown } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/authContext';
import logo from '/images/phoenixshippinglogo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleNavigateToLogin = () => {
        setIsMenuOpen(false); // Close menu on navigation
        navigate('/login');
    };

    const handleNavigateToDashboard = () => {
        setIsDropdownOpen(false);
        navigate('/client/dashboard');
    };

    const handleLogout = async () => {
        try {
            await logout(); // Ensure the function is awaited
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Error logging out');
        }
        setIsDropdownOpen(false);
    };

    const navItems = [
        { path: "/", title: "Home" },
        { path: "/package-calculator", title: "Package Calculator" },
        { path: "/contact", title: "Contact Us" },
    ];

    return (
        <header className='bg-white shadow-md sticky top-0 z-50'>
            <nav className='container mx-auto flex justify-between items-center py-4 px-2'>
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <img src={logo} alt="Phoenix Shipping Logo" className="w-12" />
                    <span className="text-orange">Phoenix</span>Shipping
                </Link>

                {/* Desktop Navigation */}
                <ul className='hidden md:flex space-x-8'>
                    {navItems.map(({ path, title }) => (
                        <li key={path}>
                            <NavLink to={path} className={({ isActive }) =>
                                isActive ? 'text-green font-semibold' : 'text-gray-700 hover:text-orange/90 transition duration-200'}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {title}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Desktop User Dropdown */}
                <div className='hidden md:flex items-center space-x-4 relative'>
                    {user ? (
                        <div className='relative z-50'>
                            <button
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className='text-gray-700 font-semibold hover:text-orange/90 transition  flex items-center space-x-1'
                            >
                                {user?.firstName || 'User'}
                                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          
                            </button>

                            {isDropdownOpen && (
                                <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border border-gray-200'>
                                    <button
                                        onClick={handleNavigateToDashboard}
                                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
                                    >
                                        Go to Dashboard
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className='block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left'
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleNavigateToLogin}
                            className='bg-orange/100 text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition duration-200'
                        >
                            Login
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className='md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes className='text-2xl' /> : <FaBars className='text-2xl' />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className='md:hidden absolute top-16 left-0 w-full bg-white shadow-md p-6'>
                    <ul className='flex flex-col space-y-4'>
                        {navItems.map(({ path, title }) => (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    className={({ isActive }) =>
                                        isActive ? 'text-green font-semibold block' : 'text-gray-700 hover:text-orange/90 transition duration-200 block'}
                                    onClick={() => setIsMenuOpen(false)} // Close menu on click
                                >
                                    {title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <div className='mt-4'>
                        {user ? (
                            <>
                              {/*  <span className='block text-gray-700 mb-2'>{user?.displayName || 'User'}</span> */}
                                <button
                                    onClick={handleNavigateToDashboard}
                                    className='w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-200 mb-2'
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className='w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200'
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleNavigateToLogin}
                                className='w-full bg-orange/100 text-white py-2 rounded-lg hover:bg-orange/90 transition duration-200'
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
           
        </header>
    );
};

export default Navbar;
