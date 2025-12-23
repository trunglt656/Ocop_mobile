const express = require('express');
const router = express.Router();
const { uploadSingle, uploadImages } = require('../utils/upload');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadSingle, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
}));

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, uploadImages, asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const fileUrls = req.files.map(file => ({
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size
  }));

  res.status(200).json({
    success: true,
    data: fileUrls
  });
}));

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', protect, asyncHandler(async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_UPLOAD_PATH || './uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Delete file
  fs.unlinkSync(filePath);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  });
}));

module.exports = router;
