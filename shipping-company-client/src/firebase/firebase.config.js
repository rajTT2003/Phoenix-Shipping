// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcvfjNgA0RjxcOEUbFRYF0e6jUElJfDks",
  authDomain: "salkey-shipping.firebaseapp.com",
  projectId: "salkey-shipping",
  storageBucket: "salkey-shipping.appspot.com",
  messagingSenderId: "485211534571",
  appId: "1:485211534571:web:3e0c2430e18cc64e1cfaae",
  measurementId: "G-C2W1TCC34Y"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export default firebaseApp; // Default export
