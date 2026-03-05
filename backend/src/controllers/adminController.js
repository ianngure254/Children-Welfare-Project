import Admin from '../models/Admin.js';
import mongoose from 'mongoose';
import { generateEmployeeId } from '../utils/helpers/numberGenerator.js';

/**
 * Register new admin (super_admin only)
 */
export const registerAdmin = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      permissions
    } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Generate employee ID
    const year = new Date().getFullYear();
    const count = await Admin.countDocuments({ department });
    const employeeId = generateEmployeeId(department, count);

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'admin',
      phone,
      department,
      employeeId,
      permissions: permissions || [],
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          employeeId: admin.employeeId,
          department: admin.department
        }
      }
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
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    next(error);
  }
};

/**
 * Admin login (alias for adminLogin from authController)
 * This is kept here for consistency with adminRoutes
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      // Increment login attempts
      if (admin) {
        admin.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (admin.loginAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }
        await admin.save();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (admin.isLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please try again later'
      });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Login successful. Use Firebase token for authenticated requests.',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          department: admin.department
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logout (mainly for logging/logging out of session)
 */
export const logoutAdmin = async (req, res, next) => {
  try {
    // Since we're using Firebase tokens, logout is handled client-side
    // This endpoint can be used for logging logout events
    if (req.user) {
      // You can log logout event here if needed
      console.log(`Admin ${req.user.email} logged out`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current admin profile
 */
export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admins
 */
export const getAdmins = async (req, res, next) => {
  try {
    const {
      role,
      department,
      isActive,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const admins = await Admin.find(query)
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Admin.countDocuments(query);

    res.status(200).json({
      success: true,
      data: admins,
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

/**
 * Get single admin
 */
export const getAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }

    const admin = await Admin.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Don't allow password update through this route
    const { password, ...updateData } = req.body;

    Object.assign(admin, updateData);
    await admin.save();

    const updatedAdmin = await Admin.findById(id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin
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

/**
 * Delete admin
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }

    // Prevent deleting yourself
    if (id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
