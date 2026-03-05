// src/pages/Admin/Dashboard.jsx
import { useEffect, useState, useRef } from 'react';
import { FiCalendar, FiShoppingCart, FiUsers, FiDollarSign, FiPlus, FiRefreshCw, FiActivity, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { FaFolderOpen } from 'react-icons/fa'
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    eventsCount: 0,
    projectsCount: 0,
    productsCount: 0,
    usersCount: 0,
    donationsTotal: 0,
    lastUpdated: null,
  });
  const [previousStats, setPreviousStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const intervalRef = useRef(null);

  // Calculate trend indicators
  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 'neutral';
    const change = ((current - previous) / previous) * 100;
    if (change > 0) return { direction: 'up', percentage: Math.abs(change).toFixed(1) };
    if (change < 0) return { direction: 'down', percentage: Math.abs(change).toFixed(1) };
    return { direction: 'neutral', percentage: '0' };
  };

  // Fetch statistics from backend
  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setError('');
    } else {
      setLoading(true);
      setError('');
    }

    try {
      // Store previous stats for trend calculation
      setPreviousStats(prev => ({ ...prev, ...stats }));
      
      const statsData = await adminApi.getDashboardStats();
      setStats(statsData);
      
      // Add to recent activity
      const activity = {
        id: Date.now(),
        type: 'refresh',
        message: 'Dashboard statistics updated',
        timestamp: new Date().toISOString()
      };
      setRecentActivity(prev => [activity, ...prev.slice(0, 4)]);
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchStats(true);
      }, 30000); // Refresh every 30 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-blue-100">Manage events, projects, donations, and more for Body of Christ Centre.</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <FiActivity className="inline mr-1" size={14} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              {autoRefresh && (
                <span className="text-blue-200 text-sm">
                  Refreshes every 30 seconds
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 text-white p-2 rounded-lg transition-all"
              title="Refresh statistics"
            >
              <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {stats.lastUpdated && (
          <p className="text-blue-200 text-sm mt-2">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<FiCalendar size={28} />}
          label="Events"
          value={loading ? '...' : stats.eventsCount}
          color="bg-blue-500"
          trend={getTrend(stats.eventsCount, previousStats.eventsCount)}
        />
        <StatCard
          icon={<FaFolderOpen size={28} />}
          label="Projects"
          value={loading ? '...' : stats.projectsCount}
          color="bg-green-500"
          trend={getTrend(stats.projectsCount, previousStats.projectsCount)}
        />
        <StatCard
          icon={<FiShoppingCart size={28} />}
          label="Products"
          value={loading ? '...' : stats.productsCount}
          color="bg-yellow-500"
          trend={getTrend(stats.productsCount, previousStats.productsCount)}
        />
        <StatCard
          icon={<FiUsers size={28} />}
          label="Users"
          value={loading ? '...' : stats.usersCount}
          color="bg-purple-500"
          trend={getTrend(stats.usersCount, previousStats.usersCount)}
        />
        <StatCard
          icon={<FiDollarSign size={28} />}
          label="Donations"
          value={loading ? '...' : `$${stats.donationsTotal.toFixed(2)}`}
          color="bg-red-500"
          trend={getTrend(stats.donationsTotal, previousStats.donationsTotal)}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickActionButton
            to="/admin/events"
            icon={<FiPlus size={20} />}
            label="Create Event"
            color="blue"
          />
          <QuickActionButton
            to="/admin/projects"
            icon={<FiPlus size={20} />}
            label="Add Project"
            color="green"
          />
          <QuickActionButton
            to="/admin/store"
            icon={<FiPlus size={20} />}
            label="Add Product"
            color="yellow"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiActivity className="text-blue-600" size={16} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 text-sm">
          Use the navigation sidebar on the left to access different management sections. 
          Each section lets you create, view, edit, and delete content.
        </p>
      </div>
    </div>
  );
};

// StatCard Component: Displays a single statistic
function StatCard({ icon, label, value, color, trend }) {
  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <FiTrendingUp className="text-green-600" size={16} />;
      case 'down':
        return <FiTrendingDown className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className={`${color} text-white p-3 rounded-lg w-fit`}>
          {icon}
        </div>
        {trend && trend.direction !== 'neutral' && (
          <div className="flex items-center gap-1">
            {getTrendIcon(trend.direction)}
            <span className={`text-xs font-medium ${getTrendColor(trend.direction)}`}>
              {trend.percentage}%
            </span>
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

// QuickActionButton Component: Link button for common actions
function QuickActionButton({ to, icon, label, color }) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    red: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <Link
      to={to}
      className={`${colorClasses[color]} text-white flex items-center justify-center gap-2 py-3 rounded-lg transition-all font-semibold`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default Dashboard;
