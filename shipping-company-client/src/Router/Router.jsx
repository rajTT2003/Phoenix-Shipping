import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../Pages/Home";
import Login from "../component/Login";
import SignUp from "../Pages/SignUp";
import ClientDashboard from "../Pages/ClientDashboard";
import Tracking from "../component/Dashboard Component/ClientDashboard/Track Package/Tracking";
import PackageDetails from "../component/Dashboard Component/ClientDashboard/Track Package/PackageInfo";
import Profile from "../component/Dashboard Component/Profile";
import CompleteProfile from "../Pages/CompleteProfile";
import Dashboard from "../component/Dashboard Component/ClientDashboard/Dashboard/Dashboard";
import AdminLayout from "../Pages/AdminLayout";
import SignIn from "../component/Dashboard Component/AdminDashboard/AdminSignIn";
import PrivateRoute from "../component/Dashboard Component/AdminDashboard/PrivateRoute";
import ShipmentManagement from "../component/Dashboard Component/AdminDashboard/ShipmentManagement/ShipmentManagement";
import UserManagement from "../component/Dashboard Component/AdminDashboard/UserManagement";
import NotificationManagement from "../component/Dashboard Component/AdminDashboard/NotificationManagement";
import AdminLogs from "../component/Dashboard Component/AdminDashboard/AdminLogs";
import DashboardOverview from "../component/Dashboard Component/AdminDashboard/DashboardOverview";
import PackageCalculator from "../component/PackageCalculator";
import ContactUs from "../component/ContactUs";
import ClientPrivateRoute from "../component/Dashboard Component/ClientDashboard/ClientPrivateRoute";
import PasswordRecoveryFlow from "../component/ForgotPassword/PasswordRecoveryFlow"

const apiUrl = 'https://jamjob.onrender.com';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/package-calculator", element: <PackageCalculator /> },
      { path: "/contact", element: <ContactUs /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/complete-profile", element: <CompleteProfile /> },
  { path: "/reset-password", element: <PasswordRecoveryFlow/>},
  // ✅ Client Dashboard
  {
    path: "/client",
    element: <ClientPrivateRoute><ClientDashboard /></ClientPrivateRoute>,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "track", element: <Tracking /> },
      { path: "profile", element: <Profile /> },
      { path: "package-details/:trackingNumber", element: <PackageDetails /> },
   
    ],
  },

  // ✅ Admin Panel
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "sign-in", element: <SignIn /> },
      { path: "dashboard", element: <PrivateRoute><DashboardOverview /></PrivateRoute> },
      { path: "shipments", element: <PrivateRoute><ShipmentManagement /></PrivateRoute> },
      { path: "users", element: <PrivateRoute><UserManagement /></PrivateRoute> },
      { path: "notifications", element: <PrivateRoute><NotificationManagement /></PrivateRoute> },
      { path: "logs", element: <PrivateRoute><AdminLogs /></PrivateRoute> },
    ],
  },
]);

export default router;
