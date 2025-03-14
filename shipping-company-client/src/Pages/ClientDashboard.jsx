import { Outlet } from "react-router-dom";
import Sidebar from "../component/Dashboard Component/Sidebar";
import { useState } from "react";

const ClientDashboard = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen"> 
      {/* Sidebar */}
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />


      {/* Main Content */}
<div
  className={`flex-1 p-6 transition-all duration-300 min-w-0 ${
    isExpanded ? "md:ml-64" : "md:ml-20"
  }`}
>
  <Outlet />
</div>


      {/* Mobile Navigation (Always at the Bottom of the Screen) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sidebar mobileView />
      </div>
    </div>
  );
};

export default ClientDashboard;
