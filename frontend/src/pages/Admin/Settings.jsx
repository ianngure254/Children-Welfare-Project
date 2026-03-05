// src/pages/Admin/Settings.jsx
import { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiRefreshCw, FiActivity, FiGlobe, FiMail, FiBell, FiLock, FiDatabase, FiUsers } from 'react-icons/fi';
import adminApi from '../../services/adminApi';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    site: {
      name: 'Body of Christ Centre',
      description: 'Welcome to our community church website',
      contactEmail: 'info@bodyofchrist.org',
      contactPhone: '+254-123-4567',
      address: '123 Church Street, Nairobi, Kenya',
      logo: '',
      favicon: ''
    },
    features: {
      enableDonations: true,
      enableEvents: true,
      enableProjects: true,
      enableStore: true,
      enableNewsletter: true,
      enableRegistration: true,
      requireEmailVerification: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      newEventAlert: true,
      newProjectAlert: true,
      donationAlert: true,
      newUserAlert: true
    },
    security: {
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedIPs: []
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'Site is currently under maintenance. Please check back later.',
      scheduledMaintenance: false,
      maintenanceStartTime: '',
      maintenanceEndTime: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings (mock implementation - in real app this would come from backend)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from your backend
        // const data = await adminApi.getSettings();
        // setSettings(data);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // In a real implementation, this would save to backend
      // await adminApi.updateSettings(settings);
      
      // Mock save for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastUpdated(new Date().toISOString());
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (section, field, checked) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FiGlobe /> },
    { id: 'features', label: 'Features', icon: <FiSettings /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'maintenance', label: 'Maintenance', icon: <FiDatabase /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings Management</h1>
          <p className="text-gray-600 mt-1">Configure your website and application settings</p>
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-3">
              <FiActivity className="text-gray-400" size={14} />
              <span className="text-gray-500 text-sm">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FiSave size={20} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralSettings
              settings={settings}
              onInputChange={handleInputChange}
            />
          )}
          
          {activeTab === 'features' && (
            <FeaturesSettings
              settings={settings}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsSettings
              settings={settings}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
          
          {activeTab === 'security' && (
            <SecuritySettings
              settings={settings}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
          
          {activeTab === 'maintenance' && (
            <MaintenanceSettings
              settings={settings}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// General Settings Component
function GeneralSettings({ settings, onInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={settings.site.name}
            onChange={(e) => onInputChange('site', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.site.contactEmail}
            onChange={(e) => onInputChange('site', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            value={settings.site.contactPhone}
            onChange={(e) => onInputChange('site', 'contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={settings.site.address}
            onChange={(e) => onInputChange('site', 'address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Description
        </label>
        <textarea
          value={settings.site.description}
          onChange={(e) => onInputChange('site', 'description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Features Settings Component
function FeaturesSettings({ settings, onCheckboxChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Feature Toggles</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Enable Donations</p>
            <p className="text-sm text-gray-600">Allow users to make donations through the website</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features.enableDonations}
              onChange={(e) => onCheckboxChange('features', 'enableDonations', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.features.enableDonations ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.features.enableDonations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Enable Events</p>
            <p className="text-sm text-gray-600">Show events and event registration</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features.enableEvents}
              onChange={(e) => onCheckboxChange('features', 'enableEvents', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.features.enableEvents ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.features.enableEvents ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Enable Projects</p>
            <p className="text-sm text-gray-600">Display community projects and initiatives</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features.enableProjects}
              onChange={(e) => onCheckboxChange('features', 'enableProjects', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.features.enableProjects ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.features.enableProjects ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Enable Store</p>
            <p className="text-sm text-gray-600">Activate e-commerce functionality</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features.enableStore}
              onChange={(e) => onCheckboxChange('features', 'enableStore', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.features.enableStore ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.features.enableStore ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Enable Newsletter</p>
            <p className="text-sm text-gray-600">Allow newsletter subscription</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features.enableNewsletter}
              onChange={(e) => onCheckboxChange('features', 'enableNewsletter', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.features.enableNewsletter ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.features.enableNewsletter ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Notifications Settings Component
function NotificationsSettings({ settings, onCheckboxChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 mb-2">Email Notifications</h4>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2">
              <FiMail size={16} />
              <span className="text-gray-700">Email Notifications</span>
            </span>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => onCheckboxChange('notifications', 'emailNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className="text-gray-700">New Event Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.newEventAlert}
              onChange={(e) => onCheckboxChange('notifications', 'newEventAlert', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className="text-gray-700">New Project Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.newProjectAlert}
              onChange={(e) => onCheckboxChange('notifications', 'newProjectAlert', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className="text-gray-700">Donation Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.donationAlert}
              onChange={(e) => onCheckboxChange('notifications', 'donationAlert', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 mb-2">SMS Notifications</h4>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className="text-gray-700">SMS Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => onCheckboxChange('notifications', 'smsNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings({ settings, onInputChange, onCheckboxChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => onInputChange('security', 'sessionTimeout', e.target.value)}
            min="5"
            max="480"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => onInputChange('security', 'maxLoginAttempts', e.target.value)}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Password Length
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => onInputChange('security', 'passwordMinLength', e.target.value)}
            min="6"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <span className="text-gray-700 mr-3">Require Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={settings.security.requireTwoFactor}
              onChange={(e) => onCheckboxChange('security', 'requireTwoFactor', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Allowed IP Addresses (one per line)
        </label>
        <textarea
          value={settings.security.allowedIPs.join('\n')}
          onChange={(e) => onInputChange('security', 'allowedIPs', e.target.value.split('\n'))}
          rows={4}
          placeholder="Enter IP addresses, one per line"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to allow all IP addresses
        </p>
      </div>
    </div>
  );
}

// Maintenance Settings Component
function MaintenanceSettings({ settings, onInputChange, onCheckboxChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Maintenance Mode</p>
            <p className="text-sm text-gray-600">Temporarily disable the website</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance.maintenanceMode}
              onChange={(e) => onCheckboxChange('maintenance', 'maintenanceMode', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.maintenance.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.maintenance.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </label>

        {settings.maintenance.maintenanceMode && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiBell className="text-yellow-600" size={20} />
              <span className="font-medium text-yellow-800">Warning: Maintenance mode is active</span>
            </div>
            <p className="text-yellow-700">
              Users will see the maintenance message and cannot access the site.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Message
          </label>
          <textarea
            value={settings.maintenance.maintenanceMessage}
            onChange={(e) => onInputChange('maintenance', 'maintenanceMessage', e.target.value)}
            rows={3}
            placeholder="Message to show users during maintenance"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="flex items-center">
            <span className="text-gray-700 mr-3">Scheduled Maintenance</span>
            <input
              type="checkbox"
              checked={settings.maintenance.scheduledMaintenance}
              onChange={(e) => onCheckboxChange('maintenance', 'scheduledMaintenance', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {settings.maintenance.scheduledMaintenance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={settings.maintenance.maintenanceStartTime}
              onChange={(e) => onInputChange('maintenance', 'maintenanceStartTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={settings.maintenance.maintenanceEndTime}
              onChange={(e) => onInputChange('maintenance', 'maintenanceEndTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsManagement;
