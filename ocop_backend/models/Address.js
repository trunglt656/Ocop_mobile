const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name for this address'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10,11}$/, 'Please add a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    maxlength: [200, 'Address cannot be more than 200 characters']
  },
  ward: {
    type: String,
    required: [true, 'Please add ward'],
    maxlength: [50, 'Ward cannot be more than 50 characters']
  },
  district: {
    type: String,
    required: [true, 'Please add district'],
    maxlength: [50, 'District cannot be more than 50 characters']
  },
  province: {
    type: String,
    required: [true, 'Please add province'],
    maxlength: [50, 'Province cannot be more than 50 characters']
  },
  postalCode: {
    type: String,
    maxlength: [10, 'Postal code cannot be more than 10 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  instructions: {
    type: String,
    maxlength: [200, 'Instructions cannot be more than 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index for user addresses
addressSchema.index({ user: 1, isDefault: -1 });

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.ward}, ${this.district}, ${this.province}${this.postalCode ? ` ${this.postalCode}` : ''}`;
});

// Static method to get user's default address
addressSchema.statics.getDefaultAddress = async function(userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get user's addresses
addressSchema.statics.getUserAddresses = async function(userId) {
  return this.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

module.exports = mongoose.model('Address', addressSchema);
