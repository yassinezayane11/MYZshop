const router = require('express').Router();
const DeliveryConfig = require('../models/DeliveryConfig');
const auth = require('../middleware/auth');

// GET delivery config (public)
router.get('/', async (req, res) => {
  try {
    const config = await DeliveryConfig.findOne({});
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET delivery price for a city (public)
router.get('/price/:city', async (req, res) => {
  try {
    const config = await DeliveryConfig.findOne({});
    if (!config) return res.json({ price: 8, estimatedDays: '2-3' });

    const cityConfig = config.cityPrices?.find(
      c => c.city.toLowerCase() === req.params.city.toLowerCase()
    );

    res.json({
      price: cityConfig?.price ?? config.defaultPrice,
      estimatedDays: cityConfig?.estimatedDays ?? config.estimatedDays,
      city: req.params.city,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update delivery config (admin)
router.put('/', auth, async (req, res) => {
  try {
    const { defaultPrice, estimatedDays, cityPrices, freeDeliveryThreshold } = req.body;
    let config = await DeliveryConfig.findOne({});
    if (!config) {
      config = await DeliveryConfig.create({ defaultPrice, estimatedDays, cityPrices, freeDeliveryThreshold });
    } else {
      config.defaultPrice = defaultPrice ?? config.defaultPrice;
      config.estimatedDays = estimatedDays ?? config.estimatedDays;
      config.cityPrices = cityPrices ?? config.cityPrices;
      config.freeDeliveryThreshold = freeDeliveryThreshold ?? config.freeDeliveryThreshold;
      await config.save();
    }
    res.json(config);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
