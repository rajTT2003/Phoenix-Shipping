import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import config from "../../../config";
import Loader from "../../Loader";
import { createUserWithEmailAndPassword, signInWithPopup, getAuth, GoogleAuthProvider } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import firebaseApp from '../../../firebase/firebase.config';
import { useAuth } from '../../../context/authContext';

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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isPhoneVerified: false,
    isEmailVerified: true,
    addressLine1: "",
    addressLine2: "",
    parish: "",
    town: "",
    role: "client",
    password: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRes = await fetch(`${config.API_BASE_URL}/admin/users`);
        const data = await usersRes.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);



  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleParishChange = (e) => {
    const selectedParish = e.target.value;
    setUserData({ ...userData, parish: selectedParish, town: "" });
  };

  const handleTownChange = (e) => {
    setUserData({ ...userData, town: e.target.value });
  };

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { addressLine1: "", addressLine2: "", town: "", parish: "" };

    const parts = fullAddress.split(",").map((p) => p.trim());
    return {
      addressLine1: parts[0] || "",
      addressLine2: parts[1] || "",
      town: parts[2] || "",
      parish: parts[3] || "",
    };
  };

  const openModal = (user = null) => {
    setEditMode(!!user);
    setModalOpen(true);

    if (user) {
      // Populate user data when editing
      const { addressLine1, addressLine2, town, parish } = parseAddress(user.address);
      setUserData({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        addressLine1,
        addressLine2,
        town,
        parish,
        role: user.role || "client",
        password: "", // Clear password when editing
      });
    } else {
      // Reset form when creating a new user
      setUserData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        town: "",
        parish: "",
        role: "client",
        password: "", // Clear password when creating
      });
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      town: "",
      parish: "",
      role: "client",
      password: "",
    });
  };

 
  const handleSaveUser = async () => {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.parish || !userData.town) {
      toast.error("First Name, Last Name, Email, Parish, and Town are required!");
      return;
    }
  
    const fullAddress = `${userData.addressLine1}, ${userData.addressLine2}, ${userData.town}, ${userData.parish}`
      .trim()
      .replace(/,\s*,/g, ","); // Cleanup extra commas
  
    const url = editMode
      ? `${config.API_BASE_URL}/admin/users/${userData._id}`
      : `${config.API_BASE_URL}/admin/users`;
  
    const method = editMode ? "PUT" : "POST";
  
    try {
      const auth = getAuth(firebaseApp);
      let firebaseUser = null;
  
      // If creating a new user, check if user already exists in Firebase
      if (!editMode) {
        try {
          const existingUser = await fetch(`${config.API_BASE_URL}/admin/users/email/${userData.email}`);
          const userExists = await existingUser.json();
  
          if (userExists && userExists._id) {
            toast.error("User already exists. Cannot create user.");
            return;
          }
  
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          firebaseUser = userCredential.user;
        } catch (firebaseError) {
          toast.error(`Firebase Error: ${firebaseError.message}`);
          return;
        }
      }
  
      // Prepare request body for MongoDB
      const body = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        isEmailVerified: true,
        isPhoneVerified: false,
        address: fullAddress,
        role: userData.role,
        password: userData.password ? userData.password : undefined, // Only send password if present
        firebaseUid: firebaseUser ? firebaseUser.uid : undefined,
      };
  
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        if (firebaseUser) {
          await firebaseUser.delete(); // Rollback Firebase if MongoDB fails
          toast.error("User creation failed. Firebase account rolled back.");
        }
        throw new Error("Failed to save user in database");
      }
  
      const updatedUser = await response.json();
  
      if (editMode) {
        setUsers(users.map((u) => (u._id === userData._id ? updatedUser : u)));
      } else {
        setUsers([...users, updatedUser]);
      }
  
      toast.success(editMode ? "User updated successfully!" : "User added successfully!");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      const userResponse = await fetch(`${config.API_BASE_URL}/admin/users/${userId}`);
      const user = await userResponse.json();
  
      
  
      // Proceed with deletion
      const deleteResponse = await fetch(`${config.API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
      });
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete user.");
      }
  
      toast.success("User deleted successfully!");
      setUsers(users.filter((u) => u._id !== userId));
      closeModal();
    } catch (err) {
      toast.error("Error deleting user: " + err.message);
    }
  };
  
  
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.phone}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <button className="bg-orange/100 text-white px-4 py-2 rounded mb-4" onClick={() => openModal()}>
        Add User
      </button>

         {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Client ID</th>
              <th className="p-3">First Name</th>
              <th className="p-3">Last Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-3">{user.clientId}</td>
                  <td className="p-3">{user.firstName}</td>
                  <td className="p-3">{user.lastName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3 space-x-2">
                    <button className="text-orange" onClick={() => openModal(user)}>
                      <FaEdit/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-3">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

{modalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-4">{editMode ? "Edit" : "Add"} User</h2>

      {/* First Name and Last Name */}
      <input
        type="text"
        name="firstName"
        value={userData.firstName}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="First Name"
      />
      <input
        type="text"
        name="lastName"
        value={userData.lastName}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="Last Name"
      />

      {/* Password Field (only when adding a user) */}
      {!editMode && (
        <input
          type="password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-2"
          placeholder="Password"
        />
      )}

      {/* Parish Dropdown */}
      <select
        name="parish"
        value={userData.parish}
        onChange={handleParishChange}
        className="border p-2 rounded w-full mb-2"
      >
        <option value="">Select Parish</option>
        {parishes.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Town Dropdown */}
      {userData.parish && (
        <select
          name="town"
          value={userData.town}
          onChange={handleTownChange}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="">Select Town</option>
          {parishes
            .find((p) => p.name === userData.parish)
            .towns.map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
        </select>
      )}

      {/* Address Lines */}
      <input
        type="text"
        name="addressLine1"
        value={userData.addressLine1}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="Address Line 1"
      />
      <input
        type="text"
        name="addressLine2"
        value={userData.addressLine2}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="Address Line 2"
      />

      {/* Email and Phone */}
      <input
        type="email"
        name="email"
        value={userData.email}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="Email"
      />
      <input
        type="text"
        name="phone"
        value={userData.phone}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
        placeholder="Phone"
      />

      {/* Save & Delete Buttons */}
      <div className="flex space-x-2">
        <button className="bg-green text-white px-4 py-2 rounded" onClick={handleSaveUser}>
          Save
        </button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={closeModal}>
          Cancel
        </button>
        {editMode && (
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleDeleteUser(userData._id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
