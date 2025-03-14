import { Menu, Package, History, User, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext'; // Import the useAuth hook

const Sidebar = ({ isExpanded, setIsExpanded, mobileView = false }) => {
  const { user, logout } = useAuth(); // Access user and logout function from context
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home (or login page) after logout
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  if (mobileView) {
    return <MobileNav handleLogout={handleLogout} />;
  }

  return (
    <div
      className={`hidden md:flex h-screen bg-gray-900 text-white p-4 fixed top-0 left-0 transition-all duration-300 shadow-lg flex-col ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header (Logo + Toggle Button) */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 ${isExpanded ? "w-full" : "justify-center"}`}>
          <h2
            className={`text-xl font-bold text-orange/100 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}
          >
            Phoenix Shipping
          </h2>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-300 hover:text-orange/80 transition">
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-4 flex-grow">
        <NavItem to="/client/dashboard" icon={<LayoutDashboard size={24} />} label="Dashboard" isExpanded={isExpanded} />
        <NavItem to="/client/track" icon={<Package size={24} />} label="Track Package" isExpanded={isExpanded} />
        <NavItem to="/client/profile" icon={<User size={24} />} label="Profile" isExpanded={isExpanded} />
      </ul>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 hover:text-white w-full text-left transition-all"
        >
          <LogOut size={24} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, isExpanded }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-lg transition-all ${
          isActive ? "bg-orange/80 text-white" : "hover:bg-orange/80 hover:text-white"
        }`
      }
    >
      {icon}
      {isExpanded && <span>{label}</span>}
    </NavLink>
  </li>
);

/* 🔹 Mobile Navigation (Always at the Bottom of the Screen) */
const MobileNav = ({ handleLogout }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg z-50">
      <div className="flex flex-col items-center">
        <NavLink to="/client/dashboard" className="flex flex-col items-center">
          <LayoutDashboard size={24} />
          <span className="text-xs">Dashboard</span>
        </NavLink>
      </div>
      <div className="flex flex-col items-center">
        <NavLink to="/client/track" className="flex flex-col items-center">
          <Package size={24} />
          <span className="text-xs">Track</span>
        </NavLink>
      </div>
      <div className="flex flex-col items-center">
        <NavLink to="/client/profile" className="flex flex-col items-center">
          <User size={24} />
          <span className="text-xs">Profile</span>
        </NavLink>
      </div>
      {/* Logout Button at the bottom */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-2 text-red-600 hover:text-white"
        >
          <LogOut size={24} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
