import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import app from '../firebase/firebase.config';
import logo from '/images/loginLogo.png';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/authContext';
import config from "../config"
import Loader from "./Loader"
const Login = () => {
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, googleLogin, user, loading } = useAuth(); // Destructure `user`, `login`, `googleLogin`, and `loading`
 
    const [isLoading, setLoading] = useState(false);
    // Handle Google login
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const googleUser = result.user;

            // Pass Google token to backend for authentication
            const response = await googleLogin(googleUser.accessToken);
            
            if (response?.status === 200) {
                toast.success("Login successful!");
                navigate("/client/dashboard"); // Redirect to client dashboard after successful login
            } else {
                throw new Error("Google login failed.");
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error(error.message || "Google login failed");
        }
    };

    // Handle Email login
    const handleEmailLogin = async () => {
        try {
            setLoading(true); // Set loading before request starts
    
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
    
            const response = await axios.post(`${config.API_BASE_URL}/api/auth/login`, {
                email,
                password,
            });
    
            if (response.status === 200) {
                const { token, user } = response.data;
    
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
    
                await login(email, password);
    
                toast.success("Login successful!");
                navigate("/client/dashboard");
            } else {
                toast.error(response.data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error(error.response?.data?.error || error.message || "Login failed");
        } finally {
            setLoading(false); // Ensure loading is set to false after request completes
        }
    };
    

    // Log user state for debugging
    useEffect(() => {
        console.log("User state in Login:", user);
    }, [user]);

    // If loading, show a loading spinner or similar
    if (loading) {
        return <div><Loader size={40}  color={"orange"}/></div>;
    }

    return (
        <div className='h-screen w-full flex flex-col items-center justify-center bg-gray-100'>
            <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
                <span>Home</span>
            </button>

            <div className="flex flex-col items-center mb-4 font-bold">
                <img src={logo} alt="Phoenix Shipping Logo" className="w-20 h-20" />
                <span className="text-xl font-bold ">Phoenix<span className="text-orange">Shipping</span></span>
            </div>

            <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>

                <div className='flex flex-col gap-4'>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        placeholder='Email'
                        className='px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange'
                    />
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange'
                    />
                   <button className="bg-orange w-full py-2 text-white rounded disabled:opacity-50" 
                   disabled={isLoading}
                   onClick={handleEmailLogin}>
                    {isLoading ? <Loader  size={25}  color={"white"} /> : "Login"}
                    </button>

                </div>

                <div className='mt-4 text-center'>
                    <Link to="/reset-password" className='text-orange underline'>Forgot Password?</Link>
                </div>

                <div className="hidden  items-center justify-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button className='hidden  items-center justify-center w-full py-2 text-black mb-4 rounded border border-gray-300' onClick={handleGoogleLogin}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    <span className='ml-2'>Login with Google</span>
                </button>

                <div className='mt-4 text-center'>
                    <span>Don't have an account?</span>
                    <Link to="/sign-up" className='text-orange ml-2 underline'>Sign Up</Link>
                </div>

                <ToastContainer />
            </div>
        </div>
    );
};

export default Login;
