import admin from '../config/firebase.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

// -----------------------------------------------
// FULL middleware — used on protected routes
// Requires user to already exist in MongoDB
// -----------------------------------------------
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find user in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.findOne({ email: decodedToken.email });
      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    if (!user) {
      user = await Admin.findOne({ email: decodedToken.email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please complete registration.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check Firebase custom claims for admin role
    let userRole = user.role;
    if (decodedToken.role === 'super_admin' || decodedToken.is_admin) {
      userRole = 'super_admin';
      if (user.role !== 'super_admin') {
        user.role = 'super_admin';
        await user.save();
      }
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: userRole,
      firebaseUid: decodedToken.uid,
      displayName: decodedToken.name || ''
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

// -----------------------------------------------
// SYNC middleware — used ONLY on /users/sync
// Allows users through even if not in MongoDB yet
// The sync controller will create them if needed
// -----------------------------------------------
export const verifyFirebaseTokenForSync = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Don't require user to exist in MongoDB
    // Just decode the token and attach Firebase info
    // The sync controller will handle creating/updating the user

    // Check if user exists (optional — just to get role if they do)
    let existingUser = await User.findOne({ 
      $or: [
        { firebaseUid: decodedToken.uid },
        { email: decodedToken.email }
      ]
    });

    if (!existingUser) {
      existingUser = await Admin.findOne({ email: decodedToken.email });
    }

    // Determine role from Firebase claims or existing record
    let userRole = existingUser?.role || 'user';
    if (decodedToken.role === 'super_admin' || decodedToken.is_admin) {
      userRole = 'super_admin';
    }

    // Attach decoded Firebase info to request
    // Controller uses this to create/update the user
    req.user = {
      id: existingUser?._id || null,
      email: decodedToken.email,
      role: userRole,
      firebaseUid: decodedToken.uid,
      displayName: decodedToken.name || ''
    };

    next();
  } catch (error) {
    console.error('Sync token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export default verifyFirebaseToken;
