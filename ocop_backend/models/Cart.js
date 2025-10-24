const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
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
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items must be positive']
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price must be positive']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount must be positive']
  },
  finalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Final price must be positive']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate products in items
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name images price discount stock status'
  });
  next();
});

// Calculate totals after saving
cartSchema.post('save', function(doc) {
  doc.calculateTotals();
});

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => {
    const itemPrice = item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  this.finalPrice = this.totalPrice - this.discountAmount;

  return this.save({ validateBeforeSave: false });
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  if (product.status !== 'active') {
    throw new Error('Product is not available');
  }

  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error('Insufficient stock for requested quantity');
    }
    existingItem.quantity = newQuantity;
  } else {
    this.items.push({
      product: productId,
      quantity: quantity,
      price: product.price,
      discount: product.discount
    });
  }

  await this.calculateTotals();
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item =>
    item.product.toString() !== productId.toString()
  );

  await this.calculateTotals();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  if (quantity < 1) {
    return this.removeItem(productId);
  }

  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  const item = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error('Item not found in cart');
  }

  item.quantity = quantity;
  await this.calculateTotals();
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
  this.discountAmount = 0;
  this.finalPrice = 0;

  return this.save();
};

// Static method to get user's cart
cartSchema.statics.getUserCart = async function(userId) {
  let cart = await this.findOne({ user: userId });

  if (!cart) {
    cart = await this.create({ user: userId });
  }

  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
