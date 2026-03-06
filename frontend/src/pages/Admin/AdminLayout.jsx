// src/pages/Admin/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiHome, FiCalendar, FiShoppingCart, FiUsers, FiSettings, FiDollarSign } from 'react-icons/fi';
import { FaFolderOpen } from 'react-icons/fa';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setToggleSidebar] = useState(true);
  const location = useLocation();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Router will redirect to /login automatically via ProtectedRoute
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Check if a nav link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-blue-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo/Title Section */}
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-blue-200 text-sm mt-1">Manage Site</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin"
            icon={<FiHome />}
            label="Dashboard"
            isActive={isActive('/admin')}
          />
          <NavLink
            to="/admin/events"
            icon={<FiCalendar />}
            label="Manage Events"
            isActive={isActive('/admin/events')}
          />
          <NavLink
            to="/admin/projects"
            icon={<FaFolderOpen />}
            label="Manage Projects"
            isActive={isActive('/admin/projects')}
          />
          <NavLink
            to="/admin/store"
            icon={<FiShoppingCart />}
            label="Manage Store"
            isActive={isActive('/admin/store')}
          />
          {/* Donations page not implemented yet - hide link until ready
          <NavLink
            to="/admin/donations"
            icon={<FiDollarSign />}
            label="Donations"
            isActive={isActive('/admin/donations')}
          />
          */}          <NavLink
            to="/admin/users"
            icon={<FiUsers />}
            label="Manage Users"
            isActive={isActive('/admin/users')}
          />
          <NavLink
            to="/admin/settings"
            icon={<FiSettings />}
            label="Settings"
            isActive={isActive('/admin/settings')}
          />
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-800 space-y-3">
          <div className="text-sm">
            <p className="text-blue-200">Logged in as:</p>
            <p className="font-semibold truncate">{currentUser?.displayName || currentUser?.email || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-all"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <button
            onClick={() => setToggleSidebar(!sidebarOpen)}
            className="text-gray-700 hover:text-blue-900 transition-all"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h2 className="text-xl font-bold text-gray-800">Body of Christ Centre - Admin Dashboard</h2>
          <div className="w-8" /> {/* Spacer for balance */}
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// NavLink Component: Reusable sidebar link
function NavLink({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-700 text-white font-semibold'
          : 'text-blue-100 hover:bg-blue-800'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default AdminLayout;
