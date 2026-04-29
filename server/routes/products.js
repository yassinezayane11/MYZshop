const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, size, color } = req.query;
    let query = { active: true };

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    let products = await Product.find(query).sort({ createdAt: -1 });

    // Filter by size/color in variants
    if (size) products = products.filter(p => p.variants.some(v => v.size === size && v.stock > 0));
    if (color) products = products.filter(p => p.variants.some(v => v.color === color && v.stock > 0));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET categories (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product (admin)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, basePrice, category, variants, featured } = req.body;
    const images = req.files
      ? req.files.map(f => `/uploads/${f.filename}`)
      : JSON.parse(req.body.imageUrls || '[]');

    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

    const product = await Product.create({
      name, description,
      basePrice: parseFloat(basePrice),
      category,
      images,
      variants: parsedVariants,
      featured: featured === 'true' || featured === true,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product (admin)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, basePrice, category, variants, featured, existingImages } = req.body;
    const newImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const existing = JSON.parse(existingImages || '[]');
    const images = [...existing, ...newImages];

    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

    const product = await Product.findByIdAndUpdate(req.params.id, {
      name, description,
      basePrice: parseFloat(basePrice),
      category, images,
      variants: parsedVariants,
      featured: featured === 'true' || featured === true,
    }, { new: true });

    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
