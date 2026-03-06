// src/pages/Admin/ProjectAdmin.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiActivity, FiCalendar, FiUser, FiDollarSign, FiTarget, FiMapPin } from 'react-icons/fi';
import { FaFolderOpen } from 'react-icons/fa';
import adminApi from '../../services/adminApi';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    location: '',
    targetAmount: 0,
    currentAmount: 0,
    teamMembers: [],
    images: [],
    isActive: true
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchProjects(true);
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

  // Fetch projects
  const fetchProjects = async (refresh = false) => {
    try {
      if (!refresh) setLoading(true);
      const data = await adminApi.getProjects();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setProjects(list);
      setLastUpdated(new Date().toISOString());
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search and status
  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(project =>
      !statusFilter || project.status === statusFilter
    );
  }, [projects, searchTerm, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const estimated = parseFloat(formData.targetAmount) || 0;
      const spent = parseFloat(formData.currentAmount) || 0;
      const stakeholders = formData.teamMembers
        .filter(m => m.trim() !== '')
        .map(name => ({ name: name.trim() }));

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        location: formData.location || undefined,
        budget: {
          estimated,
          spent
        },
        stakeholders,
        isPublic: formData.isActive
      };

      if (editingProject) {
        await adminApi.updateProject(editingProject._id, projectData);
      } else {
        await adminApi.createProject(projectData);
      }

      await fetchProjects();
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to save project');
    }
  };

  // Handle delete
  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setError('');
      try {
        await adminApi.deleteProject(projectId);
        await fetchProjects();
      } catch (err) {
        setError(err.message || 'Failed to delete project');
      }
    }
  };

  // Modal handlers
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'community',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        location: project.location || '',
        targetAmount: project.budget?.estimated || 0,
        currentAmount: project.budget?.spent || 0,
        teamMembers: (Array.isArray(project.stakeholders) ? project.stakeholders : [])
          .map(s => s?.name)
          .filter(Boolean),
        images: project.images || [],
        isActive: project.isPublic !== false
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        category: 'community',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        location: '',
        targetAmount: 0,
        currentAmount: 0,
        teamMembers: [],
        images: [],
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setError('');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle team members array
  const handleTeamMemberChange = (index, value) => {
    setFormData(prev => {
      const newTeamMembers = [...prev.teamMembers];
      newTeamMembers[index] = value;
      return { ...prev, teamMembers: newTeamMembers };
    });
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, '']
    }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const categories = ['infrastructure', 'academic', 'sports', 'technology', 'community', 'fundraising', 'other'];
  const statuses = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage community projects and initiatives</p>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
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
              <span className="text-gray-500 text-sm">
                Refreshes every 30 seconds
              </span>
            )}
            {lastUpdated && (
              <span className="text-gray-500 text-sm">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FiPlus size={20} />
          New Project
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{filteredProjects.length} of {projects.length} projects</span>
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
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => handleOpenModal(project)}
              onDelete={() => handleDelete(project._id)}
              getStatusColor={getStatusColor}
              getProgressPercentage={getProgressPercentage}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FaFolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria' : 'Get started by creating your first project'}
          </p>
          {!searchTerm && !statusFilter && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-all"
            >
              <FiPlus size={20} />
              New Project
            </button>
          )}
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <ProjectModal
          formData={formData}
          editingProject={editingProject}
          categories={categories}
          statuses={statuses}
          priorities={priorities}
          onInputChange={handleInputChange}
          onTeamMemberChange={handleTeamMemberChange}
          addTeamMember={addTeamMember}
          removeTeamMember={removeTeamMember}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          error={error}
        />
      )}
    </div>
  );
};

// Project Card Component
function ProjectCard({ project, onEdit, onDelete, getStatusColor, getProgressPercentage }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progressPercentage = getProgressPercentage(project.budget?.spent || 0, project.budget?.estimated || 0);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 truncate">{project.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {(project.status || 'planning').charAt(0).toUpperCase() + (project.status || 'planning').slice(1).replace(/[-_]/g, ' ')}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        {/* Progress Bar */}
        {project.budget?.estimated > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Fundraising Progress</span>
              <span>${project.budget?.spent || 0} / ${project.budget?.estimated || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progressPercentage.toFixed(1)}% funded
            </div>
          </div>
        )}
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FiTarget size={16} />
            <span className="capitalize">{project.category}</span>
          </div>
          {project.stakeholders && project.stakeholders.length > 0 && (
            <div className="flex items-center gap-2">
              <FiUser size={16} />
              <span>{project.stakeholders.length} team members</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-2">
              <FiMapPin size={16} />
              <span>{project.location}</span>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center gap-2">
              <FiCalendar size={16} />
              <span>Started: {formatDate(project.startDate)}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-xs text-gray-500 capitalize">{project.category}</span>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit project"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Delete project"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Modal Component
function ProjectModal({ 
  formData, 
  editingProject, 
  categories, 
  statuses, 
  priorities,
  onInputChange, 
  onTeamMemberChange, 
  addTeamMember, 
  removeTeamMember, 
  onSubmit, 
  onClose, 
  error 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={onInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Budget ($)
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={onInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spent Amount ($)
                </label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={onInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Members
              </label>
              <div className="space-y-2">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => onTeamMemberChange(index, e.target.value)}
                      placeholder="Enter team member name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Team Member
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={onInputChange}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Project is public
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProjectManagement;
