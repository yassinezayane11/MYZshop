require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/colors', require('./routes/colors'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'DBACH API running' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dbach')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedData();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Seed initial data
async function seedData() {
  const Admin = require('./models/Admin');
  const Product = require('./models/Product');
  const DeliveryConfig = require('./models/DeliveryConfig');
  const Category = require('./models/Category');
  const Color = require('./models/Color');
  const bcrypt = require('bcryptjs');

  // Create admin if not exists
  const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
  if (!adminExists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await Admin.create({ username: process.env.ADMIN_USERNAME || 'admin', password: hashed });
    console.log('✅ Admin created');
  }

  // Seed categories
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.insertMany([
      { name: 'T-Shirts' }, { name: 'Chemises' }, { name: 'Polos' },
      { name: 'Pulls' }, { name: 'Vestes' }, { name: 'Jeans' },
      { name: 'Pantalons' }, { name: 'Shorts' }, { name: 'Costumes' },
      { name: 'Accessoires' },
    ]);
    console.log('✅ Categories seeded');
  }

  // Seed colors
  const colorCount = await Color.countDocuments();
  if (colorCount === 0) {
    await Color.insertMany([
      { name: 'Blanc',      hex: '#f5f5f5' },
      { name: 'Noir',       hex: '#111111' },
      { name: 'Gris',       hex: '#9ca3af' },
      { name: 'Gris Chiné', hex: '#6b7280' },
      { name: 'Beige',      hex: '#d4b896' },
      { name: 'Camel',      hex: '#c68a52' },
      { name: 'Marine',     hex: '#1e3a5f' },
      { name: 'Bleu',       hex: '#3b82f6' },
      { name: 'Bleu Foncé', hex: '#1e40af' },
      { name: 'Kaki',       hex: '#8b8b6b' },
      { name: 'Rouge',      hex: '#ef4444' },
      { name: 'Bordeaux',   hex: '#7c1c1c' },
      { name: 'Charcoal',   hex: '#36454f' },
      { name: 'Vert',       hex: '#22c55e' },
      { name: 'Jaune',      hex: '#eab308' },
    ]);
    console.log('✅ Colors seeded');
  }

  // Create delivery config if not exists
  const deliveryExists = await DeliveryConfig.findOne({});
  if (!deliveryExists) {
    await DeliveryConfig.create({
      defaultPrice: 8,
      estimatedDays: '2-3',
      cityPrices: [
        { city: 'Tunis', price: 5, estimatedDays: '1-2' },
        { city: 'Sfax', price: 7, estimatedDays: '2-3' },
        { city: 'Sousse', price: 7, estimatedDays: '2-3' },
        { city: 'Bizerte', price: 8, estimatedDays: '2-4' },
        { city: 'Gabès', price: 10, estimatedDays: '3-5' },
        { city: 'Monastir', price: 7, estimatedDays: '2-3' },
        { city: 'Ben Arous', price: 5, estimatedDays: '1-2' },
        { city: 'Ariana', price: 5, estimatedDays: '1-2' },
      ],
    });
    console.log('✅ Delivery config created');
  }

  // Seed sample products
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const sampleProducts = [
      {
        name: 'Chemise Oxford Classic',
        description: 'Une chemise Oxford intemporelle, parfaite pour toutes les occasions. Tissu 100% coton de haute qualité avec une coupe moderne et confortable.',
        basePrice: 89,
        category: 'Chemises',
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
        ],
        variants: [
          { size: 'S', color: 'Blanc', stock: 10 },
          { size: 'M', color: 'Blanc', stock: 15 },
          { size: 'L', color: 'Blanc', stock: 8 },
          { size: 'XL', color: 'Blanc', stock: 5 },
          { size: 'S', color: 'Bleu', stock: 8 },
          { size: 'M', color: 'Bleu', stock: 12 },
          { size: 'L', color: 'Bleu', stock: 6 },
          { size: 'XL', color: 'Bleu', stock: 4 },
          { size: 'S', color: 'Noir', stock: 7 },
          { size: 'M', color: 'Noir', stock: 10 },
          { size: 'L', color: 'Noir', stock: 5 },
          { size: 'XL', color: 'Noir', stock: 3 },
        ],
        featured: true,
      },
      {
        name: 'Jean Slim Premium',
        description: 'Jean slim coupe moderne en denim stretch de haute qualité. Confort exceptionnel et style urbain pour toutes les morphologies.',
        basePrice: 129,
        category: 'Jeans',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
          'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600',
        ],
        variants: [
          { size: 'S', color: 'Bleu Foncé', stock: 10 },
          { size: 'M', color: 'Bleu Foncé', stock: 14 },
          { size: 'L', color: 'Bleu Foncé', stock: 9 },
          { size: 'XL', color: 'Bleu Foncé', stock: 6 },
          { size: 'S', color: 'Noir', stock: 8 },
          { size: 'M', color: 'Noir', stock: 11 },
          { size: 'L', color: 'Noir', stock: 7 },
          { size: 'XL', color: 'Noir', stock: 4 },
          { size: 'S', color: 'Gris', stock: 5 },
          { size: 'M', color: 'Gris', stock: 8 },
          { size: 'L', color: 'Gris', stock: 4 },
        ],
        featured: true,
      },
      {
        name: 'Blazer Élégance',
        description: 'Blazer structuré pour l\'homme moderne. Coupe ajustée en tissu laine mélangée. Idéal pour le bureau ou les soirées chics.',
        basePrice: 199,
        category: 'Vestes',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
        ],
        variants: [
          { size: 'S', color: 'Marine', stock: 5 },
          { size: 'M', color: 'Marine', stock: 8 },
          { size: 'L', color: 'Marine', stock: 6 },
          { size: 'XL', color: 'Marine', stock: 3 },
          { size: 'S', color: 'Charcoal', stock: 4 },
          { size: 'M', color: 'Charcoal', stock: 7 },
          { size: 'L', color: 'Charcoal', stock: 5 },
          { size: 'XL', color: 'Charcoal', stock: 2 },
        ],
        featured: true,
      },
      {
        name: 'T-Shirt Essential',
        description: 'T-shirt essentiel en coton pima de qualité supérieure. Col rond parfait, tombé impeccable. Le basique qui change tout.',
        basePrice: 45,
        category: 'T-Shirts',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
        ],
        variants: [
          { size: 'S', color: 'Blanc', stock: 20 },
          { size: 'M', color: 'Blanc', stock: 25 },
          { size: 'L', color: 'Blanc', stock: 18 },
          { size: 'XL', color: 'Blanc', stock: 12 },
          { size: 'XXL', color: 'Blanc', stock: 8 },
          { size: 'S', color: 'Noir', stock: 18 },
          { size: 'M', color: 'Noir', stock: 22 },
          { size: 'L', color: 'Noir', stock: 15 },
          { size: 'XL', color: 'Noir', stock: 10 },
          { size: 'XXL', color: 'Noir', stock: 6 },
          { size: 'S', color: 'Beige', stock: 12 },
          { size: 'M', color: 'Beige', stock: 16 },
          { size: 'L', color: 'Beige', stock: 10 },
          { size: 'XL', color: 'Beige', stock: 7 },
        ],
        featured: false,
      },
      {
        name: 'Veste Bomber Urbaine',
        description: 'Veste bomber style street urbain. Tissu satin brillant avec intérieur rayé. Le must-have de la saison.',
        basePrice: 159,
        category: 'Vestes',
        images: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
          'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600',
        ],
        variants: [
          { size: 'S', color: 'Noir', stock: 8 },
          { size: 'M', color: 'Noir', stock: 12 },
          { size: 'L', color: 'Noir', stock: 9 },
          { size: 'XL', color: 'Noir', stock: 5 },
          { size: 'S', color: 'Kaki', stock: 6 },
          { size: 'M', color: 'Kaki', stock: 9 },
          { size: 'L', color: 'Kaki', stock: 7 },
          { size: 'XL', color: 'Kaki', stock: 3 },
        ],
        featured: false,
      },
      {
        name: 'Pantalon Chino Moderne',
        description: 'Pantalon chino en coton stretch. Coupe droite légèrement ajustée. Parfait pour un look smart-casual élégant.',
        basePrice: 99,
        category: 'Pantalons',
        images: [
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
        ],
        variants: [
          { size: 'S', color: 'Beige', stock: 10 },
          { size: 'M', color: 'Beige', stock: 14 },
          { size: 'L', color: 'Beige', stock: 11 },
          { size: 'XL', color: 'Beige', stock: 7 },
          { size: 'S', color: 'Kaki', stock: 8 },
          { size: 'M', color: 'Kaki', stock: 12 },
          { size: 'L', color: 'Kaki', stock: 9 },
          { size: 'XL', color: 'Kaki', stock: 5 },
          { size: 'S', color: 'Marine', stock: 7 },
          { size: 'M', color: 'Marine', stock: 10 },
          { size: 'L', color: 'Marine', stock: 8 },
          { size: 'XL', color: 'Marine', stock: 4 },
        ],
        featured: false,
      },
      {
        name: 'Pull Cachemire Luxe',
        description: 'Pull en laine mérinos et cachemire mélangés. Douceur incomparable, chaleur optimale. Un investissement qui dure.',
        basePrice: 175,
        category: 'Pulls',
        images: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
          'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600',
        ],
        variants: [
          { size: 'S', color: 'Camel', stock: 6 },
          { size: 'M', color: 'Camel', stock: 9 },
          { size: 'L', color: 'Camel', stock: 7 },
          { size: 'XL', color: 'Camel', stock: 4 },
          { size: 'S', color: 'Bordeaux', stock: 5 },
          { size: 'M', color: 'Bordeaux', stock: 8 },
          { size: 'L', color: 'Bordeaux', stock: 6 },
          { size: 'XL', color: 'Bordeaux', stock: 3 },
          { size: 'S', color: 'Gris Chiné', stock: 7 },
          { size: 'M', color: 'Gris Chiné', stock: 10 },
          { size: 'L', color: 'Gris Chiné', stock: 8 },
          { size: 'XL', color: 'Gris Chiné', stock: 5 },
        ],
        featured: true,
      },
      {
        name: 'Polo Signature',
        description: 'Polo en piqué de coton premium. Col boutonné 3 boutons. Une allure sportive raffinée pour toutes les occasions.',
        basePrice: 69,
        category: 'Polos',
        images: [
          'https://images.unsplash.com/photo-1581791538161-8a57559169ae?w=600',
          'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
        ],
        variants: [
          { size: 'S', color: 'Blanc', stock: 12 },
          { size: 'M', color: 'Blanc', stock: 16 },
          { size: 'L', color: 'Blanc', stock: 13 },
          { size: 'XL', color: 'Blanc', stock: 8 },
          { size: 'S', color: 'Marine', stock: 10 },
          { size: 'M', color: 'Marine', stock: 14 },
          { size: 'L', color: 'Marine', stock: 11 },
          { size: 'XL', color: 'Marine', stock: 6 },
          { size: 'S', color: 'Rouge', stock: 7 },
          { size: 'M', color: 'Rouge', stock: 9 },
          { size: 'L', color: 'Rouge', stock: 6 },
          { size: 'XL', color: 'Rouge', stock: 3 },
        ],
        featured: false,
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log('✅ Sample products seeded');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
