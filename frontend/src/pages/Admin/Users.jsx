// src/pages/Admin/Users.jsx
import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiTrash2, FiMail, FiShield, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import adminApi from '../../services/adminApi';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch users
  const fetchUsers = async (page = 1, role = '') => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(page, pagination.limit, role);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setPagination(prev => ({
        ...prev,
        page: response.pagination?.page || page,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, roleFilter);
  }, [pagination.page, roleFilter]);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      await fetchUsers(pagination.page, roleFilter);
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    }
  };

  // Handle user status toggle
  const handleStatusToggle = async (userId, isActive) => {
    try {
      await adminApi.updateUserStatus(userId, isActive);
      await fetchUsers(pagination.page, roleFilter);
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Note: You'll need to implement delete user in your backend API
        // await adminApi.deleteUser(userId);
        await fetchUsers(pagination.page, roleFilter);
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Modal handlers
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const roleOptions = ['user', 'student', 'parent', 'teacher', 'staff', 'admin'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} users
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{filteredUsers.length} results</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onRoleChange={handleRoleChange}
                      onStatusToggle={handleStatusToggle}
                      onDelete={handleDeleteUser}
                      onEdit={() => handleOpenModal(user)}
                      roleOptions={roleOptions}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No users have registered yet'
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
          onRoleChange={handleRoleChange}
          onStatusToggle={handleStatusToggle}
          roleOptions={roleOptions}
        />
      )}
    </div>
  );
};

// User Row Component
function UserRow({ user, onRoleChange, onStatusToggle, onDelete, onEdit, roleOptions }) {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleRoleChange = async (newRole) => {
    setIsChangingRole(true);
    try {
      await onRoleChange(user._id, newRole);
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsTogglingStatus(true);
    try {
      await onStatusToggle(user._id, !user.isActive);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            {user.firebaseUid && (
              <div className="text-xs text-gray-500">Firebase User</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center gap-2">
          <FiMail size={14} className="text-gray-400" />
          {user.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isChangingRole}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {roleOptions.map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleStatusToggle}
          disabled={isTogglingStatus}
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
            user.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View user details"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete user"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// User Details Modal Component
function UserDetailsModal({ user, onClose, onRoleChange, onStatusToggle, roleOptions }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole) => {
    setIsUpdating(true);
    try {
      await onRoleChange(user._id, newRole);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      await onStatusToggle(user._id, !user.isActive);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <FiShield size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900">{user.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900">{user.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Verified
                </label>
                <p className="text-gray-900">
                  {user.isEmailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Address */}
            {user.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">
                  {[
                    user.address.street,
                    user.address.city,
                    user.address.state,
                    user.address.zipCode,
                    user.address.country
                  ].filter(Boolean).join(', ') || 'N/A'}
                </p>
              </div>
            )}

            {/* Account Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <p className="text-sm text-gray-500">
                    {user.isActive ? 'User can access the application' : 'User account is disabled'}
                  </p>
                </div>
                <button
                  onClick={handleStatusToggle}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    user.isActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isUpdating ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Joined
                  </label>
                  <p className="text-gray-600">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-600">
                    {user.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersManagement;