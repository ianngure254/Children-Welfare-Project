import Volunteer from '../models/Volunteer.js';
import mongoose from 'mongoose';

// Get all volunteers
export const getVolunteers = async (req, res, next) => {
  try {
    const {
      status,
      areasOfInterest,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (areasOfInterest) {
      query.areasOfInterest = Array.isArray(areasOfInterest) 
        ? { $in: areasOfInterest } 
        : areasOfInterest;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const volunteers = await Volunteer.find(query)
      .populate('reviewedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignments.project', 'title')
      .populate('assignments.event', 'title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Volunteer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single volunteer
export const getVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID'
      });
    }

    const volunteer = await Volunteer.findById(id)
      .populate('reviewedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignments.project', 'title description')
      .populate('assignments.event', 'title description');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

// Create volunteer
export const createVolunteer = async (req, res, next) => {
  try {
    const volunteerData = {
      ...req.body,
      createdBy: req.user?.id
    };

    const volunteer = await Volunteer.create(volunteerData);

    await volunteer.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: volunteer
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
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
};

// Update volunteer
export const updateVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID'
      });
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Handle status changes
    if (req.body.status && req.body.status !== volunteer.status) {
      if (req.body.status === 'approved' || req.body.status === 'rejected') {
        volunteer.reviewedBy = req.user.id;
        volunteer.reviewedAt = new Date();
      }

      if (req.body.status === 'rejected' && req.body.rejectionReason) {
        volunteer.rejectionReason = req.body.rejectionReason;
      }
    }

    Object.assign(volunteer, req.body);
    await volunteer.save();

    await volunteer.populate('reviewedBy', 'firstName lastName email');
    await volunteer.populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Volunteer updated successfully',
      data: volunteer
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

// Assign volunteer to project/event
export const assignVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { project, event, role, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID'
      });
    }

    if (!project && !event) {
      return res.status(400).json({
        success: false,
        message: 'Either project or event must be specified'
      });
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    if (volunteer.status !== 'approved' && volunteer.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Volunteer must be approved or active to be assigned'
      });
    }

    const assignment = {
      project: project || null,
      event: event || null,
      role,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: 'assigned'
    };

    volunteer.assignments.push(assignment);
    if (volunteer.status === 'approved') {
      volunteer.status = 'active';
    }
    await volunteer.save();

    await volunteer.populate('assignments.project', 'title');
    await volunteer.populate('assignments.event', 'title');

    res.status(200).json({
      success: true,
      message: 'Volunteer assigned successfully',
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

// Delete volunteer
export const deleteVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID'
      });
    }

    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
