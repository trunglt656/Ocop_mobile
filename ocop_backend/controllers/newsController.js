const News = require('../models/News');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get all news (public or admin)
// @route   GET /api/news
// @access  Public
const getAllNews = asyncHandler(async (req, res) => {
  const { category, status, search, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  
  // For non-admin users, only show published news
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'published';
  } else if (status) {
    query.status = status;
  }
  
  if (category) {
    query.category = category;
  }
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }
  
  const skip = (page - 1) * limit;
  
  // Execute query with pagination
  const news = await News.find(query)
    .populate('author', 'name email avatar')
    .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await News.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      news,
      count: news.length,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    }
  });
});

// @desc    Get featured news
// @route   GET /api/news/featured
// @access  Public
const getFeaturedNews = asyncHandler(async (req, res) => {
  const news = await News.find({ status: 'published', isPinned: true })
    .populate('author', 'name email avatar')
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(3);
  
  res.status(200).json({
    success: true,
    data: {
      news,
      count: news.length,
      totalCount: news.length,
      totalPages: 1,
      currentPage: 1
    }
  });
});

// @desc    Get single news by ID or slug
// @route   GET /api/news/:idOrSlug
// @access  Public
const getNewsById = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  
  // Try to find by ID first, then by slug
  let news = await News.findById(idOrSlug).populate('author', 'name email avatar');
  
  if (!news) {
    news = await News.findOne({ slug: idOrSlug }).populate('author', 'name email avatar');
  }
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  // Only allow viewing published news for non-admin
  if (news.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
    throw new AppError('Tin tức không khả dụng', 403);
  }
  
  // Increment view count
  news.viewCount += 1;
  await news.save();
  
  res.status(200).json({
    success: true,
    data: news
  });
});

// @desc    Create news (Admin only)
// @route   POST /api/admin/news
// @access  Private (Admin)
const createNews = asyncHandler(async (req, res) => {
  // Add author from authenticated user
  req.body.author = req.user._id;
  
  const news = await News.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Tạo tin tức thành công',
    data: news
  });
});

// @desc    Update news (Admin only)
// @route   PUT /api/admin/news/:id
// @access  Private (Admin)
const updateNews = asyncHandler(async (req, res) => {
  let news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  // Update news
  news = await News.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('author', 'name email avatar');
  
  res.status(200).json({
    success: true,
    message: 'Cập nhật tin tức thành công',
    data: news
  });
});

// @desc    Delete news (Admin only)
// @route   DELETE /api/admin/news/:id
// @access  Private (Admin)
const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  await news.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Xóa tin tức thành công',
    data: {}
  });
});

// @desc    Publish news (Admin only)
// @route   PATCH /api/admin/news/:id/publish
// @access  Private (Admin)
const publishNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  news.status = 'published';
  news.publishedAt = new Date();
  await news.save();
  
  res.status(200).json({
    success: true,
    message: 'Xuất bản tin tức thành công',
    data: news
  });
});

// @desc    Unpublish news (Admin only)
// @route   PATCH /api/admin/news/:id/unpublish
// @access  Private (Admin)
const unpublishNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  news.status = 'draft';
  await news.save();
  
  res.status(200).json({
    success: true,
    message: 'Gỡ xuất bản tin tức thành công',
    data: news
  });
});

// @desc    Pin/Unpin news (Admin only)
// @route   PATCH /api/admin/news/:id/pin
// @access  Private (Admin)
const togglePinNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('Không tìm thấy tin tức', 404);
  }
  
  news.isPinned = !news.isPinned;
  await news.save();
  
  res.status(200).json({
    success: true,
    message: news.isPinned ? 'Ghim tin tức thành công' : 'Bỏ ghim tin tức thành công',
    data: news
  });
});

// @desc    Get news statistics (Admin only)
// @route   GET /api/admin/news/stats
// @access  Private (Admin)
const getNewsStats = asyncHandler(async (req, res) => {
  const stats = await News.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const categoryStats = await News.aggregate([
    {
      $match: { status: 'published' }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalViews = await News.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$viewCount' }
      }
    }
  ]);
  
  const topNews = await News.find({ status: 'published' })
    .sort({ viewCount: -1 })
    .limit(5)
    .select('title viewCount publishedAt');
  
  res.status(200).json({
    success: true,
    data: {
      statusStats: stats,
      categoryStats,
      totalViews: totalViews[0]?.total || 0,
      topNews
    }
  });
});

module.exports = {
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
};
