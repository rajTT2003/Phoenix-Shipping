import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseApp from '../firebase/firebase.config'; // Import the default export
import logo from '/images/loginLogo.png';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/authContext'; // Adjust the path if needed
import config from "../config"




const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [parish, setParish] = useState('');
    const [town, setTown] = useState('');
    const [townsList, setTownsList] = useState([]);
    const [servicePreferences, setServicePreferences] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [resendEmailTimer, setResendEmailTimer] = useState(60);
    const [canResendEmail, setCanResendEmail] = useState(false);


    const [phoneVerified, setPhoneVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth(firebaseApp);
    const googleProvider = new GoogleAuthProvider();
    const { signup, googleLogin } = useAuth();

 
    const handlePhoneChange = (e) => {
        let input = e.target.value;

        // Remove any non-numeric characters
        input = input.replace(/\D/g, "");

        // Format the phone number
        if (input.length <= 3) {
            input = input;
        } else if (input.length <= 6) {
            input = `(${input.slice(0, 3)}) ${input.slice(3, 6)}`;
        } else {
            input = `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6, 10)}`;
        }

        setPhone(input);
    };

    // Handle parish change
    const handleParishChange = (e) => {
        const selectedParish = e.target.value;
        setParish(selectedParish);
        const selectedParishObj = parishes.find(p => p.name === selectedParish);
        setTownsList(selectedParishObj ? selectedParishObj.towns : []);
        setTown(''); // Reset town when parish changes
    };


    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);


    const handleEmailSignup = async (e) => {
        e.preventDefault();
    
        if (!isEmailVerified) {
            toast.error("Please verify your email before signing up.");
            return;
        }
    
        try {
            const checkResponse = await axios.get(`${config.API_BASE_URL}/api/check-email?email=${email}`);
            if (checkResponse.data.exists) {
                toast.info("Email is already in use!");
                return;
            }
    
            const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${town}, ${parish}`;
    
            await signup(email, password, firstName, lastName, phone, companyName, fullAddress, servicePreferences);
    
            toast.success("Signup successful! Redirecting...");
            navigate("/login");
        } catch (error) {
            console.error("Signup Error:", error);
            toast.error(error.message || "Signup failed");
        }
    };
    
    

    const handleSendEmailVerification = async () => {
        if (!email) {
            toast.error("Please enter an email address first.");
            return;
        }
    
        try {
            await axios.post(`${config.API_BASE_URL}/api/send-email-verification`, { email });
            setEmailVerificationSent(true);
            setIsEmailVerificationModalOpen(true);
            setResendEmailTimer(60);
            setCanResendEmail(false);
            toast.success("Verification code sent to your email.");
        } catch (error) {
            console.error("Error sending email verification:", error);
            toast.error("Failed to send verification email.");
        }
    };
    
    const handleVerifyEmail = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/verify-email`, {
                email,
                code: verificationCode
            });
    
            if (response.data.verified) {
                setIsEmailVerified(true);
                setIsEmailVerificationModalOpen(false);
                toast.success("Email verified successfully!");
            } else {
                toast.error("Incorrect verification code.");
            }
        } catch (error) {
            console.error("Email verification error:", error);
            toast.error("Verification failed.");
        }
    };
        
    





    

    


    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            await googleLogin(user.accessToken); // Use AuthContext googleLogin function

            try {
                const res = await axios.get(`${config.API_BASE_URL}/api/users`, {
                    params: { email: user.email }
                });

                if (res?.data) {
                    toast.success('Welcome back!');
                    navigate('/');
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    navigate('/complete-profile', {
                        state: {
                            email: user.email,
                            firstName: user.displayName?.split(' ')[0] || '',
                            lastName: user.displayName?.split(' ')[1] || ''
                        }
                    });
                } else {
                    toast.error("Error checking user data. Please try again.");
                }
            }
        } catch (error) {
            if (error.code === "auth/popup-closed-by-user") {
                toast.error("Sign-in popup was closed. Please try again.");
            } else {
                console.error("Error signing up with Google:", error);
                toast.error("Error signing up with Google. Please try again.");
            }
        }
    };

    const parishes = [
        { 
            name: 'Kingston', 
            towns: ['Kingston', 'New Kingston', 'Half Way Tree', 'Papine', 'Cross Roads']
        },
        { 
            name: 'St. Andrew', 
            towns: ['Constant Spring', 'Stony Hill', 'Red Hills', 'Mona', 'Havendale']
        },
        { 
            name: 'St. Thomas', 
            towns: ['Morant Bay', 'Yallahs', 'Seaforth', 'Port Morant', 'Bath']
        },
        { 
            name: 'Portland', 
            towns: ['Port Antonio', 'Buff Bay', 'Hope Bay', 'Manchioneal', 'Long Bay']
        },
        { 
            name: 'St. Mary', 
            towns: ['Port Maria', 'Annotto Bay', 'Highgate', 'Oracabessa', 'Richmond']
        },
        { 
            name: 'St. Ann', 
            towns: ['Ocho Rios', 'St. Ann’s Bay', 'Brown’s Town', 'Runaway Bay', 'Discovery Bay']
        },
        { 
            name: 'Trelawny', 
            towns: ['Falmouth', 'Clark’s Town', 'Duncans', 'Wakefield', 'Albert Town']
        },
        { 
            name: 'St. James', 
            towns: ['Montego Bay', 'Anchovy', 'Cambridge', 'Hopewell', 'Adelphi']
        },
        { 
            name: 'Hanover', 
            towns: ['Lucea', 'Sandy Bay', 'Green Island', 'Hopewell', 'Cascade']
        },
        { 
            name: 'Westmoreland', 
            towns: ['Savanna-la-Mar', 'Negril', 'Grange Hill', 'Bethel Town', 'Little London']
        },
        { 
            name: 'St. Elizabeth', 
            towns: ['Black River', 'Santa Cruz', 'Junction', 'Balaclava', 'Malvern']
        },
        { 
            name: 'Manchester', 
            towns: ['Mandeville', 'Christiana', 'Porus', 'Spaldings', 'Williamsfield']
        },
        { 
            name: 'Clarendon', 
            towns: ['May Pen', 'Chapelton', 'Frankfield', 'Lionel Town', 'Rock River']
        },
        { 
            name: 'St. Catherine', 
            towns: ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead', 'Ewarton']
        }
    ];
    
    return (
        <div className="h-auto w-full flex flex-col items-center justify-center bg-gray-100">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Home</span>
        </button>
      
        <div className="flex flex-col items-center mb-8 font-bold">
          <img src={logo} alt="Phoenix Shipping Logo" className="w-24 h-24 mb-2" />
          <span className="text-xl font-bold">
            Phoenix<span className="text-orange">Shipping</span>
          </span>
        </div>
      
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Sign Up</h2>
      
          <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <input
                type="email"
                value={email.toLowerCase()} // Ensures lowercase
                onChange={(e) => setEmail(e.target.value.toLowerCase())} // Converts input to lowercase
                placeholder="Email"
                className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100 flex-grow"
                disabled={isEmailVerified}
              />
              {!isEmailVerified && (
                <button
                  className="bg-orange/100 text-white px-4 py-3 rounded-md"
                  onClick={handleSendEmailVerification}
                  disabled={emailVerificationSent}
                >
                  {emailVerificationSent ? "Sent" : "Verify Email"}
                </button>
              )}
            </div>
            {isEmailVerified && <span className="text-green-600">✔ Email Verified</span>}
      
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Phone Number"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name (Optional)"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Address Line 1"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Address Line 2"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
      
            <select
              value={parish}
              onChange={handleParishChange}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            >
              <option value="">Select Parish</option>
              {parishes.map((parish, index) => (
                <option key={index} value={parish.name}>
                  {parish.name}
                </option>
              ))}
            </select>
      
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
              disabled={!parish} // Disable if no parish is selected
            >
              <option value="">Select Town</option>
              {townsList.map((town, index) => (
                <option key={index} value={town}>
                  {town}
                </option>
              ))}
            </select>
      
            <textarea
              value={servicePreferences}
              onChange={(e) => setServicePreferences(e.target.value)}
              placeholder="Service Preferences"
              className="px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange/100"
            />
      
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-sm">I accept the Terms & Conditions</span>
            </div>
      
            
          </div>
          <button
              className="bg-orange/100 w-full py-3 text-white rounded mt-6"
              onClick={handleEmailSignup}
            >
              Sign Up
            </button>
      
          {isEmailVerificationModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Enter Email Verification Code</h2>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Verification Code"
                  className="w-full px-4 py-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange/100"
                />
                <button
                  className="bg-orange/100 w-full py-3 text-white rounded"
                  onClick={handleVerifyEmail}
                >
                  Verify Email
                </button>
                <div className="mt-4 text-center">
                  {canResendEmail ? (
                    <button
                      className="text-orange/100 underline"
                      onClick={handleSendEmailVerification}
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span>Resend code in {resendEmailTimer} seconds</span>
                  )}
                </div>
              </div>
            </div>
          )}
      
          <div className="hidden flex items-center justify-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
      
          <button
            className=" hidden items-center justify-center w-full py-3 text-black mb-4 rounded border border-gray-300 hidden"
            onClick={handleGoogleSignup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="ml-2">Sign Up with Google</span>
          </button>
      
          <div className="mt-4 text-center">
            <span>Already have an account?</span>
            <a href="/login" className="text-orange/100 ml-2 underline">Login</a>
          </div>
      
          <ToastContainer />
        </div>
      </div>
      
    

    );
};

export default SignUp;
