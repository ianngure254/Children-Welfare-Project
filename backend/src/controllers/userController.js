import User from '../models/User.js';
import mongoose from 'mongoose';
import admin from '../config/firebase.js';

export const createUserFromFirebase = async (req, res) => {
  try {
    const { firebaseUid, email, firstName, lastName, role = 'user' } = req.body;

    if (!firebaseUid || !email || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { firebaseUid }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = await User.create({
      firebaseUid,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      phone: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'Kenya' },
      profileImage: '',
      isEmailVerified: true,
      isActive: true,
      password: 'firebase-auth'
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, role: newUser.role }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const user = await User.findById(userId).select('firstName lastName email role profileImage isActive');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, profileImage: user.profileImage, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('firstName lastName email role profileImage isActive firebaseUid');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, profileImage: user.profileImage, isActive: user.isActive, firebaseUid: user.firebaseUid }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

export const getUserByFirebaseUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({ firebaseUid }).select('firstName lastName email role profileImage isActive');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, profileImage: user.profileImage, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = {};
    if (role) query.role = role;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).select('firstName lastName email role isActive createdAt').skip(skip).limit(parseInt(limit)).sort('-createdAt').lean();
    const total = await User.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const validRoles = ['user', 'student', 'parent', 'teacher', 'staff', 'admin', 'super_admin', 'moderator'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role` });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select('firstName lastName email role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error updating role', error: error.message });
  }
};

export const syncFirebaseUser = async (req, res) => {
  try {
    // Token already verified by verifyFirebaseToken middleware
    const user = req.user;
    const email = user.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    // Use role from middleware (already processed Firebase claims)
    let userRole = user.role || 'user';
    if (user.role === 'super_admin' || user.role === 'admin') {
      console.log(`🔐 Admin user detected: ${email} with role: ${user.role}`);
    }
    
    let userRecord = await User.findOne({ email });

    if (!userRecord) {
      // Create new user if not found
      const displayName = 'System Administrator'; // Default for admin
      const [firstNameRaw, ...rest] = displayName.trim().split(/\s+/);
      const firstName = firstNameRaw || 'User';
      const lastName = rest.join(' ') || '';

      userRecord = await User.create({
        email,
        firstName,
        lastName,
        role: userRole, // Use role from middleware
        firebaseUid: user.firebaseUid,
        isActive: true,
        password: 'firebase-auth',
        isEmailVerified: true
      });
      
      console.log(`✅ Created user with role: ${userRole}`);
    } else {
      // Update existing user role if different
      if (!userRecord.firebaseUid) {
        userRecord.firebaseUid = user.firebaseUid;
      }
      if (userRecord.role !== userRole) {
        userRecord.role = userRole;
        console.log(`🔄 Updated user role to: ${userRole}`);
      }
      await userRecord.save();
    }

    return res.status(200).json({
      success: true,
      data: { id: userRecord._id, email: userRecord.email, role: userRecord.role }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error syncing user', error: error.message });
  }
};
