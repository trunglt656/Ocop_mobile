const Product = require('../models/Product');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const { AppError } = require('./error');

/**
 * Check if user has access to a specific shop
 * Admin can access any shop
 * Shop roles can only access their own shop
 */
const checkShopAccess = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      
      // Admin bypasses all shop-level checks
      if (user.role === 'admin' || user.role === 'moderator') {
        return next();
      }
      
      // Check if user has required shop role
      if (!requiredRoles.includes(user.role)) {
        throw new AppError('Insufficient permissions', 403);
      }
      
      // Check if user has shop affiliation
      if (!user.shop) {
        throw new AppError('No shop affiliation found', 403);
      }
      
      // Check shop ownership for shop-specific endpoints
      const resourceShopId = req.params.shopId || req.body.shop || req.query.shop;
      if (resourceShopId && resourceShopId.toString() !== user.shop.toString()) {
        throw new AppError('Can only access your own shop resources', 403);
      }
      
      // Attach shop to request for use in controller
      req.userShop = user.shop;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user owns or has access to a specific resource (product, order, etc.)
 */
const checkResourceOwnership = (Model, options = {}) => {
  return async (req, res, next) => {
    try {
      const { user, params } = req;
      const { allowAdmin = true, checkField = 'shop' } = options;
      
      // Admin bypasses ownership checks
      if (allowAdmin && user.role === 'admin') {
        return next();
      }
      
      const resourceId = params.id || params.productId || params.orderId;
      if (!resourceId) {
        throw new AppError('Resource ID is required', 400);
      }
      
      const resource = await Model.findById(resourceId);
      if (!resource) {
        throw new AppError('Resource not found', 404);
      }
      
      // Check shop ownership
      if (['shop_owner', 'shop_admin', 'shop_staff'].includes(user.role)) {
        if (!user.shop) {
          throw new AppError('No shop affiliation found', 403);
        }
        
        if (resource[checkField] && resource[checkField].toString() !== user.shop.toString()) {
          throw new AppError('Cannot access resources from other shops', 403);
        }
      }
      
      // Check user ownership for user-level resources
      if (user.role === 'user') {
        if (resource.user && resource.user.toString() !== user._id.toString()) {
          throw new AppError('Cannot access resources from other users', 403);
        }
      }
      
      // Attach resource to request
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has permission to perform specific action on resource
 * Based on permission matrix from PERMISSION_SYSTEM.md
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const { role, shop, _id } = req.user;
      
      // Permission matrix
      const permissions = {
        // Platform admin - full access
        admin: {
          products: ['create', 'read', 'update', 'delete', 'approve', 'verify_ocop'],
          orders: ['create', 'read', 'update', 'delete', 'cancel', 'refund'],
          users: ['create', 'read', 'update', 'delete', 'ban', 'assign_role'],
          shops: ['create', 'read', 'update', 'delete', 'approve', 'suspend'],
          categories: ['create', 'read', 'update', 'delete'],
          dashboard: ['view_all', 'export', 'analytics']
        },
        
        // Moderator - content approval
        moderator: {
          products: ['read', 'approve', 'verify_ocop', 'reject'],
          orders: ['read'],
          users: ['read'],
          shops: ['read', 'approve', 'verify_documents'],
          categories: ['read'],
          dashboard: ['view_moderation']
        },
        
        // Shop owner - manage own shop
        shop_owner: {
          products: ['create', 'read', 'update', 'delete', 'upload_certificate'],
          orders: ['read', 'update', 'cancel', 'fulfill'],
          users: ['read', 'invite_staff', 'remove_staff'],
          shops: ['read', 'update', 'manage_staff', 'view_analytics'],
          categories: ['read'],
          dashboard: ['view_shop', 'export_shop']
        },
        
        // Shop admin - manage products and orders
        shop_admin: {
          products: ['create', 'read', 'update', 'delete', 'upload_certificate'],
          orders: ['read', 'update', 'fulfill'],
          users: ['read'],
          shops: ['read'],
          categories: ['read'],
          dashboard: ['view_shop']
        },
        
        // Shop staff - basic operations
        shop_staff: {
          products: ['read', 'update_stock'],
          orders: ['read', 'update', 'fulfill'],
          users: ['read'],
          shops: ['read'],
          categories: ['read'],
          dashboard: []
        },
        
        // Regular user - shopping
        user: {
          products: ['read'],
          orders: ['create', 'read', 'cancel'],
          users: ['read', 'update'],
          shops: ['read'],
          categories: ['read'],
          dashboard: ['view_profile']
        }
      };
      
      const userPermissions = permissions[role];
      if (!userPermissions || !userPermissions[resource]) {
        throw new AppError('You do not have access to this resource', 403);
      }
      
      if (!userPermissions[resource].includes(action)) {
        throw new AppError(`You do not have permission to ${action} ${resource}`, 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if product belongs to user's shop
 * Used for product management endpoints
 */
const checkProductOwnership = async (req, res, next) => {
  try {
    const { user, params } = req;
    
    // Admin bypasses
    if (user.role === 'admin' || user.role === 'moderator') {
      return next();
    }
    
    const productId = params.id || params.productId;
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    // Check if product belongs to user's shop
    if (['shop_owner', 'shop_admin', 'shop_staff'].includes(user.role)) {
      if (!user.shop) {
        throw new AppError('No shop affiliation found', 403);
      }
      
      if (product.shop && product.shop.toString() !== user.shop.toString()) {
        throw new AppError('Can only manage products from your own shop', 403);
      }
    }
    
    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if order is accessible by user
 * Users see own orders
 * Shop roles see orders containing their products
 * Admin sees all orders
 */
const checkOrderAccess = async (req, res, next) => {
  try {
    const { user, params } = req;
    
    const orderId = params.id || params.orderId;
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }
    
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    // Admin sees everything
    if (user.role === 'admin') {
      req.order = order;
      return next();
    }
    
    // User can only see own orders
    if (user.role === 'user') {
      if (order.user.toString() !== user._id.toString()) {
        throw new AppError('Cannot access orders from other users', 403);
      }
      req.order = order;
      return next();
    }
    
    // Shop roles see orders with their products
    if (['shop_owner', 'shop_admin', 'shop_staff'].includes(user.role)) {
      if (!user.shop) {
        throw new AppError('No shop affiliation found', 403);
      }
      
      // Check if order contains products from user's shop
      const hasShopProducts = order.items.some(
        item => item.product && item.product.shop && 
                item.product.shop.toString() === user.shop.toString()
      );
      
      if (!hasShopProducts) {
        throw new AppError('No products from your shop in this order', 403);
      }
      
      req.order = order;
      return next();
    }
    
    throw new AppError('Insufficient permissions', 403);
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can manage shop (owner only or admin)
 */
const checkShopManagement = async (req, res, next) => {
  try {
    const { user, params } = req;
    
    // Admin can manage any shop
    if (user.role === 'admin' || user.role === 'moderator') {
      return next();
    }
    
    const shopId = params.shopId || params.id;
    if (!shopId) {
      throw new AppError('Shop ID is required', 400);
    }
    
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new AppError('Shop not found', 404);
    }
    
    // Only shop owner can manage their shop
    if (user.role === 'shop_owner') {
      if (shop.owner.toString() !== user._id.toString()) {
        throw new AppError('Only shop owner can manage this shop', 403);
      }
    } else {
      throw new AppError('Insufficient permissions', 403);
    }
    
    req.shop = shop;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OCOP certificate permission
 * Only admin and moderator can verify
 */
const canVerifyOCOP = (req, res, next) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return next(new AppError('Only admin and moderator can verify OCOP certificates', 403));
  }
  next();
};

/**
 * Check if action is allowed on order based on current status
 */
const checkOrderStatusTransition = (allowedStatuses) => {
  return (req, res, next) => {
    try {
      const { order } = req;
      const newStatus = req.body.status || req.body.orderStatus;
      
      if (!order) {
        throw new AppError('Order not found in request', 400);
      }
      
      // Check if current status allows the new status
      if (!allowedStatuses[order.orderStatus]) {
        throw new AppError(`Cannot modify order in ${order.orderStatus} status`, 400);
      }
      
      if (newStatus && !allowedStatuses[order.orderStatus].includes(newStatus)) {
        throw new AppError(
          `Cannot change order from ${order.orderStatus} to ${newStatus}`, 
          400
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if product status allows the action
 */
const checkProductStatusAction = (allowedStatuses) => {
  return (req, res, next) => {
    try {
      const { product } = req;
      
      if (!product) {
        throw new AppError('Product not found in request', 400);
      }
      
      if (!allowedStatuses.includes(product.status)) {
        throw new AppError(
          `Action not allowed for product in ${product.status} status`, 
          400
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Limit actions based on shop role hierarchy
 * owner > admin > staff
 */
const checkShopRoleHierarchy = (minimumRole) => {
  return (req, res, next) => {
    const roleHierarchy = {
      'shop_owner': 3,
      'shop_admin': 2,
      'shop_staff': 1
    };
    
    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;
    
    if (userRoleLevel < requiredLevel) {
      return next(new AppError(`Requires at least ${minimumRole} role`, 403));
    }
    
    next();
  };
};

module.exports = {
  checkShopAccess,
  checkResourceOwnership,
  checkPermission,
  checkProductOwnership,
  checkOrderAccess,
  checkShopManagement,
  canVerifyOCOP,
  checkOrderStatusTransition,
  checkProductStatusAction,
  checkShopRoleHierarchy
};
