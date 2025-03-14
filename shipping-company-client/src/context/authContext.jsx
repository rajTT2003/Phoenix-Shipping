import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import firebaseApp from "../firebase/firebase.config"; // Ensure correct import
import config from "../config"
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        console.log("No token found, checking local storage...");
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            console.log("Loaded user from local storage:", storedUser);
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
          }
        }
        setLoading(false);
        return;
      }

      console.log("Fetching user info from API...");
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.log("Token invalid or expired. Logging out...");
          logout();
          return;
        }

        const data = await res.json();
        console.log("User info response:", data);

        if (data?.clientId) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          console.log("Invalid user data. Logging out...");
          logout();
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, firstName, lastName, phone, companyName, address, servicePreferences) => {
    setLoading(true);
    const auth = getAuth(firebaseApp);

    try {
        // Step 1: Insert user into MongoDB first
        const res = await fetch(`${config.API_BASE_URL}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, firstName, lastName, phone, companyName, address, servicePreferences }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Signup failed at database level");
        }

        try {
            // Step 2: Create Firebase user only if MongoDB insertion is successful
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Step 3: Store auth token and user details
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (firebaseError) {
            console.error("Firebase signup error:", firebaseError);

            // Step 4: Rollback MongoDB insertion if Firebase fails
            await fetch(`${config.API_BASE_URL}/api/auth/delete-user`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            throw new Error("Firebase signup failed, user removed from database.");
        }
    } catch (error) {
        console.error("Signup error:", error);
    } finally {
        setLoading(false);
    }
  };

  // Password reset function with OTP verification

const resetPassword = async (email, otp, newPassword) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  try {
    // Step 1: Reauthenticate user before updating password
    const credential = EmailAuthProvider.credential(user.email, email); // Provide the user's email and the password as the credential
    await reauthenticateWithCredential(user, credential);

    // Step 2: Proceed with Firebase password update
    await updatePassword(user, newPassword);

    // Step 3: Proceed with updating MongoDB if needed (already handled in your axios request)

    console.log("Password successfully updated in Firebase.");
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error("Firebase: " + error.message);
  }
};


  const logout = () => {
    console.log("Logging out user...");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context || { user: null, login: () => {}, googleLogin: () => {} };
};
