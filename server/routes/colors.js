const router = require('express').Router();
const Color = require('../models/Color');
const auth = require('../middleware/auth');

// GET all (public – needed for product filters)
router.get('/', async (req, res) => {
  try {
    const colors = await Color.find().sort({ name: 1 });
    res.json(colors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { name, hex } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Nom requis' });
    const exists = await Color.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: 'Couleur déjà existante' });
    const color = await Color.create({ name: name.trim(), hex: hex || '#888888' });
    res.status(201).json(color);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, hex } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Nom requis' });
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), hex: hex || '#888888' },
      { new: true, runValidators: true }
    );
    if (!color) return res.status(404).json({ message: 'Couleur non trouvée' });
    res.json(color);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) return res.status(404).json({ message: 'Couleur non trouvée' });
    res.json({ message: 'Couleur supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
