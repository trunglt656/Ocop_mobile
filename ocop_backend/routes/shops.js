const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { 
  checkShopManagement, 
  checkShopAccess,
  checkPermission 
} = require('../middleware/permissions');
const { 
  getShops, 
  getMyShop,
  getShop, 
  createShop, 
  updateShop, 
  registerShop,
  approveShop,
  addShopStaff,
  removeShopStaff,
  toggleShopStatus, 
  deleteShop,
  getShopDashboard,
  verifyShopDocument,
  uploadShopDocument
} = require('../controllers/shopController');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getShops);

// Get my shop (must be before /:id route to avoid conflict)
router.get('/my-shop', protect, getMyShop);

router.get('/:id', getShop);

// Shop registration (authenticated users)
router.post('/register', protect, registerShop);

// Protected routes
router.use(protect);

// Admin/Moderator - approve/reject shops
router.patch(
  '/:id/approve', 
  authorize('admin', 'moderator'),
  checkPermission('shops', 'approve'),
  approveShop
);

// Admin - manage shop status
router.patch(
  '/:id/status',
  authorize('admin'),
  toggleShopStatus
);

// Admin - delete shop
router.delete(
  '/:id',
  authorize('admin'),
  deleteShop
);

// Shop owner - update shop
router.put(
  '/:id',
  checkShopManagement,
  updateShop
);

// Shop owner - manage staff
router.post(
  '/:id/staff',
  authorize('shop_owner', 'admin'),
  checkShopManagement,
  addShopStaff
);

router.delete(
  '/:id/staff/:userId',
  authorize('shop_owner', 'admin'),
  checkShopManagement,
  removeShopStaff
);

// Shop dashboard - shop owner, admin, staff
router.get(
  '/:id/dashboard',
  authorize('shop_owner', 'shop_admin', 'shop_staff', 'admin'),
  checkShopAccess(['shop_owner', 'shop_admin', 'shop_staff']),
  getShopDashboard
);

// Document management
router.post(
  '/:id/documents',
  authorize('shop_owner', 'admin'),
  checkShopManagement,
  uploadShopDocument
);

router.patch(
  '/:id/verify-document',
  authorize('admin', 'moderator'),
  verifyShopDocument
);

module.exports = router;
