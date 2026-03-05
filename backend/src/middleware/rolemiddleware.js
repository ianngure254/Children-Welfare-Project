const rolemiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    console.log(`🔍 Role check: user has role "${userRole}", allowed roles: [${allowedRoles.join(', ')}]`);

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      console.log(`❌ Access denied: role "${userRole}" not in allowed roles`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }

    console.log(`✅ Access granted: role "${userRole}" is authorized`);
    next();
  };
};

export default rolemiddleware;
