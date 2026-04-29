const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const DeliveryConfig = require('../models/DeliveryConfig');
const auth = require('../middleware/auth');

// POST create order (guest, no auth required)
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items } = req.body;

    if (!customerInfo?.name || !customerInfo?.phone || !customerInfo?.address || !customerInfo?.city) {
      return res.status(400).json({ message: 'Informations client incomplètes' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Produit ${item.productId} non trouvé` });

      const variant = product.variants.find(v => v.size === item.size && v.color === item.color);
      if (!variant) {
        return res.status(400).json({ message: `Variante ${item.size}/${item.color} non disponible pour ${product.name}` });
      }
      if (variant.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuffisant pour ${product.name} (${item.size}/${item.color}). Stock: ${variant.stock}` });
      }

      subtotal += product.basePrice * item.quantity;
      validatedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.basePrice,
      });
    }

    // Get delivery price
    const config = await DeliveryConfig.findOne({});
    let deliveryPrice = config?.defaultPrice ?? 8;
    if (config?.cityPrices) {
      const cityConfig = config.cityPrices.find(
        c => c.city.toLowerCase() === customerInfo.city.toLowerCase()
      );
      if (cityConfig) deliveryPrice = cityConfig.price;
    }
    if (config?.freeDeliveryThreshold && subtotal >= config.freeDeliveryThreshold) {
      deliveryPrice = 0;
    }

    const totalPrice = subtotal + deliveryPrice;

    const order = await Order.create({
      customerInfo,
      items: validatedItems,
      subtotal,
      deliveryPrice,
      totalPrice,
      status: 'pending',
    });

    // Deduct stock
    for (const item of validatedItems) {
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size, 'variants.color': item.color },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single order by order number (public - for confirmation page)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all orders (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single order (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update order status (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });

    order.status = status;
    order.statusHistory.push({ status, date: new Date(), note });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
