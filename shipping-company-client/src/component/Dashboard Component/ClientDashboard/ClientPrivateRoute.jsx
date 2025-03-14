import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";

const ClientPrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const newuser =  localStorage.getItem("user");
  // Show loading spinner until user info is fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("User Information", newuser);

  // Redirect to login if no user or if not a client
  if (!newuser) {
    console.log("User not found, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  

  return children;
};

export default ClientPrivateRoute;
