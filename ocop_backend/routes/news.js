const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getFeaturedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  unpublishNews,
  togglePinNews,
  getNewsStats
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/featured', getFeaturedNews);  // Phải đặt trước /:idOrSlug
router.get('/', getAllNews);
router.get('/:idOrSlug', getNewsById);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);
router.patch('/:id/publish', publishNews);
router.patch('/:id/unpublish', unpublishNews);
router.patch('/:id/pin', togglePinNews);
router.get('/admin/stats', getNewsStats);

module.exports = router;
