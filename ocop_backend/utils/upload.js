const multer = require('multer');
const path = require('path');
const { AppError } = require('../middleware/error');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.FILE_UPLOAD_PATH || './uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 // 5MB default
  },
  fileFilter: fileFilter
});

// Multiple file upload
const uploadMultiple = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'avatar', maxCount: 1 }
]);

// Single file upload
const uploadSingle = upload.single('image');

// Multiple images upload
const uploadImages = upload.array('images', 5);

module.exports = {
  upload,
  uploadMultiple,
  uploadSingle,
  uploadImages
};

// Certificate upload (allow images + pdf)
const certFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image or PDF files are allowed for certificates!', 400), false);
  }
};

const uploadCertificate = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 },
  fileFilter: certFileFilter
}).single('certificate');

module.exports.uploadCertificate = uploadCertificate;
