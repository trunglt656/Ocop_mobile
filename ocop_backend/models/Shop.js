const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a shop name']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Shop must have an owner']
  },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contact: {
    phone: String,
    email: String
  },
  address: String,
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'active'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String, // 'business_license', 'ocop_certificate', 'tax_code', etc.
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  }],
  commission: {
    type: Number,
    default: 10, // Platform commission percentage
    min: [0, 'Commission must be positive'],
    max: [100, 'Commission cannot exceed 100%']
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
      default: 0
    },
    count: {
      type: Number,
      min: [0, 'Rating count must be positive'],
      default: 0
    }
  },
  totalProducts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String
}, {
  timestamps: true
});

shopSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Shop', shopSchema);
