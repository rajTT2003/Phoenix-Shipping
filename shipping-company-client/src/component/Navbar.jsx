import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/authContext'; // Import the useAuth hook
import logo from '/images/phoenixshippinglogo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth(); // Access user and logout function from context
    const navigate = useNavigate();

    const handleNavigatetoLogin = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        try {
            logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const navItems = [
        { path: "/", title: "Home" },
        { path: "/package-calculator", title: "Package Calculator" },
        { path: "/contact", title: "Contact Us" },
    ];

    return (
        <header className='bg-white shadow-md sticky top-0 z-50'>
            <nav className='container mx-auto flex justify-between items-center py-4 px-2'>
                <Link to="/" className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <img src={logo} alt="Phoenix Shipping Logo" className="w-12" />
                    <span className="text-orange">Phoenix</span>Shipping
                </Link>

                <ul className='hidden md:flex space-x-8'>
                    {navItems.map(({ path, title }) => (
                        <li key={path}>
                            <NavLink to={path} className={({ isActive }) =>
                                isActive ? 'text-green-500 font-semibold' : 'text-gray-700 hover:text-orange/90 transition duration-200'}>
                                {title}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className='hidden md:flex items-center space-x-4'>
                    {user ? (
                        <div className='relative'>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className='text-gray-700 focus:outline-none'>
                                {user.displayName}
                            </button>
                            {isDropdownOpen && (
                                <div className='absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md py-2'>
                                    <button onClick={handleLogout} className='block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left'>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={handleNavigatetoLogin} className='bg-orange/80 text-primary px-4 py-2 rounded-lg hover:bg-orange/100 transition duration-200'>
                            Login
                        </button>
                    )}
                </div>

                <button className='md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes className='text-2xl' /> : <FaBars className='text-2xl' />}
                </button>
            </nav>

            {isMenuOpen && (
                <div className='md:hidden absolute top-16 left-0 w-full bg-white shadow-md p-6'>
                    <ul className='flex flex-col space-y-4'>
                        {navItems.map(({ path, title }) => (
                            <li key={path}>
                                <NavLink to={path} className={({ isActive }) =>
                                    isActive ? 'text-green-500 font-semibold block' : 'text-gray-700 hover:text-orange/100 transition duration-200 block'}
                                    onClick={() => setIsMenuOpen(false)}>
                                    {title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <div className='mt-4'>
                        {user ? (
                            <>
                                <span className='block text-gray-700 mb-2'>{user.displayName}</span>
                                <button onClick={handleLogout} className='w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200'>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button onClick={handleNavigatetoLogin} className='w-full bg-orange/85 text-primary py-2 rounded-lg hover:bg-orange/100 transition duration-200'>
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
            <ToastContainer />
        </header>
    );
};

export default Navbar;
