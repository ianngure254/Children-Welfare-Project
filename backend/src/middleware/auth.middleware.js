import admin from '../config/firebase.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';


// console.log('ðŸ” Firebase ENV Check:');
// console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
// console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
// console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
// console.log('PRIVATE_KEY value:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));

/**
 * Protect route - Verify Firebase token and attach user to request
 * This middleware verifies the Firebase ID token and attaches the user/admin to req.user
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find user in database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // If not found in User, check Admin
    if (!user) {
      user = await Admin.findOne({ email: decodedToken.email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach full user object to request for more flexibility
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firebaseUid: decodedToken.uid,
      // Attach full user document for additional access if needed
      userDoc: user
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Restrict route access to specific roles
 * @param {...string} roles - Roles allowed to access the route
 * @returns {Function} - Express middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    // Check if user role is in allowed roles
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission (for Admin users)
 * @param {...string} permissions - Permissions required
 * @returns {Function} - Express middleware function
 */
export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userDoc = req.user.userDoc;

    // Check if user is admin and has permissions
    if (userDoc && userDoc.permissions) {
      const hasPermission = permissions.some(permission => 
        userDoc.permissions.includes(permission) || userDoc.role === 'super_admin'
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Required permission not granted'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin permissions required'
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} - Express middleware function
 */
export const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const resourceOwnerId = getResourceOwnerId(req);

    // Admin and super_admin can access any resource
    if (userRole === 'admin' || userRole === 'super_admin') {
      return next();
    }

    // Check if user owns the resource
    if (resourceOwnerId && resourceOwnerId.toString() === userId.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources'
    });
  };
};


// import User from '../models/User.js';
// import mongoose from 'mongoose';
// import admin from 'firebase-admin';

// // Initialize Firebase Admin if not already initialized
// if (!admin.apps.length) {
//   try {
//     const privateKey = process.env.FIREBASE_PRIVATE_KEY
//       ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '').replace(/^'|'$/g, '')
//       : undefined;

//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey
//       })
//     });
//     console.log('✅ Firebase Admin initialized');
//   } catch (error) {
//     console.error('❌ Firebase Admin initialization error:', error.message);
//   }
// }

// // ========== CREATE USER FROM FIREBASE (AUTO-SIGNUP) ==========
// export const createUserFromFirebase = async (req, res) => {
//   try {
//     console.log('📝 [createUserFromFirebase] Received request:', req.body);

//     const {
//       firebaseUid,
//       email,
//       firstName,
//       lastName,
//       role = 'student',
//       phone = '',
//       address = {},
//       profileImage = '',
//       isEmailVerified = true
//     } = req.body;

//     // Validate required fields
//     if (!firebaseUid || !email || !firstName || !lastName) {
//       console.warn('⚠️ [createUserFromFirebase] Missing required fields');
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: firebaseUid, email, firstName, lastName'
//       });
//     }

//     console.log(`🔍 [createUserFromFirebase] Checking if user exists: ${email}`);

//     // Check if user already exists
//     const existingUser = await User.findOne({
//       $or: [{ email: email.toLowerCase() }, { firebaseUid }]
//     });

//     if (existingUser) {
//       console.warn(`⚠️ [createUserFromFirebase] User already exists: ${email}`);
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email or Firebase UID'
//       });
//     }

//     console.log(`✅ [createUserFromFirebase] Creating new user: ${email}`);

//     // Create new user
//     const newUser = await User.create({
//       firebaseUid,
//       email: email.toLowerCase(),
//       firstName,
//       lastName,
//       role,
//       phone,
//       address: {
//         street: address.street || '',
//         city: address.city || '',
//         state: address.state || '',
//         zipCode: address.zipCode || '',
//         country: address.country || 'Kenya'
//       },
//       profileImage,
//       isEmailVerified,
//       isActive: true,
//       password: 'firebase-auth'
//     });

//     console.log(`✅ [createUserFromFirebase] User created: ${newUser._id}`);

//     return res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       data: {
//         id: newUser._id,
//         email: newUser.email,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         role: newUser.role,
//         firebaseUid: newUser.firebaseUid
//       }
//     });
//   } catch (error) {
//     console.error('❌ [createUserFromFirebase] Error:', error.message);

//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(e => e.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: messages
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email or Firebase UID already exists'
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Error creating user',
//       error: error.message
//     });
//   }
// };

// // Get user by ID
// export const getUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log(`🔍 [getUser] Fetching user: ${userId}`);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID format'
//       });
//     }

//     const user = await User.findById(userId).select(
//       'firstName lastName email role profileImage isActive'
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage,
//         isActive: user.isActive
//       }
//     });
//   } catch (error) {
//     console.error('❌ [getUser] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching user',
//       error: error.message
//     });
//   }
// };

