import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admintoken");
    navigate("/admin/sign-in"); // Redirect to login page
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Desktop & Mobile */}
      <aside className={`w-64 bg-gray-900 text-white p-4 fixed h-full flex flex-col justify-between transition-all duration-300 md:relative z-10 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Admin Panel</h2>
            {/* Close button for mobile */}
            <button className="md:hidden" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav>
            <ul>
              <li><Link to="/admin/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link></li>
              <li><Link to="/admin/shipments" className="block p-2 hover:bg-gray-700 rounded">Shipments</Link></li>
              <li><Link to="/admin/users" className="block p-2 hover:bg-gray-700 rounded">Users</Link></li>
              <li><Link to="/admin/notifications" className="block p-2 hover:bg-gray-700 rounded">Notifications</Link></li>
              {/*<li><Link to="/admin/logs" className="block p-2 hover:bg-gray-700 rounded">Admin Logs</Link></li> */}
          </ul>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full p-3 mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 md:hidden z-40" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto w-full">
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 bg-gray-900 text-white rounded mb-4" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>

        <Outlet />
      </div>
    </div>
  );
}
