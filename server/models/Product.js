const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  variants: [variantSchema],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.virtual('sizes').get(function () {
  return [...new Set(this.variants.map(v => v.size))];
});

productSchema.virtual('colors').get(function () {
  return [...new Set(this.variants.map(v => v.color))];
});

productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

module.exports = mongoose.model('Product', productSchema);
