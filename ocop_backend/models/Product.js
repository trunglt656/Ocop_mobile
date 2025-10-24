const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  discount: {
    type: Number,
    min: [0, 'Discount must be positive'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot be more than 50 characters']
  },
  weight: {
    type: Number,
    min: [0, 'Weight must be positive']
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'box', 'pack'],
    default: 'piece'
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock must be positive'],
    default: 0
  },
  minStock: {
    type: Number,
    min: [0, 'Min stock must be positive'],
    default: 0
  },
  maxStock: {
    type: Number,
    min: [0, 'Max stock must be positive']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOCOP: {
    type: Boolean,
    default: true
  },
  ocopLevel: {
    type: String,
    enum: ['3 sao', '4 sao', '5 sao'],
    default: '3 sao'
  },
  origin: {
    province: {
      type: String,
      required: [true, 'Please add province'],
      default: 'Đồng Nai'
    },
    district: {
      type: String,
      required: [true, 'Please add district']
    },
    address: {
      type: String,
      required: [true, 'Please add address']
    }
  },
  producer: {
    name: {
      type: String,
      required: [true, 'Please add producer name']
    },
    phone: {
      type: String,
      match: [/^[0-9]{10,11}$/, 'Please add a valid phone number']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: String
  },
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
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
  totalSold: {
    type: Number,
    min: [0, 'Total sold must be positive'],
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount price
productSchema.virtual('discountPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

// Static method to get products by category
productSchema.statics.getByCategory = async function(categoryId, options = {}) {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  return this.find({ category: categoryId, status: 'active' })
    .populate('category', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to search products
productSchema.statics.search = async function(query, options = {}) {
  const { page = 1, limit = 12, category, minPrice, maxPrice, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  let searchQuery = {
    status: 'active',
    $text: { $search: query }
  };

  if (category) {
    searchQuery.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery.price = {};
    if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('category', 'name')
    .sort({ score: { $meta: 'textScore' }, ...sort.split(',').map(s => [s.startsWith('-') ? s.substring(1) : s, s.startsWith('-') ? -1 : 1]) })
    .skip(skip)
    .limit(limit);
};

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `OCOP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  // Generate slug if not exists
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
