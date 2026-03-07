// src/services/adminApi.js
import { auth } from '../lib/firebase/config';
// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authorization headers with Firebase token
  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Generic request method with error handling
  async makeRequest(endpoint, options = {}) {
    const authHeaders = await this.getAuthHeaders();
    const config = {
      headers: {
        ...authHeaders,
        ...(options.headers || {})
      },
      ...options
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    if(!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const baseMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      const details = Array.isArray(errorData.errors) ? errorData.errors.join(' | ') : '';
      throw new Error(details ? `${baseMessage}: ${details}` : baseMessage);
    }
    
    return await response.json();
  }

  // GET request
  async get(endpoint) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // ========== DASHBOARD STATISTICS ==========
  async getDashboardStats() {
    try {
      // Fetch all data in parallel for better performance
      const [eventsRes, projectsRes, productsRes, usersRes] = await Promise.allSettled([
        this.get('/events'),
        this.get('/projects'),
        this.get('/products'),
        this.get('/users')
      ]);

      // Extract successful results (API returns { success, data, ... })
      const eventsPayload = eventsRes.status === 'fulfilled' ? eventsRes.value : null;
      const projectsPayload = projectsRes.status === 'fulfilled' ? projectsRes.value : null;
      const productsPayload = productsRes.status === 'fulfilled' ? productsRes.value : null;
      const usersPayload = usersRes.status === 'fulfilled' ? usersRes.value : null;

      const eventsArr = Array.isArray(eventsPayload?.data) ? eventsPayload.data : [];
      const projectsArr = Array.isArray(projectsPayload?.data) ? projectsPayload.data : [];
      const productsArr = Array.isArray(productsPayload?.data) ? productsPayload.data : [];

      return {
        eventsCount: eventsArr.length,
        projectsCount: projectsArr.length,
        productsCount: productsArr.length,
        usersCount: Array.isArray(usersPayload?.data) ? usersPayload.data.length : 0, // Users endpoint returns paginated data
        donationsTotal: 0, // TODO: Implement donations endpoint
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // ========== EVENTS MANAGEMENT ==========
  async getEvents() {
    return this.get('/events');
  }

  async createEvent(eventData) {
    return this.post('/events', eventData);
  }

  async updateEvent(id, eventData) {
    return this.put(`/events/${id}`, eventData);
  }

  async deleteEvent(id) {
    return this.delete(`/events/${id}`);
  }

  // ========== USERS MANAGEMENT ==========
  async getUsers(page = 1, limit = 10, role = '') {
    const params = new URLSearchParams({ page, limit });
    if (role) params.append('role', role);
    return this.get(`/users?${params}`);
  }

  async updateUserRole(userId, role) {
    return this.put(`/users/${userId}/role`, { role });
  }

  async updateUserStatus(userId, isActive) {
    return this.put(`/users/${userId}/status`, { isActive });
  }

  // ========== PROJECTS MANAGEMENT ==========
  async getProjects() {
    return this.get('/projects');
  }

  async createProject(projectData) {
    return this.post('/projects', projectData);
  }

  async updateProject(id, projectData) {
    return this.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }

  // ========== PRODUCTS MANAGEMENT ==========
  async getProducts() {
    return this.get('/products');
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }
}

// Create singleton instance
const adminApi = new AdminApiService();
export default adminApi;
