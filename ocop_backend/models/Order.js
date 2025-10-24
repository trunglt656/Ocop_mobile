const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  discount: {
    type: Number,
    min: [0, 'Discount must be positive'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be positive']
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    ward: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    postalCode: String,
    instructions: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'e_wallet', 'credit_card'],
    required: [true, 'Please select payment method']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: [0, 'Shipping fee must be positive']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount must be positive']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be positive']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Populate items products
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name images price'
  });
  next();
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `OCOP${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }

  // Set estimated delivery (3-5 days from now)
  if (!this.estimatedDelivery && this.orderStatus === 'confirmed') {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4); // 4 days from now
    this.estimatedDelivery = deliveryDate;
  }

  // Set delivered date
  if (this.orderStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }

  next();
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  const diffTime = Math.abs(now - orderDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for shipping status
orderSchema.virtual('shippingStatus').get(function() {
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy',
    'refunded': 'Đã hoàn tiền'
  };
  return statusMap[this.orderStatus] || this.orderStatus;
});

// Static method to get orders by user
orderSchema.statics.getUserOrders = async function(userId, options = {}) {
  const { page = 1, limit = 10, status, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  let query = { user: userId };
  if (status) {
    query.orderStatus = status;
  }

  return this.find(query)
    .populate('user', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = async function(status, options = {}) {
  const { page = 1, limit = 20, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  return this.find({ orderStatus: status })
    .populate('user', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        total: { $sum: '$total' }
      }
    }
  ]);
};

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.orderStatus = newStatus;

  if (notes) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `[${new Date().toISOString()}] ${newStatus}: ${notes}`;
  }

  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason) {
  if (['delivered', 'cancelled', 'refunded'].includes(this.orderStatus)) {
    throw new Error('Cannot cancel order in current status');
  }

  this.orderStatus = 'cancelled';
  this.notes = (this.notes ? this.notes + '\n' : '') + `[${new Date().toISOString()}] Cancelled: ${reason}`;

  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