// // Get user by email
// export const getUserByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;
//     console.log(`🔍 [getUserByEmail] Fetching user: ${email}`);

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required'
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select(
//       'firstName lastName email role profileImage isActive firebaseUid'
//     );

//     if (!user) {
//       console.warn(`⚠️ [getUserByEmail] User not found: ${email}`);
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     console.log(`✅ [getUserByEmail] User found: ${user.email}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage,
//         isActive: user.isActive,
//         firebaseUid: user.firebaseUid
//       }
//     });
//   } catch (error) {
//     console.error('❌ [getUserByEmail] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching user',
//       error: error.message
//     });
//   }
// };

// // Get user by Firebase UID
// export const getUserByFirebaseUid = async (req, res) => {
//   try {
//     const { firebaseUid } = req.params;
//     console.log(`🔍 [getUserByFirebaseUid] Fetching user: ${firebaseUid}`);

//     let user = await User.findOne({ firebaseUid }).select(
//       'firstName lastName email role profileImage isActive'
//     );

//     if (!user) {
//       console.warn(`⚠️ [getUserByFirebaseUid] User not found: ${firebaseUid}`);
//       return res.status(404).json({
//         success: false,
//         message: 'User not found with this Firebase UID'
//       });
//     }

//     console.log(`✅ [getUserByFirebaseUid] User found: ${user.email}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage,
//         isActive: user.isActive
//       }
//     });
//   } catch (error) {
//     console.error('❌ [getUserByFirebaseUid] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching user',
//       error: error.message
//     });
//   }
// };

// // Get all users (admin only)
// export const getAllUsers = async (req, res) => {
//   try {
//     console.log('🔍 [getAllUsers] Fetching all users');
//     const { page = 1, limit = 10, role } = req.query;

//     const query = {};
//     if (role) query.role = role;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const users = await User.find(query)
//       .select('firstName lastName email role isActive createdAt')
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort('-createdAt')
//       .lean();

//     const total = await User.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: users,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });
//   } catch (error) {
//     console.error('❌ [getAllUsers] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching users',
//       error: error.message
//     });
//   }
// };

// // Update user role (admin only)
// export const updateUserRole = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { role } = req.body;

//     console.log(`🔍 [updateUserRole] Updating user: ${userId}`);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID format'
//       });
//     }

//     const validRoles = ['user', 'student', 'parent', 'teacher', 'staff', 'admin'];
//     if (!role || !validRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { role },
//       { new: true, runValidators: true }
//     ).select('firstName lastName email role');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     console.log(`✅ [updateUserRole] Role updated for: ${user.email}`);

//     res.status(200).json({
//       success: true,
//       message: 'User role updated successfully',
//       data: user
//     });
//   } catch (error) {
//     console.error('❌ [updateUserRole] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error updating user role',
//       error: error.message
//     });
//   }
// };

// // Sync Firebase user into local DB
// export const syncFirebaseUser = async (req, res) => {
//   try {
//     console.log('[syncFirebaseUser] Starting sync process');
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.warn('⚠️ [syncFirebaseUser] No valid token');
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided or invalid format'
//       });
//     }

//     const token = authHeader.split(' ')[1];
//     console.log('[syncFirebaseUser] Verifying token');
    
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     console.log(`✅ [syncFirebaseUser] Token verified for: ${decodedToken.email}`);

//     if (!decodedToken.email) {
//       console.warn('⚠️ [syncFirebaseUser] No email in token');
//       return res.status(400).json({
//         success: false,
//         message: 'Email not available in Firebase token'
//       });
//     }

//     const email = decodedToken.email.toLowerCase();
//     console.log(`🔍 [syncFirebaseUser] Looking for user: ${email}`);
    
//     let user = await User.findOne({ email });

//     if (!user) {
//       console.log(`👤 [syncFirebaseUser] Creating new user: ${email}`);
      
//       const displayName = decodedToken.name || '';
//       const [firstNameRaw, ...rest] = displayName.trim().split(/\s+/);
//       const firstName = firstNameRaw || 'User';
//       const lastName = rest.join(' ') || '';

//       user = await User.create({
//         email,
//         firstName,
//         lastName,
//         role: 'student',
//         firebaseUid: decodedToken.uid,
//         isActive: true,
//         password: 'firebase-auth',
//         isEmailVerified: true
//       });
      
//       console.log(`✅ [syncFirebaseUser] New user created: ${user._id}`);
//     } else if (!user.firebaseUid) {
//       console.log(`🔄 [syncFirebaseUser] Updating firebaseUid`);
//       user.firebaseUid = decodedToken.uid;
//       await user.save();
//     } else {
//       console.log(`✅ [syncFirebaseUser] Existing user found: ${email}`);
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         id: user._id,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('❌ [syncFirebaseUser] Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error syncing user',
//       error: error.message
//     });
//   }
// };

