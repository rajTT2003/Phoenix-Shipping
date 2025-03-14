import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import config from "../../../config"

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "User",
    status: "Active",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); // Adjust the number of users per page

  // Fetch users from the backend
  useEffect(() => {
    fetch(`${config.API_BASE_URL}/admin/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch users");
        setLoading(false);
      });
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Open Add/Edit Modal
  const openModal = (user = null) => {
    setEditMode(!!user);
    setModalOpen(true);
    setCurrentUser(user);
    setUserData(
      user || {
        name: "",
        email: "",
        role: "User",
        status: "Active",
      }
    );
  };

  // Close Modal
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setUserData({
      name: "",
      email: "",
      role: "User",
      status: "Active",
    });
  };

  // Add or Update User
  const handleSaveUser = async () => {
    if (!userData.name || !userData.email) {
      alert("Name and Email are required!");
      return;
    }

    const url = editMode
      ? `${config.API_BASE_URL}/admin/users/${currentUser._id}`
      : `${config.API_BASE_URL}/admin/users`;

    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save user");

      const updatedUser = await response.json();

      if (editMode) {
        setUsers(users.map((u) => (u._id === currentUser._id ? updatedUser : u)));
      } else {
        setUsers([...users, updatedUser]);
      }

      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter users based on search
  const filteredUsers = Array.isArray(users)
  ? users.filter((user) =>
      (user?.firstName?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      user?.lastName?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      user?.clientId?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      user?.email?.toLowerCase().includes((searchQuery || "").toLowerCase()))
  )
  : [];

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Search Bar */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search user..."
          className="border p-2 rounded w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FaSearch className="ml-2 text-gray-500" />
      </div>

      {/* Add User Button */}
      <button
        className="bg-orange/100 text-white px-4 py-2 rounded flex items-center mb-4"
        onClick={() => openModal()}
      >
        <FaPlus className="mr-2" /> Add User
      </button>

      {/* Users List */}
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-white">
                <th className="p-3">Client ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">First Name</th>
                <th className="p-3">Last Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
           {/*     <th className="p-3">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-3">{user.clientId}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.firstName}</td>
                  <td className="p-3">{user.lastName}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">{user.role}</td>
               {/*    <td className="p-3 flex space-x-2">
                    <button className="text-orange/100" onClick={() => openModal(user)}>
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <FaTrash />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Previous
        </button>
        <div className="flex space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-orange/100" : "bg-gray-200"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>

      {/* Modal for Adding/Editing User */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">{editMode ? "Edit" : "Add"} User</h2>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="border p-2 rounded w-full mb-2"
            />
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <select
              name="status"
              value={userData.status}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button className="bg-gray-400 px-4 py-2 rounded" onClick={closeModal}>Cancel</button>
              <button
                className="bg-orange/100 text-white px-4 py-2 rounded"
                onClick={handleSaveUser}
              >
                {editMode ? "Update" : "Add"} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
