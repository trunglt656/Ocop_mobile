const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound unique index to prevent duplicate favorites
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Populate product details
favoriteSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'product',
    select: 'name images price discount rating stock status'
  });
  next();
});

// Static method to get user's favorites
favoriteSchema.statics.getUserFavorites = async function(userId, options = {}) {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  return this.find({ user: userId })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to check if product is in user's favorites
favoriteSchema.statics.isFavorite = async function(userId, productId) {
  const favorite = await this.findOne({ user: userId, product: productId });
  return !!favorite;
};

// Method to toggle favorite
favoriteSchema.statics.toggleFavorite = async function(userId, productId) {
  const existingFavorite = await this.findOne({ user: userId, product: productId });

  if (existingFavorite) {
    await this.deleteOne({ _id: existingFavorite._id });
    return { action: 'removed', favorite: null };
  } else {
    const favorite = await this.create({ user: userId, product: productId });
    return { action: 'added', favorite };
  }
};

module.exports = mongoose.model('Favorite', favoriteSchema);
