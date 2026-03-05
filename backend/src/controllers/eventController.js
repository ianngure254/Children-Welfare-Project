import Event from '../models/Event.js';
import mongoose from 'mongoose';

// Get all events
export const getEvents = async (req, res, next) => {
  try {
    const {
      category,
      status,
      isPublic,
      isFeatured,
      upcoming,
      search,
      page = 1,
      limit = 10,
      sort = '-startDate'
    } = req.query;

    // Pagination validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
      query.status = 'published';
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
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

// Get single event
export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views atomically
    await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// Create event
export const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = await Event.create(eventData);

    await event.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
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

// Update event
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    Object.assign(event, req.body);
    event.updatedBy = req.user.id;
    await event.save();

    await event.populate('createdBy', 'firstName lastName email');
    await event.populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
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

// Delete event
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Register for event
export const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.registration.required) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not required for this event'
      });
    }

    if (!event.isRegistrationOpen) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }

    if (event.registration.maxAttendees && 
        event.registration.currentAttendees >= event.registration.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    event.registration.currentAttendees += 1;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        availableSpots: event.availableSpots,
        currentAttendees: event.registration.currentAttendees
      }
    });
  } catch (error) {
    next(error);
  }
};
