import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mailpilot_super_secure_jwt_secret_key_2026_x89q');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    if (user.membershipStatus === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your workspace membership has been rejected.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token.' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'unauthenticated'}' is not permitted to perform this action.`,
      });
    }
    next();
  };
};

export const requireTeam = (req, res, next) => {
  if (!req.user.teamId) {
    return res.status(400).json({
      success: false,
      message: 'User does not belong to any workspace. Please create or join a team first.',
    });
  }
  next();
};

