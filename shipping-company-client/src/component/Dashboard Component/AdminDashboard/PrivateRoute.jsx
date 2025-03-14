import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Retrieve from localStorage and parse it
  const useradmin = JSON.parse(localStorage.getItem("adminuser") || "{}"); 
  const token = localStorage.getItem("admintoken");

  if (!useradmin || !token) return <Navigate to="/admin/sign-in" />;
  if (useradmin.role !== "adminuser") return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
