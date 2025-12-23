const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập chức năng này. Yêu cầu vai trò: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể truy cập tài nguyên của chính mình'
    });
  }
};

// Check if user is shop owner/admin and owns the shop
const checkShopOwnership = (shopFieldName = 'shop') => {
  return async (req, res, next) => {
    try {
      // Admin has access to everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Shop owner or shop admin must have shop affiliation
      if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin') {
        if (!req.user.shop) {
          return res.status(403).json({
            success: false,
            message: 'Tài khoản shop chưa được gán shop'
          });
        }

        // Check shop ID from params, body, or query
        const shopId = req.params[shopFieldName] || 
                      req.body[shopFieldName] || 
                      req.query[shopFieldName];

        if (shopId && shopId !== req.user.shop.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Bạn chỉ có thể quản lý shop của mình'
          });
        }

        // Attach shop to request for use in controller
        req.userShop = req.user.shop;
        return next();
      }

      // Other roles not authorized
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền sở hữu shop'
      });
    }
  };
};

// Check if user can modify resource (owner, shop admin of shop, or platform admin)
const canModifyResource = (resourceModel) => {
  return async (req, res, next) => {
    try {
      // Platform admin can modify anything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // Load the resource model dynamically
      const Model = require(`../models/${resourceModel}`);
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceModel} not found`
        });
      }

      // Check if user created the resource
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        return next();
      }

      // Check if shop owner/admin owns the shop that owns this resource
      if ((req.user.role === 'shop_owner' || req.user.role === 'shop_admin') && resource.shop) {
        if (resource.shop.toString() === req.user.shop.toString()) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tài nguyên này'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền'
      });
    }
  };
};

// Check permissions based on action and resource
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    // Define permissions matrix
    const permissions = {
      admin: {
        products: ['create', 'read', 'update', 'delete', 'publish'],
        orders: ['create', 'read', 'update', 'delete', 'cancel', 'refund'],
        users: ['create', 'read', 'update', 'delete', 'ban'],
        shops: ['create', 'read', 'update', 'delete', 'approve'],
        categories: ['create', 'read', 'update', 'delete'],
        dashboard: ['view', 'export']
      },
      shop_owner: {
        products: ['create', 'read', 'update', 'delete'], // Only own shop products
        orders: ['read', 'update'], // Only orders related to shop
        users: [], // No user management
        shops: ['read', 'update'], // Only own shop
        categories: ['read'],
        dashboard: ['view'] // Only own shop dashboard
      },
      shop_admin: {
        products: ['create', 'read', 'update', 'delete'], // Only own shop products
        orders: ['read', 'update'], // Only orders related to shop
        users: [], // No user management
        shops: ['read', 'update'], // Only own shop
        categories: ['read'],
        dashboard: ['view'] // Only own shop dashboard
      },
      user: {
        products: ['read'],
        orders: ['create', 'read', 'cancel'], // Only own orders
        users: ['read', 'update'], // Only own profile
        shops: ['read'],
        categories: ['read'],
        dashboard: []
      }
    };

    const userPermissions = permissions[userRole];
    if (!userPermissions || !userPermissions[resource]) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    if (!userPermissions[resource].includes(action)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền ${action} cho ${resource}`
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Optional authentication - for routes that work with or without auth
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  authorize,
  ownerOrAdmin,
  optionalAuth,
  checkShopOwnership,
  canModifyResource,
  checkPermission
};
