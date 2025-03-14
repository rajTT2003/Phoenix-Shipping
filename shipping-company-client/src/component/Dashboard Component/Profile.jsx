import React, { useState, useEffect } from "react";
import { User, Edit, Lock, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../../config"

export default function Profile() {
  const [user, setUser] = useState(null);
  const [field, setField] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParish, setSelectedParish] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [towns, setTowns] = useState([]);
  const [parishes] = useState([
    { name: 'Kingston', towns: ['Kingston', 'New Kingston', 'Half Way Tree', 'Papine', 'Cross Roads'] },
    { name: 'St. Andrew', towns: ['Constant Spring', 'Stony Hill', 'Red Hills', 'Mona', 'Havendale'] },
    { name: 'St. Thomas', towns: ['Morant Bay', 'Yallahs', 'Seaforth', 'Port Morant', 'Bath'] },
    { name: 'Portland', towns: ['Port Antonio', 'Buff Bay', 'Hope Bay', 'Manchioneal', 'Long Bay'] },
    { name: 'St. Mary', towns: ['Port Maria', 'Annotto Bay', 'Highgate', 'Oracabessa', 'Richmond'] },
    { name: 'St. Ann', towns: ['Ocho Rios', 'St. Ann’s Bay', 'Brown’s Town', 'Runaway Bay', 'Discovery Bay'] },
    { name: 'Trelawny', towns: ['Falmouth', 'Clark’s Town', 'Duncans', 'Wakefield', 'Albert Town'] },
    { name: 'St. James', towns: ['Montego Bay', 'Anchovy', 'Cambridge', 'Hopewell', 'Adelphi'] },
    { name: 'Hanover', towns: ['Lucea', 'Sandy Bay', 'Green Island', 'Hopewell', 'Cascade'] },
    { name: 'Westmoreland', towns: ['Savanna-la-Mar', 'Negril', 'Grange Hill', 'Bethel Town', 'Little London'] },
    { name: 'St. Elizabeth', towns: ['Black River', 'Santa Cruz', 'Junction', 'Balaclava', 'Malvern'] },
    { name: 'Manchester', towns: ['Mandeville', 'Christiana', 'Porus', 'Spaldings', 'Williamsfield'] },
    { name: 'Clarendon', towns: ['May Pen', 'Chapelton', 'Frankfield', 'Lionel Town', 'Rock River'] },
    { name: 'St. Catherine', towns: ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead', 'Ewarton'] }
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${config.API_BASE_URL}/api/user-info`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
  
        const data = await response.json();
        console.log("Fetched user data:", data); // Add this line to see the response
  
        // Split the address into addressLine1, addressLine2, parish, and town
        const addressParts = data.address ? data.address.split(",") : [];
        const addressLine1 = addressParts[0]?.trim() || "";
        const addressLine2 = addressParts[1]?.trim() || "";
        const town = addressParts[2]?.trim() || "";
        const parish = addressParts[3]?.trim() || "";
  
        // Set the user state and address fields
        setUser(data);
        setSelectedParish(parish);
        setSelectedTown(town);
        setTowns(parishes.find((parishObj) => parishObj.name === parish)?.towns || []);
        
        // Update the address fields
       // Update the address fields correctly in the state
setUser((prevUser) => ({
  ...prevUser,
  address1: addressLine1 || "",
  address2: addressLine2 || "",
  parish: parish || "",
  town: town || "",
}));

  
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, []);
  
  

  const handleEdit = (key) => {
    setField(key);
    setTempValue(user[key]);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
  
      // Combine address fields into a single address string for the backend
      const fullAddress = `${user.address1 || ""}, ${user.address2 || ""}, ${selectedTown || ""}, ${selectedParish || ""}`.trim();
  
      if (!fullAddress) {
        throw new Error("Address fields are incomplete.");
      }
  
      // Prepare the updated user data
      const updatedData = {
        [field]: tempValue,
        address: fullAddress,  // Send the combined address string
        companyName: user.companyName,  // Send other necessary data
        servicePreferences: user.servicePreferences,
      };
  
      console.log("Sending data to backend: ", updatedData); // Log the data to check
  
      const response = await fetch(`${config.API_BASE_URL}/api/user-info`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
  
      // Update the user state
      setUser((prevUser) => ({
        ...prevUser,
        [field]: tempValue,
      }));
  
      // Close the modal if everything is successful
      setShowModal(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(`Error saving profile data: ${error.message}`);
    }
  };
  
  
  
  
  
  

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE_URL}/api/user-info`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      alert("Profile deleted successfully");
      setUser(null);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleParishChange = (e) => {
    const selected = e.target.value;
    setSelectedParish(selected);
    const parish = parishes.find((parish) => parish.name === selected);
    setTowns(parish ? parish.towns : []);
    setSelectedTown("");
  };

  const handleTownChange = (e) => {
    setSelectedTown(e.target.value);
  };

  if (!user) {
    return <div>Loading...</div>;
  }


// Function to capitalize the first letter
const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:pb-6 pb-20 border border-gray-200 max-w-4xl mx-auto mt-6">
      <div className="relative w-full h-32 bg-gradient-to-r from-orange/100 to-teal-500 rounded-t-lg mb-12 flex items-center justify-center">
        <div className="absolute bottom-[-40px] w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-md">
          <User size={50} />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Profile</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {Object.keys(user).map(
    (key) =>
      key !== "email" &&
      key !== "clientId" && key !== "address" && (
        <div key={key} className="flex justify-between items-center border-b pb-2">
          <p className="text-gray-700">
            <strong>{capitalizeFirstLetter(key.replace(/([A-Z])/g, " $1").trim())}:</strong> {capitalizeFirstLetter(user[key])}
          </p>
          <button onClick={() => handleEdit(key)} className="text-orange/100 hover:text-orange/90">
            <Edit size={18} />
          </button>
        </div>
      )
  )}
  <div className="border-b pb-2">
    <p className="text-gray-700">
      <strong>Email:</strong> {user.email}
    </p>
  </div>
</div>


      {/* Save Button */}
      <button className=" hidden mt-6 w-full py-3 bg-orange/100 text-white rounded-lg shadow-md hover:bg-orange/90" onClick={handleSave}>
        Save Changes
      </button>

      <button className="mt-4 w-full py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 flex items-center justify-center" onClick={() => setShowDeleteModal(true)}>
        <Trash2 size={18} className="mr-2" />
        Delete Profile
      </button>

      {/* Edit Modal with Dropdowns */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit {field.replace(/([A-Z])/g, " $1").trim()}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {field === "parish" || field === "town" ? (
              <>
                {field === "parish" && (
                  <select
                    value={selectedParish}
                    onChange={handleParishChange}
                    className="w-full p-2 border rounded-lg mb-4"
                  >
                    <option value="">Select Parish</option>
                    {parishes.map((parish) => (
                      <option key={parish.name} value={parish.name}>
                        {parish.name}
                      </option>
                    ))}
                  </select>
                )}
                {field === "town" && (
                  <select
                    value={selectedTown}
                    onChange={handleTownChange}
                    className="w-full p-2 border rounded-lg mb-4"
                  >
                    <option value="">Select Town</option>
                    {towns.map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <input
                type="text"
                className="w-full p-2 border rounded-lg mb-4"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
            )}
            <button className="w-full bg-orange/100 text-white py-2 rounded-lg hover:bg-orange/90" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Are you sure you want to delete your profile?</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-4">
              <button className="w-1/2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={handleDeleteProfile}>
                Yes, Delete
              </button>
              <button className="w-1/2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
