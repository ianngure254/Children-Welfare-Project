import Project from '../models/Project.js';
import mongoose from 'mongoose';

// Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const {
      category,
      status,
      isPublic,
      isFeatured,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Pagination validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment views atomically
    await Project.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };

    const project = await Project.create(projectData);

    await project.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ['title', 'description', 'category', 'status', 'priority', 
                         'startDate', 'endDate', 'location', 'budget', 'stakeholders', 'isPublic'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(project, updates);
    project.updatedBy = req.user.id;
    await project.save();

    await project.populate('createdBy', 'firstName lastName email');
    await project.populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
