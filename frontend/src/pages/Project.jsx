import { useEffect, useState } from 'react';
import { IoSearchCircleSharp } from "react-icons/io5";
import School from "../assets/School.jpeg";
import Biogas from "../assets/Biogas.jpeg";
import Cake1 from "../assets/Cake1.jpeg";

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API}/projects?isPublic=true`);
        const payload = await res.json().catch(() => ({}));
        const list = Array.isArray(payload) ? payload : (payload?.data || []);
        setProjects(list);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'community', label: 'Community' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'other', label: 'Other' }
  ];

  const statusColors = {
    planning: "bg-gray-100 text-gray-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    on_hold: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    planning: "Planning",
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const categoryImages = {
    infrastructure: Biogas,
    academic: School,
    sports: School,
    technology: School,
    community: School,
    fundraising: Cake1,
    other: School
  };

  const calculateProgress = (project) => {
    if (typeof project.progress === 'number') return project.progress;
    if (Array.isArray(project.milestones) && project.milestones.length > 0) {
      const completed = project.milestones.filter(m => m.completed).length;
      return Math.round((completed / project.milestones.length) * 100);
    }
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 60;
    if (project.status === 'planning') return 15;
    if (project.status === 'on_hold') return 0;
    return 0;
  };

  const getProjectImage = (project) => {
    if (project.images?.length > 0 && project.images[0]?.url) return project.images[0].url;
    return categoryImages[project.category] || School;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory && project.status !== 'cancelled';
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming communities through targeted initiatives in education, infrastructure, empowerment, and welfare.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <IoSearchCircleSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project);
              return (
              <div key={project._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={getProjectImage(project)} 
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[project.status] || 'Planning'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    View Project
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found matching your search criteria.</p>
          </div>
        )}

        {/* Get Involved Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get Involved
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join us in making a difference. Your support helps us continue and expand these vital projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Volunteer
            </button>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
